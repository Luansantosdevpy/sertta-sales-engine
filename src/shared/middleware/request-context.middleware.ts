import type { NextFunction, Request, Response } from 'express';
import { randomUUID } from 'node:crypto';
import { requestContext } from '../context/request-context';

const REQUEST_ID_HEADER = 'x-request-id';
const CORRELATION_ID_HEADER = 'x-correlation-id';

export const requestContextMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const requestId = req.header(REQUEST_ID_HEADER) || randomUUID();
  const correlationId = req.header(CORRELATION_ID_HEADER) || requestId;

  req.requestId = requestId;
  req.correlationId = correlationId;

  res.setHeader(REQUEST_ID_HEADER, requestId);
  res.setHeader(CORRELATION_ID_HEADER, correlationId);

  requestContext.run(
    {
      requestId,
      correlationId
    },
    () => next()
  );
};
