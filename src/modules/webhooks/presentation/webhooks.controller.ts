import type { RequestHandler } from 'express';
import { apiResponse } from '../../../shared/http/api-response';
import { webhooksService } from '../application/webhooks.service';

export const ingestWebhookHandler: RequestHandler = async (req, res) => {
  const provider = req.params['provider'] as 'whatsapp' | 'stripe' | 'hubspot' | 'custom';
  const tenantId = req.params['tenantId'] as string;

  const result = await webhooksService.ingest({
    provider,
    tenantId,
    payload: req.body as Record<string, unknown>,
    headers: req.headers as Record<string, string | string[] | undefined>,
    rawBody: req.rawBody,
    correlationId: req.correlationId
  });

  return apiResponse.success(res, {
    statusCode: 202,
    data: result
  });
};
