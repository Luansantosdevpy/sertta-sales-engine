import type { RequestHandler } from 'express';
import { apiResponse } from '../../../shared/http/api-response';
import { authService } from '../application/auth.service';

export const loginHandler: RequestHandler = async (req, res) => {
  const result = await authService.login(req.body);
  return apiResponse.success(res, { data: result });
};

export const refreshTokenHandler: RequestHandler = async (req, res) => {
  const result = await authService.refresh(req.body);
  return apiResponse.success(res, { data: result });
};
