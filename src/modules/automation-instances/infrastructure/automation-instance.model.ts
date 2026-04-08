import { Schema, model, type InferSchemaType } from 'mongoose';
import { createTenantBaseSchema } from '../../../database/mongoose/base/tenant-base.schema';

const automationInstanceSchema = createTenantBaseSchema({
  name: { type: String, required: true, trim: true, minlength: 2, maxlength: 160 },
  status: { type: String, required: true, enum: ['active', 'paused', 'archived'], default: 'active' },
  templateId: { type: Schema.Types.ObjectId, ref: 'AutomationTemplate', required: true },
  templateVersion: { type: Number, required: true },
  triggerConfig: { type: Schema.Types.Mixed, default: {} },
  runtimeConfig: { type: Schema.Types.Mixed, default: {} },
  channelId: { type: Schema.Types.ObjectId, ref: 'Channel' },
  integrationId: { type: Schema.Types.ObjectId, ref: 'Integration' },
  lastExecutedAt: { type: Date },
  createdByUserId: { type: Schema.Types.ObjectId, ref: 'User' },
  updatedByUserId: { type: Schema.Types.ObjectId, ref: 'User' }
});

automationInstanceSchema.index({ tenantId: 1, status: 1, createdAt: -1 });
automationInstanceSchema.index({ tenantId: 1, templateId: 1, status: 1 });
automationInstanceSchema.index({ tenantId: 1, channelId: 1, status: 1 }, { sparse: true });
automationInstanceSchema.index({ tenantId: 1, integrationId: 1, status: 1 }, { sparse: true });
automationInstanceSchema.index({ tenantId: 1, name: 1 }, { unique: true });

export type AutomationInstanceDocument = InferSchemaType<typeof automationInstanceSchema>;
export const AutomationInstanceModel = model<AutomationInstanceDocument>(
  'AutomationInstance',
  automationInstanceSchema
);
