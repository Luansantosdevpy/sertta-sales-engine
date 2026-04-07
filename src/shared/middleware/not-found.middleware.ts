import type { RequestHandler } from 'express';
import { AppError } from '../errors/app-error';

export const notFoundMiddleware: RequestHandler = (req, _res, next) => {
  next(
    new AppError({
      statusCode: 404,
      code: 'not_found',
      message: `Route ${req.method} ${req.originalUrl} not found`
    })
  );
};
