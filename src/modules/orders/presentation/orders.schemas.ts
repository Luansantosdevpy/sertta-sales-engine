import { z } from 'zod';
import { objectIdSchema } from '../../../shared/validation/common.schemas';

const createOrderItemSchema = z.object({
  itemId: objectIdSchema.optional(),
  itemName: z.string().trim().min(2).max(180),
  quantity: z.number().int().positive(),
  unitPriceCents: z.number().int().nonnegative()
});

export const createOrderSchema = z.object({
  contactId: objectIdSchema.optional(),
  conversationId: objectIdSchema.optional(),
  status: z.enum(['draft', 'pending_payment', 'paid', 'canceled']).optional(),
  currency: z.string().trim().length(3).transform((value) => value.toUpperCase()),
  items: z.array(createOrderItemSchema).min(1),
  discountCents: z.number().int().nonnegative().optional(),
  externalOrderId: z.string().trim().max(120).optional(),
  notes: z.string().trim().max(3000).optional()
});

export const listOrdersQuerySchema = z.object({
  status: z.enum(['draft', 'pending_payment', 'paid', 'canceled']).optional()
});
