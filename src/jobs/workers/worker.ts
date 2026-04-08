import type { Worker } from 'bullmq';
import { config } from '../../config';
import { logger } from '../../infra/logger/pino';
import { createWorker } from '../../infra/queue/queue-factory';
import { jobLifecycleService } from '../lifecycle/job-lifecycle.service';
import { workerRegistrations } from './worker-registry';

const workers: Worker[] = [];

const resolveWorkerRegistrations = () => {
  const queueFilter = config.workers.queueFilter;

  if (!queueFilter || queueFilter.length === 0) {
    return workerRegistrations;
  }

  const normalizedSet = new Set(queueFilter);
  return workerRegistrations.filter((item) => normalizedSet.has(item.queueName));
};

export const startWorkers = async (): Promise<void> => {
  const activeRegistrations = resolveWorkerRegistrations();

  if (activeRegistrations.length === 0) {
    logger.warn(
      {
        configuredQueues: config.workers.queueFilter
      },
      'No worker registrations matched WORKER_QUEUES configuration'
    );
    return;
  }

  const createdWorkers = activeRegistrations.map((registration) => {
    const worker = createWorker(registration.queueName, registration.processor);

    worker.on('active', (job) => {
      if (!job) {
        return;
      }

      void jobLifecycleService.onActive(job).catch((error) => {
        logger.error({ err: error, queue: registration.queueName, jobId: job.id }, 'Failed to record active job lifecycle');
      });
    });

    worker.on('completed', (job) => {
      void jobLifecycleService.onCompleted(job).catch((error) => {
        logger.error({ err: error, queue: registration.queueName, jobId: job.id }, 'Failed to record completed job lifecycle');
      });

      logger.debug({ queue: registration.queueName, jobId: job.id }, 'Job completed');
    });

    worker.on('failed', (job, error) => {
      void jobLifecycleService.onFailed(job, error).catch((lifecycleError) => {
        logger.error(
          { err: lifecycleError, queue: registration.queueName, jobId: job?.id },
          'Failed to record failed job lifecycle'
        );
      });

      logger.error({ err: error, queue: registration.queueName, jobId: job?.id }, 'Job failed');
    });

    worker.on('stalled', (jobId) => {
      logger.warn({ queue: registration.queueName, jobId }, 'Job stalled and will be retried');
    });

    return worker;
  });

  workers.push(...createdWorkers);

  logger.info(
    {
      workerCount: workers.length,
      queues: activeRegistrations.map((item) => item.queueName)
    },
    'Workers started'
  );
};

export const stopWorkers = async (): Promise<void> => {
  await Promise.all(workers.map((worker) => worker.close()));
  workers.length = 0;
  logger.info('Workers stopped');
};
