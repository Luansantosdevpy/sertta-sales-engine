import { model, type InferSchemaType } from 'mongoose';
import { createBaseSchema } from '../../../database/mongoose/base/base.schema';

export const USER_STATUSES = ['active', 'invited', 'disabled'] as const;

const userSchema = createBaseSchema({
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
    maxlength: 254
  },
  fullName: { type: String, required: true, trim: true, minlength: 2, maxlength: 160 },
  passwordHash: { type: String, required: true, minlength: 60, maxlength: 255 },
  status: { type: String, enum: USER_STATUSES, required: true, default: 'active' },
  lastLoginAt: { type: Date },
  passwordChangedAt: { type: Date },
  phoneNumber: { type: String, trim: true, maxlength: 32 }
});

userSchema.index({ email: 1 }, { unique: true });
userSchema.index({ status: 1, createdAt: -1 });

export type UserDocument = InferSchemaType<typeof userSchema>;
export const UserModel = model<UserDocument>('User', userSchema);
