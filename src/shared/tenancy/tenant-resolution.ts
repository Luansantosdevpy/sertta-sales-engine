import type { Request } from 'express';
import { BadRequestError, ForbiddenError } from '../errors/application-errors';

const TENANT_HEADER = 'x-tenant-id';

export const getRouteTenantId = (req: Request): string | undefined => {
  const routeTenantId = req.params['tenantId'];
  return typeof routeTenantId === 'string' && routeTenantId.length > 0 ? routeTenantId : undefined;
};

export const getHeaderTenantId = (req: Request): string | undefined => {
  const headerTenantId = req.header(TENANT_HEADER);
  return headerTenantId && headerTenantId.length > 0 ? headerTenantId : undefined;
};

export const resolveTenantIdForRequest = (req: Request): string | undefined => {
  const routeTenantId = getRouteTenantId(req);
  const headerTenantId = getHeaderTenantId(req);

  if (routeTenantId && headerTenantId && routeTenantId !== headerTenantId) {
    throw new BadRequestError('Tenant mismatch between route and header', {
      routeTenantId,
      headerTenantId
    });
  }

  return routeTenantId ?? headerTenantId ?? req.auth?.tenantId;
};

export const assertTenantMatchesAuth = (authTenantId: string | undefined, resolvedTenantId: string): void => {
  if (!authTenantId) {
    return;
  }

  if (authTenantId !== resolvedTenantId) {
    throw new ForbiddenError('Tenant in request does not match authenticated tenant', {
      authTenantId,
      resolvedTenantId
    });
  }
};
