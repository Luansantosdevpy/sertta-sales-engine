import type { Processor } from 'bullmq';
import type { JobEnvelope } from '../../infra/queue/job-envelope';
import { logger } from '../../infra/logger/pino';

export const baseProcessor: Processor<JobEnvelope> = async (job) => {
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
};
