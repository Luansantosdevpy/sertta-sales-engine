import { model, type InferSchemaType } from 'mongoose';
import { createTenantBaseSchema } from '../../../database/mongoose/base/tenant-base.schema';

const jobRecordSchema = createTenantBaseSchema({
  queueName: { type: String, required: true, trim: true, maxlength: 100 },
  jobName: { type: String, required: true, trim: true, maxlength: 100 },
  eventType: { type: String, required: true, trim: true, maxlength: 120 },
  queueJobId: { type: String, required: true, trim: true, maxlength: 120 },
  status: {
    type: String,
    required: true,
    enum: ['queued', 'processing', 'completed', 'failed', 'dead_letter', 'canceled'],
    default: 'queued'
  },
  correlationId: { type: String, required: true, trim: true, maxlength: 128 },
  idempotencyKey: { type: String, trim: true, maxlength: 120 },
  attemptsMade: { type: Number, required: true, default: 0, min: 0 },
  maxAttempts: { type: Number, required: true, default: 5, min: 1 },
  payloadRef: { type: String, trim: true, maxlength: 180 },
  errorMessage: { type: String, trim: true, maxlength: 1200 },
  deadLetterReason: { type: String, trim: true, maxlength: 1200 },
  startedAt: { type: Date },
  completedAt: { type: Date },
  failedAt: { type: Date },
  deadLetteredAt: { type: Date }
});

jobRecordSchema.index({ tenantId: 1, queueName: 1, status: 1, createdAt: -1 });
jobRecordSchema.index({ tenantId: 1, queueJobId: 1 }, { unique: true });
jobRecordSchema.index({ tenantId: 1, correlationId: 1, createdAt: -1 });
jobRecordSchema.index({ tenantId: 1, queueName: 1, idempotencyKey: 1 }, { sparse: true, unique: true });
jobRecordSchema.index({ tenantId: 1, status: 1, failedAt: -1 });

export type JobRecordDocument = InferSchemaType<typeof jobRecordSchema>;
export const JobRecordModel = model<JobRecordDocument>('JobRecord', jobRecordSchema);
