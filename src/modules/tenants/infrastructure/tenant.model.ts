import { Schema, model, type InferSchemaType } from 'mongoose';
import { createBaseSchema } from '../../../database/mongoose/base/base.schema';

export const TENANT_STATUSES = ['active', 'suspended', 'canceled'] as const;

const tenantSchema = createBaseSchema({
  name: { type: String, required: true, trim: true, minlength: 2, maxlength: 160 },
  slug: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
    minlength: 3,
    maxlength: 80,
    match: /^[a-z0-9-]+$/
  },
  status: { type: String, enum: TENANT_STATUSES, required: true, default: 'active' },
  planId: { type: Schema.Types.ObjectId, ref: 'Plan', required: true },
  planVersion: { type: Number, required: true, default: 1 },
  effectiveLimits: {
    maxUsers: { type: Number, required: true, default: 5 },
    maxChannels: { type: Number, required: true, default: 1 },
    maxAutomations: { type: Number, required: true, default: 10 },
    monthlyMessages: { type: Number, required: true, default: 1000 }
  },
  billingStatus: { type: String, default: 'pending' },
  ownerUserId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  suspendedAt: { type: Date },
  canceledAt: { type: Date }
});

tenantSchema.index({ slug: 1 }, { unique: true });
tenantSchema.index({ status: 1, createdAt: -1 });
tenantSchema.index({ planId: 1, status: 1 });

export type TenantDocument = InferSchemaType<typeof tenantSchema>;
export const TenantModel = model<TenantDocument>('Tenant', tenantSchema);

