import { requireTenantContext } from '../../../shared/tenancy/tenant-scope';
import type { TenantContext } from '../../../shared/tenancy/tenant-context';
import { usageRepository } from '../infrastructure/usage.repository';

export const usageService = {
  async listCounters(tenantContext: TenantContext | undefined, metric?: string) {
    const scoped = requireTenantContext(tenantContext);
    return usageRepository.listByMetric(scoped.tenantId, metric);
  },

  async trackEvent(params: {
    tenantId: string;
    metric: string;
    period?: 'hourly' | 'daily' | 'monthly';
    amount?: number;
    dimensionKey?: string;
  }) {
    return usageRepository.incrementCounter({
      tenantId: params.tenantId,
      metric: params.metric,
      period: params.period ?? 'daily',
      ...(typeof params.amount === 'number' ? { amount: params.amount } : {}),
      ...(params.dimensionKey ? { dimensionKey: params.dimensionKey } : {})
    });
  }
};
