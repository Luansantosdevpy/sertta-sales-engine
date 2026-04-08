import { Router } from 'express';
import { asyncHandler } from '../../../shared/http/async-handler';
import { authMiddleware } from '../../../shared/middleware/auth.middleware';
import { requirePermission } from '../../../shared/middleware/require-permission.middleware';
import { validateMiddleware } from '../../../shared/middleware/validate.middleware';
import { createAutomationTemplateHandler, listAutomationTemplatesHandler } from './automation-templates.controller';
import { createAutomationTemplateSchema } from './automation-templates.schemas';

export const automationTemplatesRouter = Router();

automationTemplatesRouter.use(authMiddleware);
automationTemplatesRouter.get(
  '/automation-templates',
  requirePermission('automation:read'),
  asyncHandler(listAutomationTemplatesHandler)
);
automationTemplatesRouter.post(
  '/automation-templates',
  requirePermission('automation:write'),
  validateMiddleware({ body: createAutomationTemplateSchema }),
  asyncHandler(createAutomationTemplateHandler)
);
