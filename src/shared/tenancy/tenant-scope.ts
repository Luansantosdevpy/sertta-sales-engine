import type { FilterQuery } from 'mongoose';
import { BadRequestError } from '../errors/application-errors';
import type { TenantContext } from './tenant-context';

export const requireTenantContext = (tenantContext?: TenantContext): TenantContext => {
  if (!tenantContext) {
    throw new BadRequestError('Tenant context is required');
  }

  return tenantContext;
};

export const withTenantScope = <T>(tenantId: string, filter: FilterQuery<T> = {}): FilterQuery<T> => {
  return {
    ...filter,
    tenantId
  } as FilterQuery<T>;
};
