import { z } from 'zod';
import { objectIdSchema } from '../../../shared/validation/common.schemas';

export const createChannelSchema = z.object({
  name: z.string().trim().min(2).max(120),
  kind: z.enum(['whatsapp', 'email', 'sms', 'webchat', 'voice']),
  integrationId: objectIdSchema,
  externalChannelId: z.string().trim().max(120).optional(),
  endpoint: z.string().trim().max(180).optional()
});

export const listChannelsQuerySchema = z.object({
  status: z.enum(['active', 'inactive']).optional()
});
