import type { RequestHandler } from 'express';
import { apiResponse } from '../../../shared/http/api-response';
import { adminService } from '../application/admin.service';

export const listAdminTenantsHandler: RequestHandler = async (req, res) => {
  adminService.assertSystemAdmin(req.auth?.role);

  const result = await adminService.listTenants({
    ...(typeof req.query['status'] === 'string' ? { status: req.query['status'] } : {}),
    ...(typeof req.query['page'] === 'string' ? { page: Number(req.query['page']) } : {}),
    ...(typeof req.query['limit'] === 'string' ? { limit: Number(req.query['limit']) } : {})
  });

  return apiResponse.success(res, {
    data: result.data,
    meta: { pagination: result.pagination }
  });
};

export const listAdminUsersHandler: RequestHandler = async (req, res) => {
  adminService.assertSystemAdmin(req.auth?.role);

  const result = await adminService.listUsers({
    ...(typeof req.query['status'] === 'string' ? { status: req.query['status'] } : {}),
    ...(typeof req.query['page'] === 'string' ? { page: Number(req.query['page']) } : {}),
    ...(typeof req.query['limit'] === 'string' ? { limit: Number(req.query['limit']) } : {})
  });

  return apiResponse.success(res, {
    data: result.data,
    meta: { pagination: result.pagination }
  });
};

export const listAdminMembershipsHandler: RequestHandler = async (req, res) => {
  adminService.assertSystemAdmin(req.auth?.role);

  const result = await adminService.listTenantMemberships({
    ...(typeof req.query['tenantId'] === 'string' ? { tenantId: req.query['tenantId'] } : {}),
    ...(typeof req.query['page'] === 'string' ? { page: Number(req.query['page']) } : {}),
    ...(typeof req.query['limit'] === 'string' ? { limit: Number(req.query['limit']) } : {})
  });

  return apiResponse.success(res, {
    data: result.data,
    meta: { pagination: result.pagination }
  });
};
