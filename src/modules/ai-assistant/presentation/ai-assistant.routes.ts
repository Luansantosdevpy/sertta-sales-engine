import { Router } from 'express';
import { asyncHandler } from '../../../shared/http/async-handler';
import { authMiddleware } from '../../../shared/middleware/auth.middleware';
import { requirePermission } from '../../../shared/middleware/require-permission.middleware';
import { requireTenantContextMiddleware } from '../../../shared/middleware/require-tenant-context.middleware';
import { validateMiddleware } from '../../../shared/middleware/validate.middleware';
import {
  getAssistantProfileHandler,
  listAssistantRunsHandler,
  upsertAssistantProfileHandler
} from './ai-assistant.controller';
import { upsertAssistantProfileSchema } from './ai-assistant.schemas';

export const aiAssistantRouter = Router();

aiAssistantRouter.use(authMiddleware, requireTenantContextMiddleware);

aiAssistantRouter.get('/ai-assistant/profile', requirePermission('automation:read'), asyncHandler(getAssistantProfileHandler));
aiAssistantRouter.put(
  '/ai-assistant/profile',
  requirePermission('automation:write'),
  validateMiddleware({ body: upsertAssistantProfileSchema }),
  asyncHandler(upsertAssistantProfileHandler)
);
aiAssistantRouter.get('/ai-assistant/runs', requirePermission('execution:read'), asyncHandler(listAssistantRunsHandler));
