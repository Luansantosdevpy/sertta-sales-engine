import type { Processor } from 'bullmq';
import { logger } from '../../infra/logger/pino';
import { runJobWithContext } from '../../infra/queue/job-context';
import type { JobEnvelope } from '../../infra/queue/job-envelope';

export const baseProcessor: Processor<JobEnvelope> = async (job) => {
  await runJobWithContext(job, async () => {
    logger.info(
      {
        queue: job.queueName,
        jobId: job.id,
        tenantId: job.data.tenantId,
        correlationId: job.data.correlationId,
        idempotencyKey: job.data.idempotencyKey
      },
      'Job received'
    );
  });
};
