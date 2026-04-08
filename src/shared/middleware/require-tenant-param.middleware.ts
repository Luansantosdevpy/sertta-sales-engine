import type { NextFunction, Request, Response } from 'express';
import { ForbiddenError } from '../errors/application-errors';
import { requireTenantContext } from '../tenancy/tenant-scope';

export const requireTenantMatchParam = (paramName = 'tenantId') => {
  return (req: Request, _res: Response, next: NextFunction) => {
    const tenantContext = requireTenantContext(req.tenantContext);
    const routeTenantId = req.params[paramName];

    if (routeTenantId && routeTenantId !== tenantContext.tenantId) {
      next(new ForbiddenError('Tenant mismatch in route parameter'));
      return;
    }

    next();
  };
};
