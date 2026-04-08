import { requireTenantContext } from '../../../shared/tenancy/tenant-scope';
import type { TenantContext } from '../../../shared/tenancy/tenant-context';
import { usageRepository } from '../infrastructure/usage.repository';

export const usageService = {
  async listCounters(tenantContext: TenantContext | undefined, metric?: string) {
    const scoped = requireTenantContext(tenantContext);
    return usageRepository.listByMetric(scoped.tenantId, metric);
  }
};
