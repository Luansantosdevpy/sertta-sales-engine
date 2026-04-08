import { z } from 'zod';

export const createUserSchema = z.object({
  email: z.string().email().transform((value) => value.trim().toLowerCase()),
  fullName: z.string().trim().min(2).max(160),
  password: z.string().min(8).max(128),
  phoneNumber: z.string().trim().min(8).max(32).optional()
});
