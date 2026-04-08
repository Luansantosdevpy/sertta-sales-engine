import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(3000),
  API_PREFIX: z.string().default('/api'),
  LOG_LEVEL: z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace']).default('info'),

  MONGODB_URI: z.string().min(1),

  REDIS_URL: z.string().url(),
  REDIS_KEY_PREFIX: z.string().default('sertta'),

  JWT_SECRET: z.string().min(16),
  JWT_ISSUER: z.string().default('sertta-sales-engine'),
  JWT_AUDIENCE: z.string().default('sertta-api'),
  JWT_EXPIRES_IN: z.string().default('15m'),
  JWT_REFRESH_EXPIRES_IN: z.string().default('7d'),

  CORS_ORIGIN: z.string().default('*'),

  RATE_LIMIT_WINDOW_MS: z.coerce.number().int().positive().default(60_000),
  RATE_LIMIT_MAX: z.coerce.number().int().positive().default(120),

  IDEMPOTENCY_TTL_SECONDS: z.coerce.number().int().positive().default(60 * 30),
  WEBHOOK_DEFAULT_SIGNATURE_SECRET: z.string().optional()
});

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
  const formattedErrors = parsedEnv.error.issues
    .map((issue) => `${issue.path.join('.')}: ${issue.message}`)
    .join('; ');

  throw new Error(`Invalid environment variables: ${formattedErrors}`);
}

export const env = parsedEnv.data;
