import { model, type InferSchemaType } from 'mongoose';
import { createBaseSchema } from '../../../database/mongoose/base/base.schema';

const planSchema = createBaseSchema({
  code: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
    minlength: 2,
    maxlength: 50,
    match: /^[a-z0-9_-]+$/
  },
  name: { type: String, required: true, trim: true, minlength: 2, maxlength: 120 },
  status: { type: String, enum: ['active', 'inactive'], default: 'active', required: true },
  monthlyPriceCents: { type: Number, required: true, min: 0 },
  currency: { type: String, required: true, uppercase: true, minlength: 3, maxlength: 3, default: 'USD' },
  limits: {
    maxUsers: { type: Number, required: true, min: 1 },
    maxChannels: { type: Number, required: true, min: 1 },
    maxAutomations: { type: Number, required: true, min: 1 },
    monthlyMessages: { type: Number, required: true, min: 1 }
  },
  features: [{ type: String, trim: true, maxlength: 80 }],
  version: { type: Number, required: true, default: 1 }
});

planSchema.index({ code: 1 }, { unique: true });
planSchema.index({ status: 1, createdAt: -1 });

export type PlanDocument = InferSchemaType<typeof planSchema>;
export const PlanModel = model<PlanDocument>('Plan', planSchema);
