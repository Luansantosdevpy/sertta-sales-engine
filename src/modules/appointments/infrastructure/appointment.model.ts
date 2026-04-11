import { Schema, model, type InferSchemaType } from 'mongoose';
import { createTenantBaseSchema } from '../../../database/mongoose/base/tenant-base.schema';

const appointmentSchema = createTenantBaseSchema({
  contactId: { type: Schema.Types.ObjectId, ref: 'Contact' },
  conversationId: { type: Schema.Types.ObjectId, ref: 'Conversation' },
  title: { type: String, required: true, trim: true, maxlength: 180 },
  notes: { type: String, trim: true, maxlength: 3000 },
  status: {
    type: String,
    required: true,
    enum: ['pending_confirmation', 'confirmed', 'completed', 'canceled'],
    default: 'pending_confirmation'
  },
  scheduledFor: { type: Date, required: true },
  timezone: { type: String, required: true, trim: true, maxlength: 64 },
  channelId: { type: Schema.Types.ObjectId, ref: 'Channel' },
  createdBy: { type: String, required: true }
});

appointmentSchema.index({ tenantId: 1, status: 1, scheduledFor: 1 });
appointmentSchema.index({ tenantId: 1, contactId: 1, createdAt: -1 }, { sparse: true });
appointmentSchema.index({ tenantId: 1, conversationId: 1, createdAt: -1 }, { sparse: true });

export type AppointmentDocument = InferSchemaType<typeof appointmentSchema>;
export const AppointmentModel = model<AppointmentDocument>('Appointment', appointmentSchema);
