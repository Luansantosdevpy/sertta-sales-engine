import type { Processor } from 'bullmq';
import type { JobEnvelope } from '../../infra/queue/job-envelope';
import { runJobWithContext } from '../../infra/queue/job-context';
import { logger } from '../../infra/logger/pino';

export interface OutboundMessagePayload {
  messageId: string;
  channelId: string;
  integrationId: string;
  recipient: string;
  content: string;
  automationInstanceId?: string;
}

export const outboundMessageProcessor: Processor<JobEnvelope<OutboundMessagePayload>> = async (job) => {
  await runJobWithContext(job, async () => {
    logger.info(
      {
        queue: job.queueName,
        jobId: job.id,
        eventType: job.data.eventType,
        messageId: job.data.payload.messageId,
        tenantId: job.data.tenantId,
        channelId: job.data.payload.channelId,
        correlationId: job.data.correlationId
      },
      'Processing outbound message job'
    );

    // Real provider delivery logic is intentionally decoupled and will be injected in later stages.
  });
};
