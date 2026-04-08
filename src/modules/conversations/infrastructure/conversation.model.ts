import { Schema, model, type InferSchemaType } from 'mongoose';
import { createTenantBaseSchema } from '../../../database/mongoose/base/tenant-base.schema';

const conversationSchema = createTenantBaseSchema({
  status: { type: String, required: true, enum: ['open', 'pending', 'closed'], default: 'open' },
  channelId: { type: Schema.Types.ObjectId, ref: 'Channel', required: true },
  integrationId: { type: Schema.Types.ObjectId, ref: 'Integration', required: true },
  contactId: { type: Schema.Types.ObjectId, ref: 'Contact', required: true },
  subject: { type: String, trim: true, maxlength: 200 },
  assignedToUserId: { type: Schema.Types.ObjectId, ref: 'User' },
  lastMessageAt: { type: Date },
  closedAt: { type: Date },
  createdByUserId: { type: Schema.Types.ObjectId, ref: 'User' },
  updatedByUserId: { type: Schema.Types.ObjectId, ref: 'User' }
});

conversationSchema.index({ tenantId: 1, status: 1, lastMessageAt: -1 });
conversationSchema.index({ tenantId: 1, contactId: 1, createdAt: -1 });
conversationSchema.index({ tenantId: 1, channelId: 1, status: 1 });
conversationSchema.index({ tenantId: 1, integrationId: 1, status: 1 });

export type ConversationDocument = InferSchemaType<typeof conversationSchema>;
export const ConversationModel = model<ConversationDocument>('Conversation', conversationSchema);
