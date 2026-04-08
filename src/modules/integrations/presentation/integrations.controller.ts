import type { RequestHandler } from 'express';
import { apiResponse } from '../../../shared/http/api-response';
import { integrationsService } from '../application/integrations.service';

export const createIntegrationHandler: RequestHandler = async (req, res) => {
  const result = await integrationsService.create(req.tenantContext, req.auth!.userId, req.body);
  return apiResponse.success(res, { statusCode: 201, data: result });
};

export const listIntegrationsHandler: RequestHandler = async (req, res) => {
  const status = req.query['status'];
  const result = await integrationsService.list(
    req.tenantContext,
    typeof status === 'string' ? status : undefined
  );
  return apiResponse.success(res, { data: result });
};
