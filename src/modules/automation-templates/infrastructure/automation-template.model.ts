import { Schema, model, type InferSchemaType } from 'mongoose';
import { createBaseSchema } from '../../../database/mongoose/base/base.schema';

const automationTemplateSchema = createBaseSchema({
  scope: { type: String, required: true, enum: ['system', 'tenant'], default: 'system' },
  tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant' },
  code: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
    minlength: 2,
    maxlength: 80,
    match: /^[a-z0-9_-]+$/
  },
  name: { type: String, required: true, trim: true, maxlength: 160 },
  description: { type: String, trim: true, maxlength: 1200 },
  status: { type: String, required: true, enum: ['draft', 'published', 'archived'], default: 'draft' },
  currentVersion: { type: Number, required: true, default: 1 },
  triggerType: {
    type: String,
    required: true,
    enum: ['webhook_received', 'lead_created', 'message_received', 'schedule', 'manual']
  },
  definition: {
    steps: [
      {
        stepKey: { type: String, required: true, trim: true, maxlength: 80 },
        actionType: { type: String, required: true, trim: true, maxlength: 80 },
        config: { type: Schema.Types.Mixed, default: {} }
      }
    ],
    edges: [
      {
        from: { type: String, required: true },
        to: { type: String, required: true },
        condition: { type: Schema.Types.Mixed }
      }
    ]
  },
  createdByUserId: { type: Schema.Types.ObjectId, ref: 'User' },
  updatedByUserId: { type: Schema.Types.ObjectId, ref: 'User' }
});

automationTemplateSchema.index({ scope: 1, status: 1, createdAt: -1 });
automationTemplateSchema.index({ tenantId: 1, status: 1, createdAt: -1 });
automationTemplateSchema.index({ scope: 1, tenantId: 1, code: 1 }, { unique: true, partialFilterExpression: { scope: 'tenant' } });
automationTemplateSchema.index({ scope: 1, code: 1 }, { unique: true, partialFilterExpression: { scope: 'system' } });
automationTemplateSchema.index({ triggerType: 1, status: 1, createdAt: -1 });

export type AutomationTemplateDocument = InferSchemaType<typeof automationTemplateSchema>;
export const AutomationTemplateModel = model<AutomationTemplateDocument>(
  'AutomationTemplate',
  automationTemplateSchema
);
