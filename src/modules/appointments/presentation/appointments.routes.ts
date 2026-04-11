import { Router } from 'express';
import { asyncHandler } from '../../../shared/http/async-handler';
import { authMiddleware } from '../../../shared/middleware/auth.middleware';
import { requirePermission } from '../../../shared/middleware/require-permission.middleware';
import { requireTenantContextMiddleware } from '../../../shared/middleware/require-tenant-context.middleware';
import { validateMiddleware } from '../../../shared/middleware/validate.middleware';
import { createAppointmentHandler, listAppointmentsHandler } from './appointments.controller';
import { createAppointmentSchema, listAppointmentsQuerySchema } from './appointments.schemas';

export const appointmentsRouter = Router();

appointmentsRouter.use(authMiddleware, requireTenantContextMiddleware);

appointmentsRouter.get(
  '/appointments',
  requirePermission('automation:read'),
  validateMiddleware({ query: listAppointmentsQuerySchema }),
  asyncHandler(listAppointmentsHandler)
);

appointmentsRouter.post(
  '/appointments',
  requirePermission('automation:write'),
  validateMiddleware({ body: createAppointmentSchema }),
  asyncHandler(createAppointmentHandler)
);
