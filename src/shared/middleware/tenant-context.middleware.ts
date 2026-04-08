import type { NextFunction, Request, Response } from 'express';
import { requestContext } from '../context/request-context';
import { resolveTenantContext } from '../tenancy/tenant-context';
import { resolveTenantIdForRequest } from '../tenancy/tenant-resolution';

export const tenantContextMiddleware = (req: Request, _res: Response, next: NextFunction) => {
  try {
    const tenantId = resolveTenantIdForRequest(req);

    if (!tenantId) {
      next();
      return;
    }

    const tenantContext = resolveTenantContext({
      tenantId,
      ...(req.auth?.userId ? { actorUserId: req.auth.userId } : {}),
      ...(req.auth?.role ? { actorRole: req.auth.role } : {})
    });

    req.tenantContext = tenantContext;
    requestContext.setTenant(tenantId);

    next();
  } catch (error) {
    next(error);
  }
};
