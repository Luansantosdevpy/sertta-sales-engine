import { z } from 'zod';
import { slugSchema } from '../../../shared/validation/common.schemas';

export const createCatalogItemSchema = z.object({
  itemType: z.enum(['product', 'service']),
  name: z.string().trim().min(2).max(160),
  slug: slugSchema,
  description: z.string().trim().max(4000).optional(),
  sku: z.string().trim().max(80).optional(),
  currency: z.string().trim().length(3).transform((value) => value.toUpperCase()),
  priceCents: z.number().int().nonnegative(),
  tags: z.array(z.string().trim().min(1).max(40)).max(30).optional(),
  attributes: z.record(z.string().trim().max(160)).optional()
});

export const listCatalogItemsQuerySchema = z.object({
  itemType: z.enum(['product', 'service']).optional(),
  status: z.enum(['active', 'inactive']).optional()
});
