import { z } from 'zod';

export const createKnowledgeDocumentSchema = z.object({
  title: z.string().trim().min(2).max(180),
  sourceType: z.enum(['manual', 'url', 'file', 'faq']).default('manual'),
  content: z.string().trim().min(10).max(50000),
  status: z.enum(['draft', 'active', 'archived']).optional(),
  tags: z.array(z.string().trim().min(1).max(40)).max(40).optional(),
  externalId: z.string().trim().max(120).optional()
});

export const listKnowledgeDocumentsQuerySchema = z.object({
  status: z.enum(['draft', 'active', 'archived']).optional()
});
