import type { RequestHandler } from 'express';
import { apiResponse } from '../../../shared/http/api-response';
import { usersService } from '../application/users.service';

export const createUserHandler: RequestHandler = async (req, res) => {
  const result = await usersService.createUser(req.body);

  return apiResponse.success(res, {
    statusCode: 201,
    data: result
  });
};

export const getMeHandler: RequestHandler = async (req, res) => {
  const result = await usersService.getMe(req.auth!.userId);
  return apiResponse.success(res, { data: result });
};
