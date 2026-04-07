import type { ErrorRequestHandler } from 'express';
import { ZodError } from 'zod';
import { AppError } from './app-error';
import { ERROR_CODES } from './error-model';

export const errorHandlerMiddleware: ErrorRequestHandler = (error, req, res, _next) => {
  if (res.headersSent) {
    return;
  }

  if (error instanceof ZodError) {
    res.status(400).json({
      error: {
        code: ERROR_CODES.validationFailed,
        message: 'Validation failed',
        details: error.issues
      },
      requestId: req.requestId
    });
    return;
  }

  if (error instanceof AppError) {
    if (error.statusCode >= 500) {
      req.log.error({ err: error }, 'Operational error');
    }

    res.status(error.statusCode).json({
      error: {
        code: error.code,
        message: error.message,
        details: error.details
      },
      requestId: req.requestId
    });
    return;
  }

  req.log.error({ err: error }, 'Unhandled error');

  res.status(500).json({
    error: {
      code: ERROR_CODES.internalError,
      message: 'Internal server error'
    },
    requestId: req.requestId
  });
};
