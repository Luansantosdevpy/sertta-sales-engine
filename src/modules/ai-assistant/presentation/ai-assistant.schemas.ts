import { z } from 'zod';

export const upsertAssistantProfileSchema = z.object({
  name: z.string().trim().min(2).max(120),
  tone: z.enum(['friendly', 'formal', 'sales']).default('friendly'),
  language: z.string().trim().min(2).max(16).default('pt-BR'),
  handoffEnabled: z.boolean().default(true),
  handoffThreshold: z.number().min(0).max(1).default(0.45),
  policy: z.object({
    canCreateOrders: z.boolean().default(true),
    canCreateAppointments: z.boolean().default(true)
  }),
  knowledgeMode: z.enum(['none', 'basic']).default('basic')
});
