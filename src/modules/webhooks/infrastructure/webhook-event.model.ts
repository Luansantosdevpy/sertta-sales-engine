import { Schema, model, type InferSchemaType } from 'mongoose';
import { createTenantBaseSchema } from '../../../database/mongoose/base/tenant-base.schema';

const webhookEventSchema = createTenantBaseSchema({
  provider: {
    type: String,
    required: true,
    enum: ['whatsapp', 'stripe', 'hubspot', 'custom']
  },
  eventType: { type: String, required: true, trim: true, maxlength: 120 },
  status: {
    type: String,
    required: true,
    enum: ['received', 'queued', 'processed', 'ignored', 'failed'],
    default: 'received'
  },
  externalEventId: { type: String, trim: true, maxlength: 180 },
  idempotencyKey: { type: String, trim: true, maxlength: 120 },
  normalizationVersion: { type: Number, required: true, default: 1 },
  processingAttempts: { type: Number, required: true, default: 0, min: 0 },
  integrationId: { type: Schema.Types.ObjectId, ref: 'Integration' },
  channelId: { type: Schema.Types.ObjectId, ref: 'Channel' },
  correlationId: { type: String, trim: true, maxlength: 128 },
  payload: { type: Schema.Types.Mixed, required: true },
  normalized: { type: Schema.Types.Mixed, required: true },
  receivedAt: { type: Date, required: true, default: () => new Date() },
  queuedAt: { type: Date },
  processedAt: { type: Date },
  failedAt: { type: Date },
  errorMessage: { type: String, trim: true, maxlength: 2000 }
});

webhookEventSchema.index({ tenantId: 1, provider: 1, status: 1, createdAt: -1 });
webhookEventSchema.index({ tenantId: 1, integrationId: 1, createdAt: -1 }, { sparse: true });
webhookEventSchema.index({ tenantId: 1, channelId: 1, createdAt: -1 }, { sparse: true });
webhookEventSchema.index({ tenantId: 1, externalEventId: 1, provider: 1 }, { sparse: true, unique: true });
webhookEventSchema.index({ tenantId: 1, idempotencyKey: 1 }, { sparse: true, unique: true });
webhookEventSchema.index({ tenantId: 1, correlationId: 1, createdAt: -1 });

export type WebhookEventDocument = InferSchemaType<typeof webhookEventSchema>;
export const WebhookEventModel = model<WebhookEventDocument>('WebhookEvent', webhookEventSchema);
