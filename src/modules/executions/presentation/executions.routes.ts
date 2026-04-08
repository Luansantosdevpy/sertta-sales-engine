import { Router } from 'express';
import { asyncHandler } from '../../../shared/http/async-handler';
import { authMiddleware } from '../../../shared/middleware/auth.middleware';
import { requirePermission } from '../../../shared/middleware/require-permission.middleware';
import { validateMiddleware } from '../../../shared/middleware/validate.middleware';
import { listExecutionJobsHandler, listExecutionLogsHandler } from './executions.controller';
import { executionsJobsQuerySchema, executionsLogsQuerySchema } from './executions.schemas';

export const executionsRouter = Router();

executionsRouter.use(authMiddleware);
executionsRouter.get(
  '/executions/jobs',
  requirePermission('execution:read'),
  validateMiddleware({ query: executionsJobsQuerySchema }),
  asyncHandler(listExecutionJobsHandler)
);
executionsRouter.get(
  '/executions/logs',
  requirePermission('execution:read'),
  validateMiddleware({ query: executionsLogsQuerySchema }),
  asyncHandler(listExecutionLogsHandler)
);
