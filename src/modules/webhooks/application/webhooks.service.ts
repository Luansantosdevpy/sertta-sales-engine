import { enqueue } from '../../../infra/queue/bullmq';
import { createJobEnvelope } from '../../../infra/queue/job-envelope';
import { webhookIngestionQueue } from '../../../infra/queue/queues';
import { logger } from '../../../infra/logger/pino';
import { IdempotencyConflictError } from '../../../shared/errors/application-errors';
import { idempotencyService } from '../../../shared/idempotency/idempotency.service';
import { normalizeWebhookEvent } from './webhook-normalizer';
import { webhooksRepository } from '../infrastructure/webhooks.repository';
import type { WebhookProvider } from '../domain/webhook-event.types';
import type { WebhookQueuePayload } from '../domain/webhook-event.types';
import { webhooksSignatureService } from './webhooks-signature.service';

export const webhooksService = {
  async ingest(params: {
    provider: WebhookProvider;
    tenantId: string;
    payload: Record<string, unknown>;
    headers: Record<string, string | string[] | undefined>;
    correlationId: string;
    rawBody: Buffer | undefined;
  }) {
    let step = 'signature-verification';

    try {
      webhooksSignatureService.verifyOrThrow({
        provider: params.provider,
        rawBody: params.rawBody,
        headers: params.headers
      });

      step = 'normalization';

      const headerIdempotency = params.headers['idempotency-key'];
      const idempotencyKeyHeader = typeof headerIdempotency === 'string' ? headerIdempotency : undefined;

      const normalized = normalizeWebhookEvent({
        provider: params.provider,
        tenantId: params.tenantId,
        payload: params.payload,
        idempotencyKeyHeader
      });

      step = 'duplicate-check';

      const duplicate = await webhooksRepository.findDuplicate(
        normalized.tenantId,
        normalized.provider,
        normalized.externalEventId,
        normalized.idempotencyKey
      );

      if (duplicate) {
        return {
          accepted: true,
          duplicate: true,
          webhookEventId: String(duplicate['_id'])
        };
      }

      step = 'idempotency-acquire';

      if (normalized.idempotencyKey) {
        try {
          await idempotencyService.assertAndAcquire({
            tenantId: normalized.tenantId,
            scope: `webhook:${normalized.provider}`,
            key: normalized.idempotencyKey
          });
        } catch (error) {
          if (error instanceof IdempotencyConflictError) {
            return {
              accepted: true,
              duplicate: true,
              webhookEventId: null
            };
          }

          // Redis/idempotency infra can fail transiently. We continue with Mongo duplicate guards.
          logger.warn(
            {
              err: error,
              tenantId: normalized.tenantId,
              provider: normalized.provider,
              idempotencyKey: normalized.idempotencyKey,
              correlationId: params.correlationId
            },
            'Idempotency acquire failed; continuing with repository-level duplicate protection'
          );
        }
      }

      step = 'store-event';

      let stored;

      try {
        stored = await webhooksRepository.createReceivedEvent(normalized, params.correlationId);
      } catch (error) {
        const duplicateKey =
          typeof error === 'object' &&
          error !== null &&
          'code' in error &&
          (error as { code?: number }).code === 11000;

        if (duplicateKey) {
          const existing = await webhooksRepository.findDuplicate(
            normalized.tenantId,
            normalized.provider,
            normalized.externalEventId,
            normalized.idempotencyKey
          );

          return {
            accepted: true,
            duplicate: true,
            webhookEventId: existing ? String(existing['_id']) : null
          };
        }

        throw error;
      }

      step = 'enqueue-job';

      const queuePayload: WebhookQueuePayload = {
        webhookEventId: String(stored['_id']),
        provider: normalized.provider,
        tenantId: normalized.tenantId,
        eventType: normalized.eventType,
        occurredAt: normalized.occurredAt,
        ...(normalized.externalEventId ? { externalEventId: normalized.externalEventId } : {}),
        ...(normalized.idempotencyKey ? { idempotencyKey: normalized.idempotencyKey } : {})
      };

      await enqueue(
        webhookIngestionQueue,
        'webhook.process',
        createJobEnvelope({
          tenantId: normalized.tenantId,
          eventType: 'webhook.received',
          payload: queuePayload,
          producer: 'webhooks.module',
          ...(normalized.idempotencyKey ? { idempotencyKey: normalized.idempotencyKey } : {})
        }),
        {
          attempts: 8,
          backoff: {
            type: 'exponential',
            delay: 2_000
          }
        }
      );

      step = 'mark-queued';

      await webhooksRepository.markQueued(String(stored['_id']));

      logger.info(
        {
          provider: normalized.provider,
          tenantId: normalized.tenantId,
          webhookEventId: String(stored['_id']),
          correlationId: params.correlationId
        },
        'Webhook accepted and queued'
      );

      return {
        accepted: true,
        duplicate: false,
        webhookEventId: String(stored['_id'])
      };
    } catch (error) {
      logger.error(
        {
          err: error,
          step,
          provider: params.provider,
          tenantId: params.tenantId,
          correlationId: params.correlationId
        },
        'Webhook ingestion failed'
      );

      throw error;
    }
  }
};
