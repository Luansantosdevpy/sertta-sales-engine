import { UsageCounterModel } from './usage-counter.model';
import { withTenantScope } from '../../../shared/tenancy/tenant-scope';

const startOfPeriod = (period: 'hourly' | 'daily' | 'monthly'): Date => {
  const now = new Date();

  if (period === 'hourly') {
    now.setMinutes(0, 0, 0);
    return now;
  }

  if (period === 'daily') {
    now.setHours(0, 0, 0, 0);
    return now;
  }

  now.setDate(1);
  now.setHours(0, 0, 0, 0);
  return now;
};

const endOfPeriod = (start: Date, period: 'hourly' | 'daily' | 'monthly'): Date => {
  const end = new Date(start);

  if (period === 'hourly') {
    end.setHours(end.getHours() + 1);
    return end;
  }

  if (period === 'daily') {
    end.setDate(end.getDate() + 1);
    return end;
  }

  end.setMonth(end.getMonth() + 1);
  return end;
};

export const usageRepository = {
  async listByMetric(tenantId: string, metric?: string) {
    return UsageCounterModel.find(
      withTenantScope(tenantId, {
        ...(metric ? { metric } : {})
      })
    )
      .sort({ periodStart: -1 })
      .limit(200);
  },

  async incrementCounter(params: {
    tenantId: string;
    metric: string;
    period: 'hourly' | 'daily' | 'monthly';
    amount?: number;
    dimensionKey?: string;
  }) {
    const periodStart = startOfPeriod(params.period);
    const periodEnd = endOfPeriod(periodStart, params.period);

    return UsageCounterModel.findOneAndUpdate(
      withTenantScope(params.tenantId, {
        metric: params.metric,
        period: params.period,
        periodStart,
        ...(params.dimensionKey ? { dimensionKey: params.dimensionKey } : {})
      }),
      {
        $setOnInsert: {
          periodEnd,
          counter: 0
        },
        $inc: {
          counter: params.amount ?? 1
        },
        $set: {
          updatedAtBucket: new Date()
        }
      },
      {
        upsert: true,
        new: true
      }
    );
  }
};
