import { Router } from 'express';
import { asyncHandler } from '../../../shared/http/async-handler';
import { authMiddleware } from '../../../shared/middleware/auth.middleware';
import { requirePermission } from '../../../shared/middleware/require-permission.middleware';
import { validateMiddleware } from '../../../shared/middleware/validate.middleware';
import { createIntegrationHandler, listIntegrationsHandler } from './integrations.controller';
import { createIntegrationSchema, listIntegrationsQuerySchema } from './integrations.schemas';

export const integrationsRouter = Router();

integrationsRouter.use(authMiddleware);
integrationsRouter.get(
  '/integrations',
  requirePermission('integration:read'),
  validateMiddleware({ query: listIntegrationsQuerySchema }),
  asyncHandler(listIntegrationsHandler)
);
integrationsRouter.post(
  '/integrations',
  requirePermission('integration:write'),
  validateMiddleware({ body: createIntegrationSchema }),
  asyncHandler(createIntegrationHandler)
);
