import type { JobsOptions, Processor, QueueOptions, WorkerOptions } from 'bullmq';
import { Queue, Worker } from 'bullmq';
import { createBullMqConnection } from '../cache/redis-client';
import type { QueueName } from '../../shared/constants/queue-names';
import { QUEUE_CONFIG } from './queue-catalog';
import type { JobEnvelope } from './job-envelope';
import { jobLifecycleService } from '../../jobs/lifecycle/job-lifecycle.service';

const buildDefaultJobOptions = (queueName: QueueName): JobsOptions => ({
  attempts: QUEUE_CONFIG[queueName].attempts,
  backoff: {
    type: 'exponential',
    delay: QUEUE_CONFIG[queueName].backoffDelayMs
  },
  removeOnComplete: 2_000,
  removeOnFail: 5_000
});

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
        ? { jobId: `${queue.name}:${data.tenantId}:${data.eventType}:${data.idempotencyKey}` }
        : {}),
      ...options
    }
  );

  await jobLifecycleService.onEnqueued(job);
  return job;
};
