import type { Processor } from 'bullmq';
import { webhooksRepository } from '../../modules/webhooks/infrastructure/webhooks.repository';
import { logger } from '../../infra/logger/pino';
import type { JobEnvelope } from '../../infra/queue/job-envelope';
import { runJobWithContext } from '../../infra/queue/job-context';
import type { WebhookQueuePayload } from '../../modules/webhooks/domain/webhook-event.types';

export const webhookProcessor: Processor<JobEnvelope<WebhookQueuePayload>> = async (job) => {
  await runJobWithContext(job, async () => {
    const eventId = job.data.payload.webhookEventId;
    const event = await webhooksRepository.findById(eventId);

    if (!event) {
      logger.warn({ webhookEventId: eventId }, 'Webhook event not found during processing');
      return;
    }

    if (event['status'] === 'processed') {
      logger.info({ webhookEventId: eventId }, 'Webhook event already processed, skipping');
      return;
    }

    try {
      logger.info(
        {
          webhookEventId: eventId,
          provider: event['provider'],
          eventType: event['eventType'],
          queueEventType: job.data.eventType
        },
        'Processing webhook event'
      );

      await webhooksRepository.markProcessed(eventId);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown processing error';
      await webhooksRepository.markFailed(eventId, message);
      throw error;
    }
  });
};
