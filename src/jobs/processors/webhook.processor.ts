import type { Processor } from 'bullmq';
import type { JobEnvelope } from '../../infra/queue/job-envelope';
import { runJobWithContext } from '../../infra/queue/job-context';
import { logger } from '../../infra/logger/pino';
import type { WebhookQueuePayload } from '../../modules/webhooks/domain/webhook-event.types';
import { webhookLeadEventService } from '../../modules/webhooks/application/webhook-lead-event.service';
import { webhooksRepository } from '../../modules/webhooks/infrastructure/webhooks.repository';

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
      logger.info(
        {
          webhookEventId: eventId,
          provider: event['provider'],
          eventType: event['eventType'],
          queueEventType: job.data.eventType,
          tenantId: job.data.tenantId
        },
        'Processing webhook event'
      );

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
