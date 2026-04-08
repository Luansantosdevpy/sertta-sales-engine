import { Schema, model, type InferSchemaType } from 'mongoose';
import { createTenantBaseSchema } from '../../../database/mongoose/base/tenant-base.schema';

const contactSchema = createTenantBaseSchema({
  fullName: { type: String, trim: true, maxlength: 160 },
  primaryEmail: { type: String, trim: true, lowercase: true, maxlength: 254 },
  primaryPhone: { type: String, trim: true, maxlength: 32 },
  status: { type: String, required: true, enum: ['active', 'blocked', 'archived'], default: 'active' },
  externalId: { type: String, trim: true, maxlength: 120 },
  source: { type: String, trim: true, maxlength: 80 },
  tags: [{ type: String, trim: true, maxlength: 40 }],
  lastSeenAt: { type: Date },
  createdByUserId: { type: Schema.Types.ObjectId, ref: 'User' },
  updatedByUserId: { type: Schema.Types.ObjectId, ref: 'User' }
});

contactSchema.index({ tenantId: 1, status: 1, createdAt: -1 });
contactSchema.index({ tenantId: 1, primaryPhone: 1 }, { sparse: true });
contactSchema.index({ tenantId: 1, primaryEmail: 1 }, { sparse: true });
contactSchema.index({ tenantId: 1, externalId: 1 }, { sparse: true });

export type ContactDocument = InferSchemaType<typeof contactSchema>;
export const ContactModel = model<ContactDocument>('Contact', contactSchema);
