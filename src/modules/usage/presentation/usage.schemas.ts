import { z } from 'zod';

export const usageListQuerySchema = z.object({
  metric: z.string().trim().max(80).optional()
});
