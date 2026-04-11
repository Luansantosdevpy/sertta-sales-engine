import type { Processor } from 'bullmq';
import { runJobWithContext } from '../../infra/queue/job-context';
import type { JobEnvelope } from '../../infra/queue/job-envelope';
import { logger } from '../../infra/logger/pino';
import { aiAssistantService } from '../../modules/ai-assistant/application/ai-assistant.service';
import type { AiTaskQueuePayload } from '../../modules/webhooks/domain/webhook-event.types';
import { webhooksRepository } from '../../modules/webhooks/infrastructure/webhooks.repository';

export const aiTaskProcessor: Processor<JobEnvelope<AiTaskQueuePayload>> = async (job) => {
  await runJobWithContext(job, async () => {
    try {
      await aiAssistantService.processInboundWhatsappMessage({
        tenantId: job.data.tenantId,
        webhookEventId: job.data.payload.webhookEventId,
        messageText: job.data.payload.messageText,
        recipient: job.data.payload.recipient,
        correlationId: job.data.correlationId,
        ...(job.data.payload.channelId ? { channelId: job.data.payload.channelId } : {}),
        ...(job.data.payload.integrationId ? { integrationId: job.data.payload.integrationId } : {})
      });

      await webhooksRepository.markProcessed(job.data.payload.webhookEventId);

      logger.info(
        {
          tenantId: job.data.tenantId,
          webhookEventId: job.data.payload.webhookEventId,
          queue: job.queueName,
          jobId: job.id
        },
        'AI task completed for inbound WhatsApp message'
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown AI task failure';
      await webhooksRepository.markFailed(job.data.payload.webhookEventId, message);
      throw error;
    }
  });
};
