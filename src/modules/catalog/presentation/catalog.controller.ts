import type { RequestHandler } from 'express';
import { apiResponse } from '../../../shared/http/api-response';
import { catalogService } from '../application/catalog.service';

export const createCatalogItemHandler: RequestHandler = async (req, res) => {
  const result = await catalogService.create(req.tenantContext, req.auth!.userId, req.body);
  return apiResponse.success(res, { statusCode: 201, data: result });
};

export const listCatalogItemsHandler: RequestHandler = async (req, res) => {
  const itemType = req.query['itemType'];
  const status = req.query['status'];

  const result = await catalogService.list(req.tenantContext, {
    ...(typeof itemType === 'string' ? { itemType: itemType as 'product' | 'service' } : {}),
    ...(typeof status === 'string' ? { status: status as 'active' | 'inactive' } : {})
  });

  return apiResponse.success(res, { data: result });
};
