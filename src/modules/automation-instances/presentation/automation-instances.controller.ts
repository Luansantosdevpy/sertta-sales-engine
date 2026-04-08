import type { RequestHandler } from 'express';
import { apiResponse } from '../../../shared/http/api-response';
import { automationInstancesService } from '../application/automation-instances.service';

export const createAutomationInstanceHandler: RequestHandler = async (req, res) => {
  const result = await automationInstancesService.create(req.tenantContext, req.auth!.userId, req.body);
  return apiResponse.success(res, { statusCode: 201, data: result });
};

export const listAutomationInstancesHandler: RequestHandler = async (req, res) => {
  const status = req.query['status'];
  const result = await automationInstancesService.list(
    req.tenantContext,
    typeof status === 'string' ? status : undefined
  );
  return apiResponse.success(res, { data: result });
};

export const updateAutomationInstanceStatusHandler: RequestHandler = async (req, res) => {
  const instanceId = req.params['instanceId'];
  const status = req.body['status'];

  const result = await automationInstancesService.setStatus(
    req.tenantContext,
    String(instanceId),
    status as 'active' | 'paused' | 'archived'
  );

  return apiResponse.success(res, { data: result });
};
