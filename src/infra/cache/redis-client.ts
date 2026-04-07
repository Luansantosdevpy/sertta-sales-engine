import Redis from 'ioredis';
import { config } from '../../config';
import { logger } from '../logger/pino';

let redisClient: Redis | null = null;

const createRedisOptions = () => ({
  maxRetriesPerRequest: null,
  enableReadyCheck: true,
  keyPrefix: `${config.redis.keyPrefix}:`
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
    keyPrefix: undefined,
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

export const redisCache = {
  async get(key: string): Promise<string | null> {
    return getRedisClient().get(key);
  },

  async set(key: string, value: string, ttlSeconds?: number): Promise<void> {
    if (ttlSeconds) {
      await getRedisClient().set(key, value, 'EX', ttlSeconds);
      return;
    }

    await getRedisClient().set(key, value);
  },

  async setIfNotExists(key: string, value: string, ttlSeconds: number): Promise<boolean> {
    const result = await getRedisClient().set(key, value, 'EX', ttlSeconds, 'NX');
    return result === 'OK';
  },

  async del(key: string): Promise<void> {
    await getRedisClient().del(key);
  }
};
