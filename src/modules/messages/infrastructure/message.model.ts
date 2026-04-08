import { Schema, model, type InferSchemaType } from 'mongoose';
import { createTenantBaseSchema } from '../../../database/mongoose/base/tenant-base.schema';

const messageSchema = createTenantBaseSchema({
  conversationId: { type: Schema.Types.ObjectId, ref: 'Conversation', required: true },
  contactId: { type: Schema.Types.ObjectId, ref: 'Contact' },
  channelId: { type: Schema.Types.ObjectId, ref: 'Channel', required: true },
  integrationId: { type: Schema.Types.ObjectId, ref: 'Integration', required: true },
  direction: { type: String, required: true, enum: ['inbound', 'outbound'] },
  status: { type: String, required: true, enum: ['queued', 'sent', 'delivered', 'read', 'failed', 'received'] },
  externalMessageId: { type: String, trim: true, maxlength: 120 },
  idempotencyKey: { type: String, trim: true, maxlength: 120 },
  bodyText: { type: String, trim: true, maxlength: 10000 },
  contentType: {
    type: String,
    required: true,
    enum: ['text', 'image', 'audio', 'video', 'document', 'template'],
    default: 'text'
  },
  sentAt: { type: Date },
  deliveredAt: { type: Date },
  failedAt: { type: Date },
  errorCode: { type: String, trim: true, maxlength: 80 },
  createdByUserId: { type: Schema.Types.ObjectId, ref: 'User' }
});

messageSchema.index({ tenantId: 1, conversationId: 1, createdAt: -1 });
messageSchema.index({ tenantId: 1, contactId: 1, createdAt: -1 });
messageSchema.index({ tenantId: 1, channelId: 1, createdAt: -1 });
messageSchema.index({ tenantId: 1, integrationId: 1, status: 1, createdAt: -1 });
messageSchema.index({ tenantId: 1, status: 1, createdAt: -1 });
messageSchema.index({ tenantId: 1, direction: 1, createdAt: -1 });
messageSchema.index({ tenantId: 1, externalMessageId: 1 }, { sparse: true, unique: true });
messageSchema.index({ tenantId: 1, idempotencyKey: 1 }, { sparse: true, unique: true });

export type MessageDocument = InferSchemaType<typeof messageSchema>;
export const MessageModel = model<MessageDocument>('Message', messageSchema);
