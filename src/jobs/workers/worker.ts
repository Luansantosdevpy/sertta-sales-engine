import type { Worker } from 'bullmq';
import { createWorker } from '../../infra/queue/bullmq';
import { logger } from '../../infra/logger/pino';
import { QUEUE_NAMES } from '../../shared/constants/queue-names';
import { baseProcessor } from '../processors/base.processor';
import { webhookProcessor } from '../processors/webhook.processor';

const workers: Worker[] = [];

export const startWorkers = async (): Promise<void> => {
  const createdWorkers = [
    createWorker(QUEUE_NAMES.webhookIngestion, webhookProcessor, { concurrency: 20 }),
    createWorker(QUEUE_NAMES.automationDispatch, baseProcessor, { concurrency: 15 }),
    createWorker(QUEUE_NAMES.usageAggregation, baseProcessor, { concurrency: 10 })
  ];

  for (const worker of createdWorkers) {
    worker.on('failed', (job, error) => {
      logger.error({ err: error, queue: worker.name, jobId: job?.id }, 'Job failed');
    });

    worker.on('completed', (job) => {
      logger.debug({ queue: worker.name, jobId: job.id }, 'Job completed');
    });
  }

  workers.push(...createdWorkers);
  logger.info({ workerCount: workers.length }, 'Workers started');
};

export const stopWorkers = async (): Promise<void> => {
  await Promise.all(workers.map((worker) => worker.close()));
  workers.length = 0;
  logger.info('Workers stopped');
};
