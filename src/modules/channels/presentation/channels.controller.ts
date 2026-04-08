import type { RequestHandler } from 'express';
import { apiResponse } from '../../../shared/http/api-response';
import { channelsService } from '../application/channels.service';

export const createChannelHandler: RequestHandler = async (req, res) => {
  const result = await channelsService.create(req.tenantContext, req.auth!.userId, req.body);
  return apiResponse.success(res, { statusCode: 201, data: result });
};

export const listChannelsHandler: RequestHandler = async (req, res) => {
  const status = req.query['status'];
  const result = await channelsService.list(req.tenantContext, typeof status === 'string' ? status : undefined);
  return apiResponse.success(res, { data: result });
};
