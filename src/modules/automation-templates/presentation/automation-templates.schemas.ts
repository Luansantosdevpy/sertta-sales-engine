import { z } from 'zod';
import { slugSchema } from '../../../shared/validation/common.schemas';

const automationStepSchema = z.object({
  stepKey: z.string().trim().min(1).max(80),
  actionType: z.string().trim().min(1).max(80),
  config: z.record(z.unknown()).optional()
});

const automationEdgeSchema = z.object({
  from: z.string().trim().min(1).max(80),
  to: z.string().trim().min(1).max(80),
  condition: z.record(z.unknown()).optional()
});

const automationDefinitionSchema = z.object({
  steps: z.array(automationStepSchema).min(1),
  edges: z.array(automationEdgeSchema).optional().default([])
});

export const createAutomationTemplateSchema = z.object({
  code: slugSchema,
  name: z.string().trim().min(2).max(160),
  description: z.string().trim().max(1200).optional(),
  triggerType: z.enum(['webhook_received', 'lead_created', 'message_received', 'schedule', 'manual']),
  definition: automationDefinitionSchema
});
