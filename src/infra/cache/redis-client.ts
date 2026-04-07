import Redis from 'ioredis';
import { config } from '../../config';
import { logger } from '../logger/pino';

let redisClient: Redis | null = null;

const createRedisOptions = () => ({
  maxRetriesPerRequest: null,
  enableReadyCheck: true
});

export const initRedis = async (): Promise<Redis> => {
  if (redisClient) {
    return redisClient;
  }

  redisClient = new Redis(config.redis.url, createRedisOptions());

  redisClient.on('connect', () => logger.info('Redis connected'));
  redisClient.on('error', (error) => logger.error({ err: error }, 'Redis error'));

  await redisClient.ping();
  return redisClient;
};

export const getRedisClient = (): Redis => {
  if (!redisClient) {
    throw new Error('Redis is not initialized. Call initRedis() first.');
  }

  return redisClient;
};

export const createBullMqConnection = (connectionName: string): Redis => {
  return new Redis(config.redis.url, {
    ...createRedisOptions(),
    connectionName
  });
};

export const disconnectRedis = async (): Promise<void> => {
  if (!redisClient) {
    return;
  }

  await redisClient.quit();
  redisClient = null;
  logger.info('Redis disconnected');
};
