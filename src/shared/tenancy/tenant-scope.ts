import type { FilterQuery } from 'mongoose';
import { BadRequestError, TenantScopeError } from '../errors/application-errors';
import type { TenantContext } from './tenant-context';

export const requireTenantContext = (tenantContext?: TenantContext): TenantContext => {
  if (!tenantContext) {
    throw new BadRequestError('Tenant context is required');
  }

  return tenantContext;
};

export const withTenantScope = <T>(tenantId: string, filter: FilterQuery<T> = {}): FilterQuery<T> => {
  const filterWithTenant = filter as Record<string, unknown>;
  const existingTenantId = filterWithTenant['tenantId'];

  if (existingTenantId && String(existingTenantId) !== tenantId) {
    throw new TenantScopeError('Tenant scope override detected in query filter', {
      expectedTenantId: tenantId,
      providedTenantId: existingTenantId
    });
  }

  return {
    ...filter,
    tenantId
  } as FilterQuery<T>;
};

export const platformScope = <T>(filter: FilterQuery<T> = {}): FilterQuery<T> => {
  const candidate = filter as Record<string, unknown>;

  if (Object.hasOwn(candidate, 'tenantId')) {
    throw new BadRequestError('Platform-owned query cannot include tenantId');
  }

  return filter;
};

export const assertDocumentTenant = (
  tenantContext: TenantContext | undefined,
  documentTenantId: string | undefined
): void => {
  const scoped = requireTenantContext(tenantContext);

  if (!documentTenantId || scoped.tenantId !== documentTenantId) {
    throw new TenantScopeError('Cross-tenant document access denied', {
      tenantId: scoped.tenantId,
      documentTenantId
    });
  }
};
