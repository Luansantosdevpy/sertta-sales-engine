import { Router } from 'express';
import { catalogService } from '../application/catalog.service';
import { asyncHandler } from '../../../shared/http/async-handler';
import { authMiddleware } from '../../../shared/middleware/auth.middleware';
import { requirePermission } from '../../../shared/middleware/require-permission.middleware';
import { requireTenantContextMiddleware } from '../../../shared/middleware/require-tenant-context.middleware';
import { validateMiddleware } from '../../../shared/middleware/validate.middleware';
import { createCatalogItemHandler, listCatalogItemsHandler } from './catalog.controller';
import { createCatalogItemSchema, listCatalogItemsQuerySchema } from './catalog.schemas';

export const catalogRouter = Router();

catalogRouter.use(authMiddleware, requireTenantContextMiddleware);

catalogRouter.get(
  '/catalog/items',
  requirePermission('automation:read'),
  validateMiddleware({ query: listCatalogItemsQuerySchema }),
  asyncHandler(listCatalogItemsHandler)
);

catalogRouter.post(
  '/catalog/items',
  requirePermission('automation:write'),
  validateMiddleware({ body: createCatalogItemSchema }),
  asyncHandler(createCatalogItemHandler)
);

export const catalogModule = {
  service: catalogService
};
