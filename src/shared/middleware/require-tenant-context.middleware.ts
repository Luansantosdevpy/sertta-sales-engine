import type { NextFunction, Request, Response } from 'express';
import { BadRequestError } from '../errors/application-errors';

export const requireTenantContextMiddleware = (req: Request, _res: Response, next: NextFunction) => {
  if (!req.tenantContext?.tenantId) {
    next(new BadRequestError('Tenant context is required for this endpoint'));
    return;
  }

  next();
};
