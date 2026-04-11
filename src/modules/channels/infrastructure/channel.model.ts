import { Schema, model, type InferSchemaType } from 'mongoose';
import { createTenantBaseSchema } from '../../../database/mongoose/base/tenant-base.schema';

const channelSchema = createTenantBaseSchema({
  name: { type: String, required: true, trim: true, minlength: 2, maxlength: 120 },
  kind: { type: String, required: true, enum: ['whatsapp', 'email', 'sms', 'webchat', 'voice'] },
  status: { type: String, required: true, enum: ['active', 'inactive'], default: 'active' },
  integrationId: { type: Schema.Types.ObjectId, ref: 'Integration', required: true },
  externalChannelId: { type: String, trim: true, maxlength: 120 },
  endpoint: { type: String, trim: true, maxlength: 180 },
  settings: {
    timezone: { type: String, trim: true, maxlength: 64 },
    locale: { type: String, trim: true, maxlength: 16 }
  },
  createdByUserId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  updatedByUserId: { type: Schema.Types.ObjectId, ref: 'User' }
});

channelSchema.index({ tenantId: 1, integrationId: 1, status: 1 });
channelSchema.index({ tenantId: 1, kind: 1, status: 1 });
channelSchema.index({ tenantId: 1, externalChannelId: 1 }, { sparse: true });
channelSchema.index({ tenantId: 1, name: 1 }, { unique: true });

export type ChannelDocument = InferSchemaType<typeof channelSchema>;
export const ChannelModel = model<ChannelDocument>('Channel', channelSchema);
