import { Router } from 'express';
import { asyncHandler } from '../../../shared/http/async-handler';
import { authMiddleware } from '../../../shared/middleware/auth.middleware';
import { requirePermission } from '../../../shared/middleware/require-permission.middleware';
import { requireTenantContextMiddleware } from '../../../shared/middleware/require-tenant-context.middleware';
import { validateMiddleware } from '../../../shared/middleware/validate.middleware';
import {
  createAutomationInstanceHandler,
  getAutomationInstanceHandler,
  listAutomationInstancesHandler,
  updateAutomationInstanceStatusHandler
} from './automation-instances.controller';
import {
  createAutomationInstanceSchema,
  listAutomationInstancesQuerySchema,
  updateAutomationStatusBodySchema,
  updateAutomationStatusParamsSchema
} from './automation-instances.schemas';

export const automationInstancesRouter = Router();

automationInstancesRouter.use(authMiddleware, requireTenantContextMiddleware);
automationInstancesRouter.get(
  '/automation-instances',
  requirePermission('automation:read'),
  validateMiddleware({ query: listAutomationInstancesQuerySchema }),
  asyncHandler(listAutomationInstancesHandler)
);
automationInstancesRouter.get(
  '/automation-instances/:instanceId',
  requirePermission('automation:read'),
  validateMiddleware({ params: updateAutomationStatusParamsSchema }),
  asyncHandler(getAutomationInstanceHandler)
);
automationInstancesRouter.post(
  '/automation-instances',
  requirePermission('automation:write'),
  validateMiddleware({ body: createAutomationInstanceSchema }),
  asyncHandler(createAutomationInstanceHandler)
);
automationInstancesRouter.patch(
  '/automation-instances/:instanceId/status',
  requirePermission('automation:write'),
  validateMiddleware({ params: updateAutomationStatusParamsSchema, body: updateAutomationStatusBodySchema }),
  asyncHandler(updateAutomationInstanceStatusHandler)
);
