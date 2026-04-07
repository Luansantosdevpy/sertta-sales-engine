import { BadRequestError, TenantScopeError } from '../errors/application-errors';

export interface TenantContext {
  tenantId: string;
  actorUserId?: string;
  actorRole?: string;
}

export const resolveTenantContext = (input: {
  tenantId?: string;
  actorUserId?: string;
  actorRole?: string;
}): TenantContext => {
  if (!input.tenantId) {
    throw new BadRequestError('Tenant context is required for this operation');
  }

  const context: TenantContext = {
    tenantId: input.tenantId
  };

  if (input.actorUserId) {
    context.actorUserId = input.actorUserId;
  }

  if (input.actorRole) {
    context.actorRole = input.actorRole;
  }

  return context;
};

export const assertTenantAccess = (tenantContext: TenantContext, resourceTenantId: string): void => {
  if (tenantContext.tenantId !== resourceTenantId) {
    throw new TenantScopeError('Cross-tenant access denied', {
      tenantId: tenantContext.tenantId,
      resourceTenantId
    });
  }
};
