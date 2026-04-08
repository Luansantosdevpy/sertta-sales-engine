import type { RequestHandler } from 'express';
import { apiResponse } from '../../../shared/http/api-response';
import { tenantsService } from '../application/tenants.service';

export const createTenantHandler: RequestHandler = async (req, res) => {
  const result = await tenantsService.createTenant(req.body);

  return apiResponse.success(res, {
    statusCode: 201,
    data: result
  });
};

export const getTenantHandler: RequestHandler = async (req, res) => {
  const tenantId = req.params['tenantId'];
  const result = await tenantsService.getTenantById(req.tenantContext, String(tenantId));
  return apiResponse.success(res, { data: result });
};

export const listMyTenantsHandler: RequestHandler = async (req, res) => {
  const result = await tenantsService.listUserTenants(req.auth!.userId);
  return apiResponse.success(res, { data: result });
};
