import { Router } from 'express';
import { asyncHandler } from '../../../shared/http/async-handler';
import { authMiddleware } from '../../../shared/middleware/auth.middleware';
import { requirePermission } from '../../../shared/middleware/require-permission.middleware';
import { validateMiddleware } from '../../../shared/middleware/validate.middleware';
import { listAdminMembershipsHandler, listAdminTenantsHandler, listAdminUsersHandler } from './admin.controller';
import {
  adminListMembershipsQuerySchema,
  adminListTenantsQuerySchema,
  adminListUsersQuerySchema
} from './admin.schemas';

export const adminRouter = Router();

adminRouter.use(authMiddleware);

adminRouter.get(
  '/admin/tenants',
  requirePermission('admin:read'),
  validateMiddleware({ query: adminListTenantsQuerySchema }),
  asyncHandler(listAdminTenantsHandler)
);

adminRouter.get(
  '/admin/users',
  requirePermission('admin:read'),
  validateMiddleware({ query: adminListUsersQuerySchema }),
  asyncHandler(listAdminUsersHandler)
);

adminRouter.get(
  '/admin/memberships',
  requirePermission('admin:read'),
  validateMiddleware({ query: adminListMembershipsQuerySchema }),
  asyncHandler(listAdminMembershipsHandler)
);
