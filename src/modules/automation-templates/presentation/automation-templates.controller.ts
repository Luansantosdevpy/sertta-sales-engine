import type { RequestHandler } from 'express';
import { apiResponse } from '../../../shared/http/api-response';
import { automationTemplatesService } from '../application/automation-templates.service';

export const createAutomationTemplateHandler: RequestHandler = async (req, res) => {
  const result = await automationTemplatesService.createTenantTemplate(req.tenantContext, req.auth!.userId, req.body);
  return apiResponse.success(res, { statusCode: 201, data: result });
};

export const listAutomationTemplatesHandler: RequestHandler = async (req, res) => {
  const result = await automationTemplatesService.listAvailable(req.tenantContext);
  return apiResponse.success(res, { data: result });
};
