import { z } from 'zod';
import { objectIdSchema } from '../../../shared/validation/common.schemas';

export const createAutomationInstanceSchema = z.object({
  name: z.string().trim().min(2).max(160),
  templateId: objectIdSchema,
  templateVersion: z.number().int().positive(),
  triggerConfig: z.record(z.unknown()).optional(),
  runtimeConfig: z.record(z.unknown()).optional(),
  channelId: objectIdSchema.optional(),
  integrationId: objectIdSchema.optional()
});

export const listAutomationInstancesQuerySchema = z.object({
  status: z.enum(['active', 'paused', 'archived']).optional()
});

export const updateAutomationStatusParamsSchema = z.object({
  instanceId: objectIdSchema
});

export const updateAutomationStatusBodySchema = z.object({
  status: z.enum(['active', 'paused', 'archived'])
});
