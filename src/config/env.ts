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
  WEBHOOK_DEFAULT_SIGNATURE_SECRET: z.string().optional(),

  EXECUTION_LOG_RETENTION_DAYS: z.coerce.number().int().positive().default(45),
  WEBHOOK_EVENT_RETENTION_DAYS: z.coerce.number().int().positive().default(30),
  JOB_RECORD_RETENTION_DAYS: z.coerce.number().int().positive().default(30),

  AI_PROVIDER: z.enum(['heuristic', 'openai']).default('heuristic'),
  OPENAI_API_KEY: z.string().optional(),
  OPENAI_MODEL: z.string().default('gpt-4.1-mini'),
  OPENAI_BASE_URL: z.string().url().default('https://api.openai.com/v1'),
  OPENAI_TIMEOUT_MS: z.coerce.number().int().positive().default(12000),
  OPENAI_TEMPERATURE: z.coerce.number().min(0).max(1).default(0.2),

  SYSTEM_ADMIN_EMAILS: z.string().optional(),

  WORKER_QUEUES: z.string().optional()
});

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
  const formattedErrors = parsedEnv.error.issues
    .map((issue) => `${issue.path.join('.')}: ${issue.message}`)
    .join('; ');

  throw new Error(`Invalid environment variables: ${formattedErrors}`);
}

if (parsedEnv.data.AI_PROVIDER === 'openai' && !parsedEnv.data.OPENAI_API_KEY) {
  throw new Error('Invalid environment variables: OPENAI_API_KEY is required when AI_PROVIDER=openai');
}

export const env = parsedEnv.data;
