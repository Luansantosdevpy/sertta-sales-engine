import { z } from 'zod';
import { objectIdSchema } from '../../../shared/validation/common.schemas';

export const loginSchema = z.object({
  email: z.string().email().transform((value) => value.trim().toLowerCase()),
  password: z.string().min(8).max(128),
  tenantId: objectIdSchema
});

export const refreshTokenSchema = z.object({
  refreshToken: z.string().min(20)
});
