import type { RequestHandler } from 'express';
import { apiResponse } from '../../../shared/http/api-response';
import { executionsService } from '../application/executions.service';

export const listExecutionJobsHandler: RequestHandler = async (req, res) => {
  const status = req.query['status'];
  const result = await executionsService.listJobs(req.tenantContext, typeof status === 'string' ? status : undefined);
  return apiResponse.success(res, { data: result });
};

export const listExecutionLogsHandler: RequestHandler = async (req, res) => {
  const level = req.query['level'];
  const status = req.query['status'];

  const result = await executionsService.listLogs(
    req.tenantContext,
    typeof level === 'string' ? level : undefined,
    typeof status === 'string' ? status : undefined
  );

  return apiResponse.success(res, { data: result });
};
