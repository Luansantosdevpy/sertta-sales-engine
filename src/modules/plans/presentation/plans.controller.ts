import type { RequestHandler } from 'express';
import { apiResponse } from '../../../shared/http/api-response';
import { plansService } from '../application/plans.service';

export const listPlansHandler: RequestHandler = async (_req, res) => {
  const result = await plansService.listActivePlans();
  return apiResponse.success(res, { data: result });
};

export const getPlanHandler: RequestHandler = async (req, res) => {
  const planId = req.params['planId'];
  const result = await plansService.getPlan(String(planId));
  return apiResponse.success(res, { data: result });
};
