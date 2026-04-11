import { z } from 'zod';
import { objectIdSchema } from '../../../shared/validation/common.schemas';

export const adminListTenantsQuerySchema = z.object({
  status: z.enum(['active', 'disabled', 'suspended']).optional(),
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().optional()
});

export const adminListUsersQuerySchema = z.object({
  status: z.enum(['active', 'invited', 'disabled']).optional(),
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().optional()
});

export const adminListMembershipsQuerySchema = z.object({
  tenantId: objectIdSchema.optional(),
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().optional()
});
