import { Router } from 'express';
import { asyncHandler } from '../../../shared/http/async-handler';
import { apiResponse } from '../../../shared/http/api-response';
import { authMiddleware } from '../../../shared/middleware/auth.middleware';
import { validateMiddleware } from '../../../shared/middleware/validate.middleware';
import { createUserHandler, getMeHandler } from './users.controller';
import { createUserSchema } from './users.schemas';

export const usersRouter = Router();

usersRouter.post('/users', validateMiddleware({ body: createUserSchema }), asyncHandler(createUserHandler));
usersRouter.get('/users/me', authMiddleware, asyncHandler(getMeHandler));
usersRouter.get(
  '/users/ping',
  asyncHandler(async (_req, res) => apiResponse.success(res, { data: { module: 'users', ok: true } }))
);
