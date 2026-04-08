import { z } from 'zod';

export const webhookParamsSchema = z.object({
  provider: z.enum(['whatsapp', 'stripe', 'hubspot', 'custom']),
  tenantId: z.string().regex(/^[a-fA-F0-9]{24}$/)
});

export const webhookBodySchema = z.record(z.unknown());
