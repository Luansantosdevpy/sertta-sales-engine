import { randomUUID } from 'node:crypto';
import type { RequestHandler } from 'express';

const REQUEST_ID_HEADER = 'x-request-id';

export const requestIdMiddleware: RequestHandler = (req, res, next) => {
  const headerRequestId = req.header(REQUEST_ID_HEADER);
  req.requestId = headerRequestId && headerRequestId.length > 0 ? headerRequestId : randomUUID();

  res.setHeader(REQUEST_ID_HEADER, req.requestId);
  next();
};
