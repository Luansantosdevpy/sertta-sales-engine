import { Router } from 'express';
import { asyncHandler } from '../../../shared/http/async-handler';
import { authMiddleware } from '../../../shared/middleware/auth.middleware';
import { requirePermission } from '../../../shared/middleware/require-permission.middleware';
import { requireTenantMatchParam } from '../../../shared/middleware/require-tenant-param.middleware';
import { validateMiddleware } from '../../../shared/middleware/validate.middleware';
import { createTenantHandler, getTenantHandler, listMyTenantsHandler } from './tenants.controller';
import { createTenantSchema, tenantIdParamsSchema } from './tenants.schemas';

export const tenantsRouter = Router();

tenantsRouter.post('/tenants', validateMiddleware({ body: createTenantSchema }), asyncHandler(createTenantHandler));
tenantsRouter.get('/tenants/my', authMiddleware, asyncHandler(listMyTenantsHandler));
tenantsRouter.get(
  '/tenants/:tenantId',
  authMiddleware,
  requirePermission('tenant:read'),
  validateMiddleware({ params: tenantIdParamsSchema }),
  requireTenantMatchParam('tenantId'),
  asyncHandler(getTenantHandler)
);
