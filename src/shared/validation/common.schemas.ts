import { z } from 'zod';

export const objectIdSchema = z.string().regex(/^[a-fA-F0-9]{24}$/, 'Invalid ObjectId');

export const requestIdSchema = z.string().min(10).max(128);

export const tenantIdSchema = objectIdSchema;

export const emailSchema = z.string().email().transform((value) => value.trim().toLowerCase());

export const slugSchema = z
  .string()
  .min(3)
  .max(64)
  .regex(/^[a-z0-9-]+$/, 'Slug must contain only lowercase letters, numbers, and hyphens');
