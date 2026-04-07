import { env } from './env';

const corsOrigins =
  env.CORS_ORIGIN === '*'
    ? '*'
    : env.CORS_ORIGIN.split(',')
        .map((origin) => origin.trim())
        .filter(Boolean);

export const config = {
  app: {
    env: env.NODE_ENV,
    isProduction: env.NODE_ENV === 'production',
    port: env.PORT
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
    url: env.REDIS_URL
  },
  jwt: {
    secret: env.JWT_SECRET,
    accessExpiresIn: env.JWT_EXPIRES_IN,
    refreshExpiresIn: env.JWT_REFRESH_EXPIRES_IN
  },
  rateLimit: {
    windowMs: env.RATE_LIMIT_WINDOW_MS,
    max: env.RATE_LIMIT_MAX
  }
} as const;
