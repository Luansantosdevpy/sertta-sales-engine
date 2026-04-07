import type { RequestHandler } from 'express';
import pinoHttp from 'pino-http';
import { logger } from '../../infra/logger/pino';

export const requestLoggerMiddleware: RequestHandler = pinoHttp({
  logger,
  customProps: (req) => ({ requestId: req.requestId }),
  quietReqLogger: true
});
