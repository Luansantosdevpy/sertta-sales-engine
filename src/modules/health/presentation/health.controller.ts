import type { RequestHandler } from 'express';
import mongoose from 'mongoose';
import { getRedisClient } from '../../../infra/cache/redis-client';
import { apiResponse } from '../../../shared/http/api-response';

export const livenessHandler: RequestHandler = (_req, res) => {
  return apiResponse.success(res, {
    data: {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptimeSeconds: Math.floor(process.uptime())
    }
  });
};

export const readinessHandler: RequestHandler = async (_req, res) => {
  const mongoReady = mongoose.connection.readyState === 1;
  let redisReady = false;

  try {
    const redis = getRedisClient();
    redisReady = (await redis.ping()) === 'PONG';
  } catch {
    redisReady = false;
  }

  const ready = mongoReady && redisReady;

  return apiResponse.success(res, {
    statusCode: ready ? 200 : 503,
    data: {
      status: ready ? 'ready' : 'degraded',
      timestamp: new Date().toISOString(),
      checks: {
        mongo: mongoReady,
        redis: redisReady
      }
    }
  });
};
