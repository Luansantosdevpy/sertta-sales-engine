import { Router } from 'express';
import { asyncHandler } from '../../../shared/http/async-handler';
import { validateMiddleware } from '../../../shared/middleware/validate.middleware';
import { ingestWebhookHandler } from './webhooks.controller';
import { webhookBodySchema, webhookParamsSchema } from './webhooks.schemas';

export const webhooksRouter = Router();

webhooksRouter.post(
  '/webhooks/:provider/:tenantId',
  validateMiddleware({ params: webhookParamsSchema, body: webhookBodySchema }),
  asyncHandler(ingestWebhookHandler)
);
