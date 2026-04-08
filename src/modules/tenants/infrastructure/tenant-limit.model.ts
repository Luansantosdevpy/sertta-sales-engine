import { model, type InferSchemaType } from 'mongoose';
import { createTenantBaseSchema } from '../../../database/mongoose/base/tenant-base.schema';

const tenantLimitSchema = createTenantBaseSchema({
  metric: { type: String, required: true, trim: true, maxlength: 80 },
  period: { type: String, required: true, enum: ['daily', 'weekly', 'monthly', 'yearly'] },
  hardLimit: { type: Number, required: true, min: 1 },
  softLimit: { type: Number, min: 0 },
  currentUsage: { type: Number, required: true, default: 0, min: 0 },
  resetAt: { type: Date, required: true },
  source: { type: String, required: true, enum: ['plan_snapshot', 'override'], default: 'plan_snapshot' }
});

tenantLimitSchema.index({ tenantId: 1, metric: 1, period: 1 }, { unique: true });
tenantLimitSchema.index({ tenantId: 1, resetAt: 1 });

export type TenantLimitDocument = InferSchemaType<typeof tenantLimitSchema>;
export const TenantLimitModel = model<TenantLimitDocument>('TenantLimit', tenantLimitSchema);
