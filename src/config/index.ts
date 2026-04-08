import { env } from './env';

const corsOrigins =
  env.CORS_ORIGIN === '*'
    ? '*'
    : env.CORS_ORIGIN.split(',')
        .map((origin) => origin.trim())
        .filter(Boolean);

const workerQueues = env.WORKER_QUEUES
  ? env.WORKER_QUEUES.split(',')
      .map((item) => item.trim())
      .filter(Boolean)
  : null;

export const config = {
  app: {
    env: env.NODE_ENV,
    isProduction: env.NODE_ENV === 'production',
    port: env.PORT,
    apiPrefix: env.API_PREFIX
  },
  logger: {
    level: env.LOG_LEVEL
  },
  http: {
    corsOrigins
  },
  database: {
    mongoUri: env.MONGODB_URI
  },
  redis: {
    url: env.REDIS_URL,
    keyPrefix: env.REDIS_KEY_PREFIX
  },
  jwt: {
    secret: env.JWT_SECRET,
    issuer: env.JWT_ISSUER,
    audience: env.JWT_AUDIENCE,
    accessExpiresIn: env.JWT_EXPIRES_IN,
    refreshExpiresIn: env.JWT_REFRESH_EXPIRES_IN
  },
  rateLimit: {
    windowMs: env.RATE_LIMIT_WINDOW_MS,
    max: env.RATE_LIMIT_MAX
  },
  idempotency: {
    ttlSeconds: env.IDEMPOTENCY_TTL_SECONDS
  },
  webhooks: {
    defaultSignatureSecret: env.WEBHOOK_DEFAULT_SIGNATURE_SECRET
  },
  retention: {
    executionLogsDays: env.EXECUTION_LOG_RETENTION_DAYS,
    webhookEventsDays: env.WEBHOOK_EVENT_RETENTION_DAYS,
    jobRecordsDays: env.JOB_RECORD_RETENTION_DAYS
  },
  workers: {
    queueFilter: workerQueues
  }
} as const;
