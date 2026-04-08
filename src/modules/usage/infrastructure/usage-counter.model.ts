import { model, type InferSchemaType } from 'mongoose';
import { createTenantBaseSchema } from '../../../database/mongoose/base/tenant-base.schema';

const usageCounterSchema = createTenantBaseSchema({
  metric: { type: String, required: true, trim: true, maxlength: 80 },
  period: { type: String, required: true, enum: ['hourly', 'daily', 'monthly'] },
  periodStart: { type: Date, required: true },
  periodEnd: { type: Date, required: true },
  counter: { type: Number, required: true, default: 0, min: 0 },
  dimensionKey: { type: String, trim: true, maxlength: 120 },
  updatedAtBucket: { type: Date, required: true, default: () => new Date() }
});

usageCounterSchema.index({ tenantId: 1, metric: 1, period: 1, periodStart: 1, dimensionKey: 1 }, { unique: true });
usageCounterSchema.index({ tenantId: 1, metric: 1, periodStart: -1 });
usageCounterSchema.index({ tenantId: 1, updatedAtBucket: -1 });

export type UsageCounterDocument = InferSchemaType<typeof usageCounterSchema>;
export const UsageCounterModel = model<UsageCounterDocument>('UsageCounter', usageCounterSchema);
