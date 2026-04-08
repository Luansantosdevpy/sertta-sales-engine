import { Router } from 'express';
import { asyncHandler } from '../../../shared/http/async-handler';
import { authMiddleware } from '../../../shared/middleware/auth.middleware';
import { requirePermission } from '../../../shared/middleware/require-permission.middleware';
import { requireTenantContextMiddleware } from '../../../shared/middleware/require-tenant-context.middleware';
import { validateMiddleware } from '../../../shared/middleware/validate.middleware';
import { listUsageCountersHandler } from './usage.controller';
import { usageListQuerySchema } from './usage.schemas';

export const usageRouter = Router();

usageRouter.use(authMiddleware, requireTenantContextMiddleware);
usageRouter.get(
  '/usage/counters',
  requirePermission('usage:read'),
  validateMiddleware({ query: usageListQuerySchema }),
  asyncHandler(listUsageCountersHandler)
);
