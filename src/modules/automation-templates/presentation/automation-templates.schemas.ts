import { z } from 'zod';
import { slugSchema } from '../../../shared/validation/common.schemas';

export const createAutomationTemplateSchema = z.object({
  code: slugSchema,
  name: z.string().trim().min(2).max(160),
  description: z.string().trim().max(1200).optional(),
  triggerType: z.enum(['webhook_received', 'lead_created', 'message_received', 'schedule', 'manual']),
  definition: z.record(z.unknown())
});
