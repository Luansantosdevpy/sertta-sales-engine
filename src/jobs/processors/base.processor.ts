import type { Processor } from 'bullmq';
import { logger } from '../../infra/logger/pino';
import { runJobWithContext } from '../../infra/queue/job-context';
import type { JobEnvelope } from '../../infra/queue/job-envelope';

export const baseProcessor: Processor<JobEnvelope<unknown>> = async (job) => {
  await runJobWithContext(job, async () => {
    logger.info(
      {
        queue: job.queueName,
        jobId: job.id,
        tenantId: job.data.tenantId,
        correlationId: job.data.correlationId,
        eventType: job.data.eventType,
        idempotencyKey: job.data.idempotencyKey
      },
      'Job received'
    );
  });
};
