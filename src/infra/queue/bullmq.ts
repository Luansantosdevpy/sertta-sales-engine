import type { Processor, WorkerOptions } from 'bullmq';
import { Queue, Worker } from 'bullmq';
import { createBullMqConnection } from '../cache/redis-client';
import type { JobEnvelope } from './job-envelope';
import type { QueueName } from '../../shared/constants/queue-names';

export const createQueue = <TPayload extends Record<string, unknown>>(name: QueueName): Queue<JobEnvelope<TPayload>> => {
  return new Queue<JobEnvelope<TPayload>>(name, {
    connection: createBullMqConnection(`queue-${name}`),
    defaultJobOptions: {
      attempts: 5,
      backoff: {
        type: 'exponential',
        delay: 1_000
      },
      removeOnComplete: 1_000,
      removeOnFail: 5_000
    }
  });
};

export const createWorker = <TPayload extends Record<string, unknown>>(
  name: QueueName,
  processor: Processor<JobEnvelope<TPayload>>,
  options?: Omit<WorkerOptions, 'connection'>
): Worker<JobEnvelope<TPayload>> => {
  return new Worker<JobEnvelope<TPayload>>(name, processor, {
    connection: createBullMqConnection(`worker-${name}`),
    concurrency: 10,
    ...options
  });
};
