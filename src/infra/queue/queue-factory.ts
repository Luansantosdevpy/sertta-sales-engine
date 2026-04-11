import type { JobsOptions, Processor, QueueOptions, WorkerOptions } from 'bullmq';
import { Queue, Worker } from 'bullmq';
import { createBullMqConnection } from '../cache/redis-client';
import type { QueueName } from '../../shared/constants/queue-names';
import { QUEUE_CONFIG } from './queue-catalog';
import type { JobEnvelope } from './job-envelope';
import { jobLifecycleService } from '../../jobs/lifecycle/job-lifecycle.service';
import { logger } from '../logger/pino';

const buildDefaultJobOptions = (queueName: QueueName): JobsOptions => ({
  attempts: QUEUE_CONFIG[queueName].attempts,
  backoff: {
    type: 'exponential',
    delay: QUEUE_CONFIG[queueName].backoffDelayMs
  },
  removeOnComplete: 2_000,
  removeOnFail: 5_000
});

const sanitizeJobIdPart = (value: string): string => {
  return value.replace(/[:\s]/g, '_');
};

const buildJobId = (params: {
  queueName: string;
  tenantId: string;
  eventType: string;
  idempotencyKey: string;
}): string => {
  const queueName = sanitizeJobIdPart(params.queueName);
  const tenantId = sanitizeJobIdPart(params.tenantId);
  const eventType = sanitizeJobIdPart(params.eventType);
  const idempotencyKey = sanitizeJobIdPart(params.idempotencyKey);

  return `${queueName}__${tenantId}__${eventType}__${idempotencyKey}`;
};

export const createQueue = <TPayload>(
  name: QueueName,
  options?: Partial<QueueOptions>
): Queue<JobEnvelope<TPayload>> => {
  return new Queue<JobEnvelope<TPayload>>(name, {
    connection: createBullMqConnection(`queue-${name}`),
    defaultJobOptions: buildDefaultJobOptions(name),
    ...options
  });
};

export const createWorker = <TPayload>(
  name: QueueName,
  processor: Processor<JobEnvelope<TPayload>>,
  options?: Omit<WorkerOptions, 'connection'>
): Worker<JobEnvelope<TPayload>> => {
  const queueConfig = QUEUE_CONFIG[name];

  return new Worker<JobEnvelope<TPayload>>(name, processor, {
    connection: createBullMqConnection(`worker-${name}`),
    concurrency: queueConfig.concurrency,
    ...(queueConfig.limiterMax && queueConfig.limiterDurationMs
      ? {
          limiter: {
            max: queueConfig.limiterMax,
            duration: queueConfig.limiterDurationMs
          }
        }
      : {}),
    ...options
  });
};

export const enqueue = async <TPayload>(
  queue: Queue<JobEnvelope<TPayload>>,
  name: string,
  data: JobEnvelope<TPayload>,
  options?: JobsOptions
) => {
  const job = await queue.add(
    name,
    {
      ...data,
      timestamps: {
        ...data.timestamps,
        enqueuedAt: new Date().toISOString()
      }
    },
    {
      ...(data.idempotencyKey
        ? {
            jobId: buildJobId({
              queueName: queue.name,
              tenantId: data.tenantId,
              eventType: data.eventType,
              idempotencyKey: data.idempotencyKey
            })
          }
        : {}),
      ...options
    }
  );

  try {
    await jobLifecycleService.onEnqueued(job);
  } catch (error) {
    logger.error(
      {
        err: error,
        queue: queue.name,
        jobId: job.id,
        eventType: data.eventType,
        tenantId: data.tenantId
      },
      'Failed to persist job lifecycle on enqueue; job remains enqueued'
    );
  }

  return job;
};
