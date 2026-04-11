import { Schema, model, type InferSchemaType } from 'mongoose';
import { createTenantBaseSchema } from '../../../database/mongoose/base/tenant-base.schema';

const assistantRunSchema = createTenantBaseSchema({
  sourceWebhookEventId: { type: Schema.Types.ObjectId, ref: 'WebhookEvent', required: true },
  conversationId: { type: Schema.Types.ObjectId, ref: 'Conversation' },
  contactId: { type: Schema.Types.ObjectId, ref: 'Contact' },
  intent: { type: String, required: true, maxlength: 80 },
  confidence: { type: Number, required: true, min: 0, max: 1 },
  actionType: { type: String, required: true, maxlength: 80 },
  inputMessage: { type: String, required: true, trim: true, maxlength: 4000 },
  outputMessage: { type: String, required: true, trim: true, maxlength: 4000 },
  actionResult: { type: Schema.Types.Mixed },
  correlationId: { type: String, trim: true, maxlength: 128 }
});

assistantRunSchema.index({ tenantId: 1, createdAt: -1 });
assistantRunSchema.index({ tenantId: 1, sourceWebhookEventId: 1 }, { unique: true });
assistantRunSchema.index({ tenantId: 1, intent: 1, createdAt: -1 });
assistantRunSchema.index({ tenantId: 1, actionType: 1, createdAt: -1 });
assistantRunSchema.index({ tenantId: 1, correlationId: 1, createdAt: -1 });

export type AssistantRunDocument = InferSchemaType<typeof assistantRunSchema>;
export const AssistantRunModel = model<AssistantRunDocument>('AssistantRun', assistantRunSchema);
