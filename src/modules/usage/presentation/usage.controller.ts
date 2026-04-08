import type { RequestHandler } from 'express';
import { apiResponse } from '../../../shared/http/api-response';
import { usageService } from '../application/usage.service';

export const listUsageCountersHandler: RequestHandler = async (req, res) => {
  const metric = req.query['metric'];
  const result = await usageService.listCounters(req.tenantContext, typeof metric === 'string' ? metric : undefined);
  return apiResponse.success(res, { data: result });
};
