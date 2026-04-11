import type { RequestHandler } from 'express';
import { apiResponse } from '../../../shared/http/api-response';
import { ordersService } from '../application/orders.service';

export const createOrderHandler: RequestHandler = async (req, res) => {
  const result = await ordersService.create(req.tenantContext, req.auth!.userId, req.body);
  return apiResponse.success(res, { statusCode: 201, data: result });
};

export const listOrdersHandler: RequestHandler = async (req, res) => {
  const status = req.query['status'];
  const result = await ordersService.list(
    req.tenantContext,
    typeof status === 'string' ? (status as 'draft' | 'pending_payment' | 'paid' | 'canceled') : undefined
  );
  return apiResponse.success(res, { data: result });
};
