import type { Processor } from 'bullmq';
import { AppError } from '../../shared/errors/app-error';
import { ERROR_CODES } from '../../shared/errors/error-model';
import { logger } from '../../infra/logger/pino';
import { runJobWithContext } from '../../infra/queue/job-context';
import type { JobEnvelope } from '../../infra/queue/job-envelope';

export const baseProcessor: Processor<JobEnvelope<unknown>> = async (job) => {
  await runJobWithContext(job, async () => {
    logger.error(
      {
        queue: job.queueName,
        jobId: job.id,
        tenantId: job.data.tenantId,
        correlationId: job.data.correlationId,
        eventType: job.data.eventType,
        idempotencyKey: job.data.idempotencyKey
      },
      'No processor implementation registered for this job payload'
    );

    throw new AppError({
      statusCode: 500,
      code: ERROR_CODES.internalError,
      message: `Processor not implemented for queue ${job.queueName} and event ${job.data.eventType}`,
      isOperational: true,
      details: {
        queueName: job.queueName,
        eventType: job.data.eventType
      }
    });
  });
};
