import { Router } from 'express';
import { asyncHandler } from '../../../shared/http/async-handler';
import { authMiddleware } from '../../../shared/middleware/auth.middleware';
import { requirePermission } from '../../../shared/middleware/require-permission.middleware';
import { requireTenantContextMiddleware } from '../../../shared/middleware/require-tenant-context.middleware';
import { validateMiddleware } from '../../../shared/middleware/validate.middleware';
import { createKnowledgeDocumentHandler, listKnowledgeDocumentsHandler } from './knowledge.controller';
import { createKnowledgeDocumentSchema, listKnowledgeDocumentsQuerySchema } from './knowledge.schemas';

export const knowledgeRouter = Router();

knowledgeRouter.use(authMiddleware, requireTenantContextMiddleware);

knowledgeRouter.get(
  '/knowledge/documents',
  requirePermission('automation:read'),
  validateMiddleware({ query: listKnowledgeDocumentsQuerySchema }),
  asyncHandler(listKnowledgeDocumentsHandler)
);

knowledgeRouter.post(
  '/knowledge/documents',
  requirePermission('automation:write'),
  validateMiddleware({ body: createKnowledgeDocumentSchema }),
  asyncHandler(createKnowledgeDocumentHandler)
);
