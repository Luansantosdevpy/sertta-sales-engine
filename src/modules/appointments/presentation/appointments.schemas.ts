import { z } from 'zod';
import { objectIdSchema } from '../../../shared/validation/common.schemas';

export const createAppointmentSchema = z.object({
  contactId: objectIdSchema.optional(),
  conversationId: objectIdSchema.optional(),
  title: z.string().trim().min(2).max(180),
  notes: z.string().trim().max(3000).optional(),
  scheduledFor: z.string().datetime(),
  timezone: z.string().trim().min(2).max(64),
  channelId: objectIdSchema.optional(),
  status: z.enum(['pending_confirmation', 'confirmed', 'completed', 'canceled']).optional()
});

export const listAppointmentsQuerySchema = z.object({
  status: z.enum(['pending_confirmation', 'confirmed', 'completed', 'canceled']).optional()
});
