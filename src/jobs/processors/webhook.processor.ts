import type { Processor } from 'bullmq';
import { enqueue } from '../../infra/queue/bullmq';
import { createJobEnvelope, type JobEnvelope } from '../../infra/queue/job-envelope';
import { inboundEventsQueue } from '../../infra/queue/queues';
import { runJobWithContext } from '../../infra/queue/job-context';
import { logger } from '../../infra/logger/pino';
import type { InboundEventQueuePayload, WebhookQueuePayload } from '../../modules/webhooks/domain/webhook-event.types';
import { webhookLeadEventService } from '../../modules/webhooks/application/webhook-lead-event.service';
import { webhooksRepository } from '../../modules/webhooks/infrastructure/webhooks.repository';

const isInboundMessageEvent = (provider: string, eventType: string): boolean => {
  const normalized = eventType.trim().toLowerCase();

  if (provider !== 'whatsapp') {
    return false;
  }

  return (
    normalized === 'message.received' ||
    normalized === 'message_received' ||
    normalized === 'whatsapp.inbound_message' ||
    normalized === 'inbound.message' ||
    (normalized.includes('message') && (normalized.includes('received') || normalized.includes('inbound')))
  );
};

export const webhookProcessor: Processor<JobEnvelope<WebhookQueuePayload>> = async (job) => {
  await runJobWithContext(job, async () => {
    const eventId = job.data.payload.webhookEventId;
    const event = await webhooksRepository.findById(eventId);

    if (!event) {
      logger.warn({ webhookEventId: eventId }, 'Webhook event not found during processing');
      return;
    }

    const currentStatus = String(event['status']);

    if (currentStatus === 'processed' || currentStatus === 'ignored') {
      logger.info({ webhookEventId: eventId, status: currentStatus }, 'Webhook event already finalized, skipping');
      return;
    }

    try {
      const provider = String(event['provider']);
      const eventType = String(event['eventType']);

      logger.info(
        {
          webhookEventId: eventId,
          provider,
          eventType,
          queueEventType: job.data.eventType,
          tenantId: job.data.tenantId
        },
        'Processing webhook event'
      );

      if (isInboundMessageEvent(provider, eventType)) {
        const inboundPayload: InboundEventQueuePayload = {
          webhookEventId: eventId,
          provider: provider as InboundEventQueuePayload['provider'],
          tenantId: job.data.tenantId,
          eventType,
          occurredAt: new Date().toISOString()
        };

        await enqueue(
          inboundEventsQueue,
          'inbound.message.route',
          createJobEnvelope({
            tenantId: job.data.tenantId,
            eventType: 'inbound.message.received',
            payload: inboundPayload,
            idempotencyKey: `${eventId}:inbound-route`,
            producer: 'webhook.processor'
          })
        );

        logger.info(
          {
            webhookEventId: eventId,
            tenantId: job.data.tenantId
          },
          'Webhook message event routed to inbound-events queue'
        );

        return;
      }

      const result = await webhookLeadEventService.processWebhookEvent({
        tenantId: job.data.tenantId,
        webhookEventId: eventId,
        correlationId: job.data.correlationId
      });

      if (result.status === 'processed') {
        await webhooksRepository.markProcessed(eventId);
      }

      logger.info(
        {
          webhookEventId: eventId,
          resultStatus: result.status,
          contactId: result.contactId,
          created: result.created
        },
        'Webhook processor result'
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown processing error';
      await webhooksRepository.markFailed(eventId, message);
      throw error;
    }
  });
};
