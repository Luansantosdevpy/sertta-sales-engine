import { Schema, model, type InferSchemaType } from 'mongoose';
import { createTenantBaseSchema } from '../../../database/mongoose/base/tenant-base.schema';

const integrationSchema = createTenantBaseSchema({
  name: { type: String, required: true, trim: true, minlength: 2, maxlength: 120 },
  provider: {
    type: String,
    required: true,
    enum: ['whatsapp', 'crm', 'email', 'sms', 'custom_webhook']
  },
  status: { type: String, required: true, enum: ['active', 'inactive', 'error'], default: 'active' },
  externalAccountId: { type: String, trim: true, maxlength: 120 },
  credentialsRef: { type: String, trim: true, maxlength: 180 },
  settings: {
    webhookPath: { type: String, trim: true, maxlength: 180 },
    syncEnabled: { type: Boolean, default: true }
  },
  lastSyncAt: { type: Date },
  createdByUserId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  updatedByUserId: { type: Schema.Types.ObjectId, ref: 'User' }
});

integrationSchema.index({ tenantId: 1, provider: 1, status: 1 });
integrationSchema.index({ tenantId: 1, externalAccountId: 1 }, { sparse: true });
integrationSchema.index({ tenantId: 1, name: 1 }, { unique: true });

export type IntegrationDocument = InferSchemaType<typeof integrationSchema>;
export const IntegrationModel = model<IntegrationDocument>('Integration', integrationSchema);
