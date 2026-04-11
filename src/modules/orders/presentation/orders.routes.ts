import { Router } from 'express';
import { asyncHandler } from '../../../shared/http/async-handler';
import { authMiddleware } from '../../../shared/middleware/auth.middleware';
import { requirePermission } from '../../../shared/middleware/require-permission.middleware';
import { requireTenantContextMiddleware } from '../../../shared/middleware/require-tenant-context.middleware';
import { validateMiddleware } from '../../../shared/middleware/validate.middleware';
import { createOrderHandler, listOrdersHandler } from './orders.controller';
import { createOrderSchema, listOrdersQuerySchema } from './orders.schemas';

export const ordersRouter = Router();

ordersRouter.use(authMiddleware, requireTenantContextMiddleware);

ordersRouter.get(
  '/orders',
  requirePermission('automation:read'),
  validateMiddleware({ query: listOrdersQuerySchema }),
  asyncHandler(listOrdersHandler)
);

ordersRouter.post(
  '/orders',
  requirePermission('automation:write'),
  validateMiddleware({ body: createOrderSchema }),
  asyncHandler(createOrderHandler)
);
