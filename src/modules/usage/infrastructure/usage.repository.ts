import { UsageCounterModel } from './usage-counter.model';
import { withTenantScope } from '../../../shared/tenancy/tenant-scope';

export const usageRepository = {
  async listByMetric(tenantId: string, metric?: string) {
    return UsageCounterModel.find(
      withTenantScope(tenantId, {
        ...(metric ? { metric } : {})
      })
    )
      .sort({ periodStart: -1 })
      .limit(200)
      ;
  }
};

