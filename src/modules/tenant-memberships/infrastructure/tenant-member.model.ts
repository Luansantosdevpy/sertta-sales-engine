import { Schema, model, type InferSchemaType } from 'mongoose';
import { createTenantBaseSchema } from '../../../database/mongoose/base/tenant-base.schema';

export const TENANT_MEMBER_STATUSES = ['active', 'invited', 'disabled'] as const;

const tenantMemberSchema = createTenantBaseSchema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  role: {
    type: String,
    required: true,
    enum: ['tenant_owner', 'tenant_admin', 'manager', 'operator', 'viewer']
  },
  status: { type: String, required: true, enum: TENANT_MEMBER_STATUSES, default: 'invited' },
  invitedByUserId: { type: Schema.Types.ObjectId, ref: 'User' },
  invitedAt: { type: Date },
  acceptedAt: { type: Date },
  disabledAt: { type: Date }
});

tenantMemberSchema.index({ tenantId: 1, userId: 1 }, { unique: true });
tenantMemberSchema.index({ tenantId: 1, role: 1, status: 1 });
tenantMemberSchema.index({ userId: 1, status: 1 });

export type TenantMemberDocument = InferSchemaType<typeof tenantMemberSchema>;
export const TenantMemberModel = model<TenantMemberDocument>('TenantMember', tenantMemberSchema);

