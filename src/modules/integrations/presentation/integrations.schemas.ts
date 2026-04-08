import { z } from 'zod';

export const createIntegrationSchema = z.object({
  name: z.string().trim().min(2).max(120),
  provider: z.enum(['whatsapp', 'crm', 'email', 'sms', 'custom_webhook']),
  externalAccountId: z.string().trim().max(120).optional(),
  credentialsRef: z.string().trim().max(180).optional()
});

export const listIntegrationsQuerySchema = z.object({
  status: z.enum(['active', 'inactive', 'error']).optional()
});
