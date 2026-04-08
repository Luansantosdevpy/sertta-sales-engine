import { Router } from 'express';
import { asyncHandler } from '../../../shared/http/async-handler';
import { authMiddleware } from '../../../shared/middleware/auth.middleware';
import { requirePermission } from '../../../shared/middleware/require-permission.middleware';
import { requireTenantContextMiddleware } from '../../../shared/middleware/require-tenant-context.middleware';
import { validateMiddleware } from '../../../shared/middleware/validate.middleware';
import { createChannelHandler, listChannelsHandler } from './channels.controller';
import { createChannelSchema, listChannelsQuerySchema } from './channels.schemas';

export const channelsRouter = Router();

channelsRouter.use(authMiddleware, requireTenantContextMiddleware);
channelsRouter.get(
  '/channels',
  requirePermission('integration:read'),
  validateMiddleware({ query: listChannelsQuerySchema }),
  asyncHandler(listChannelsHandler)
);
channelsRouter.post(
  '/channels',
  requirePermission('integration:write'),
  validateMiddleware({ body: createChannelSchema }),
  asyncHandler(createChannelHandler)
);
