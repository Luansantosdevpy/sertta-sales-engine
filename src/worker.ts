import { disconnectRedis, initRedis } from './infra/cache/redis-client';
import { logger } from './infra/logger/pino';
import { startWorkers, stopWorkers } from './jobs/workers/worker';

const bootstrapWorker = async (): Promise<void> => {
  await initRedis();
  await startWorkers();

  const shutdown = async (signal: NodeJS.Signals) => {
    logger.info({ signal }, 'Worker shutdown started');
    await stopWorkers();
    await disconnectRedis();
    logger.info('Worker shutdown complete');
    process.exit(0);
  };

  process.on('SIGINT', () => void shutdown('SIGINT'));
  process.on('SIGTERM', () => void shutdown('SIGTERM'));
};

void bootstrapWorker().catch((error: unknown) => {
  logger.fatal({ err: error }, 'Worker bootstrap failed');
  process.exit(1);
});
