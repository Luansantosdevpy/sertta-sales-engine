import { z } from 'zod';

export const executionsJobsQuerySchema = z.object({
  status: z.enum(['queued', 'processing', 'completed', 'failed', 'canceled']).optional()
});

export const executionsLogsQuerySchema = z.object({
  level: z.enum(['debug', 'info', 'warn', 'error']).optional(),
  status: z.enum(['started', 'step_success', 'step_failed', 'finished']).optional()
});
