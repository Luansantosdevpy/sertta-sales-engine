import type { RequestHandler } from 'express';
import type { AnyZodObject } from 'zod';
import { ValidationError } from '../errors/application-errors';

interface ValidationSchemas {
  body?: AnyZodObject;
  query?: AnyZodObject;
  params?: AnyZodObject;
}

export const validateMiddleware = (schemas: ValidationSchemas): RequestHandler => {
  return async (req, _res, next) => {
    try {
      if (schemas.body) {
        req.body = await schemas.body.parseAsync(req.body);
      }

      if (schemas.query) {
        req.query = await schemas.query.parseAsync(req.query);
      }

      if (schemas.params) {
        req.params = await schemas.params.parseAsync(req.params);
      }

      next();
    } catch (error) {
      if (error instanceof Error) {
        next(new ValidationError(error.message, { cause: error }));
        return;
      }

      next(error);
    }
  };
};
