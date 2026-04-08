import { z } from 'zod';
import { objectIdSchema, slugSchema } from '../../../shared/validation/common.schemas';

export const createTenantSchema = z.object({
  name: z.string().trim().min(2).max(160),
  slug: slugSchema,
  planId: objectIdSchema,
  ownerUserId: objectIdSchema
});

export const tenantIdParamsSchema = z.object({
  tenantId: objectIdSchema
});
