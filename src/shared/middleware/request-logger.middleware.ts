import type { RequestHandler } from 'express';
import pinoHttp from 'pino-http';
import { logger } from '../../infra/logger/pino';

export const requestLoggerMiddleware: RequestHandler = pinoHttp({
  logger,
  genReqId: (req, res) => {
    const requestId = req.requestId;
    res.setHeader('x-request-id', requestId);
    return requestId;
  },
  customProps: (req) => ({
    requestId: req.requestId,
    correlationId: req.correlationId,
    tenantId: req.tenantContext?.tenantId
  }),
  quietReqLogger: true
});
