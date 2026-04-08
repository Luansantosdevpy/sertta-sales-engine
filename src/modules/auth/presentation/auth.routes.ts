import { Router } from 'express';
import { asyncHandler } from '../../../shared/http/async-handler';
import { validateMiddleware } from '../../../shared/middleware/validate.middleware';
import { authMiddleware } from '../../../shared/middleware/auth.middleware';
import { apiResponse } from '../../../shared/http/api-response';
import { loginHandler, refreshTokenHandler } from './auth.controller';
import { loginSchema, refreshTokenSchema } from './auth.schemas';

export const authRouter = Router();

authRouter.post('/auth/login', validateMiddleware({ body: loginSchema }), asyncHandler(loginHandler));
authRouter.post('/auth/refresh', validateMiddleware({ body: refreshTokenSchema }), asyncHandler(refreshTokenHandler));
authRouter.get(
  '/auth/me',
  authMiddleware,
  asyncHandler(async (req, res) => {
    return apiResponse.success(res, {
      data: {
        userId: req.auth?.userId,
        tenantId: req.auth?.tenantId,
        role: req.auth?.role,
        permissions: req.auth?.permissions
      }
    });
  })
);
