import { createServer } from 'node:http';
import { createApp } from './app';
import { config } from './config';
import { connectMongo, disconnectMongo } from './database/mongoose/connection';
import { disconnectRedis, initRedis } from './infra/cache/redis-client';
import { logger } from './infra/logger/pino';

const bootstrap = async (): Promise<void> => {
  await connectMongo();
  await initRedis();

  const app = createApp();
  const server = createServer(app);

  server.listen(config.app.port, () => {
    logger.info({ port: config.app.port }, 'API server listening');
  });

  const shutdown = async (signal: NodeJS.Signals) => {
    logger.info({ signal }, 'Graceful shutdown started');

    server.close(async (error) => {
      if (error) {
        logger.error({ err: error }, 'HTTP server close failed');
      }

      await disconnectMongo();
      await disconnectRedis();
      logger.info('Shutdown complete');
      process.exit(error ? 1 : 0);
    });
  };

  process.on('SIGINT', () => void shutdown('SIGINT'));
  process.on('SIGTERM', () => void shutdown('SIGTERM'));
};

void bootstrap().catch((error: unknown) => {
  logger.fatal({ err: error }, 'API bootstrap failed');
  process.exit(1);
});
