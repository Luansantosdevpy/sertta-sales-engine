import { model, type InferSchemaType } from 'mongoose';
import { createTenantBaseSchema } from '../../../database/mongoose/base/tenant-base.schema';

const assistantProfileSchema = createTenantBaseSchema({
  name: { type: String, required: true, trim: true, maxlength: 120 },
  tone: { type: String, required: true, enum: ['friendly', 'formal', 'sales'], default: 'friendly' },
  language: { type: String, required: true, trim: true, maxlength: 16, default: 'pt-BR' },
  handoffEnabled: { type: Boolean, required: true, default: true },
  handoffThreshold: { type: Number, required: true, min: 0, max: 1, default: 0.45 },
  policy: {
    canCreateOrders: { type: Boolean, required: true, default: true },
    canCreateAppointments: { type: Boolean, required: true, default: true }
  },
  knowledgeMode: { type: String, required: true, enum: ['none', 'basic'], default: 'basic' },
  createdByUserId: { type: String, required: true }
});

assistantProfileSchema.index({ tenantId: 1 }, { unique: true });

export type AssistantProfileDocument = InferSchemaType<typeof assistantProfileSchema>;
export const AssistantProfileModel = model<AssistantProfileDocument>('AssistantProfile', assistantProfileSchema);
