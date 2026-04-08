import { requireTenantContext } from '../../../shared/tenancy/tenant-scope';
import type { TenantContext } from '../../../shared/tenancy/tenant-context';
import { executionsRepository } from '../infrastructure/executions.repository';

export const executionsService = {
  async listJobs(tenantContext: TenantContext | undefined, status?: string) {
    const scoped = requireTenantContext(tenantContext);
    return executionsRepository.listJobs(scoped.tenantId, status);
  },

  async listLogs(tenantContext: TenantContext | undefined, level?: string, status?: string) {
    const scoped = requireTenantContext(tenantContext);
    return executionsRepository.listLogs(scoped.tenantId, level, status);
  }
};
