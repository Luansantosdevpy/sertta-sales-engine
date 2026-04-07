import { randomUUID } from 'node:crypto';
import { redisCache } from '../../infra/cache/redis-client';
import { IdempotencyConflictError } from '../errors/application-errors';

export interface IdempotencyAcquireParams {
  tenantId: string;
  scope: string;
  key: string;
  ttlSeconds?: number;
}

const buildIdempotencyCacheKey = (params: IdempotencyAcquireParams): string => {
  return `idempotency:${params.tenantId}:${params.scope}:${params.key}`;
};

export const idempotencyService = {
  async assertAndAcquire(params: IdempotencyAcquireParams): Promise<string> {
    const token = randomUUID();
    const cacheKey = buildIdempotencyCacheKey(params);
    const ttlSeconds = params.ttlSeconds ?? 60 * 30;

    const acquired = await redisCache.setIfNotExists(cacheKey, token, ttlSeconds);

    if (!acquired) {
      throw new IdempotencyConflictError('Duplicated idempotent request', {
        tenantId: params.tenantId,
        scope: params.scope,
        key: params.key
      });
    }

    return token;
  },

  async release(params: IdempotencyAcquireParams): Promise<void> {
    const cacheKey = buildIdempotencyCacheKey(params);
    await redisCache.del(cacheKey);
  }
};
