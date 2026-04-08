import { Schema, model, type InferSchemaType } from 'mongoose';
import { config } from '../../../config';
import { createTenantBaseSchema } from '../../../database/mongoose/base/tenant-base.schema';
import { buildRetentionDate } from '../../../shared/utils/retention';

const executionLogSchema = createTenantBaseSchema({
  automationInstanceId: { type: Schema.Types.ObjectId, ref: 'AutomationInstance' },
  webhookEventId: { type: Schema.Types.ObjectId, ref: 'WebhookEvent' },
  jobRecordId: { type: Schema.Types.ObjectId, ref: 'JobRecord' },
  conversationId: { type: Schema.Types.ObjectId, ref: 'Conversation' },
  channelId: { type: Schema.Types.ObjectId, ref: 'Channel' },
  integrationId: { type: Schema.Types.ObjectId, ref: 'Integration' },
  level: { type: String, required: true, enum: ['debug', 'info', 'warn', 'error'], default: 'info' },
  status: {
    type: String,
    required: true,
    enum: ['started', 'step_success', 'step_failed', 'finished'],
    default: 'started'
  },
  stepKey: { type: String, trim: true, maxlength: 80 },
  message: { type: String, required: true, trim: true, maxlength: 2000 },
  errorCode: { type: String, trim: true, maxlength: 120 },
  correlationId: { type: String, required: true, trim: true, maxlength: 128 },
  payload: { type: Schema.Types.Mixed },
  expiresAt: { type: Date, required: true, default: () => buildRetentionDate(config.retention.executionLogsDays) }
});

executionLogSchema.index({ tenantId: 1, automationInstanceId: 1, createdAt: -1 }, { sparse: true });
executionLogSchema.index({ tenantId: 1, webhookEventId: 1, createdAt: -1 }, { sparse: true });
executionLogSchema.index({ tenantId: 1, jobRecordId: 1, createdAt: -1 }, { sparse: true });
executionLogSchema.index({ tenantId: 1, status: 1, createdAt: -1 });
executionLogSchema.index({ tenantId: 1, level: 1, createdAt: -1 });
executionLogSchema.index({ tenantId: 1, correlationId: 1, createdAt: -1 });
executionLogSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export type ExecutionLogDocument = InferSchemaType<typeof executionLogSchema>;
export const ExecutionLogModel = model<ExecutionLogDocument>('ExecutionLog', executionLogSchema);
