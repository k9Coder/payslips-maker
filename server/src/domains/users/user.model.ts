import mongoose, { Schema, Document } from 'mongoose';
import type { IUser } from '@payslips-maker/shared';

export interface UserDocument extends Omit<IUser, '_id' | 'companyIds'>, Document {
  companyIds: mongoose.Types.ObjectId[];
}

const UserSchema = new Schema<UserDocument>(
  {
    clerkId: { type: String, required: true, unique: true, index: true },
    email: { type: String, required: true, unique: true, index: true },
    fullName: { type: String, required: true },
    phone: { type: String },
    isAdmin: { type: Boolean, default: false },
    hasSubscription: { type: Boolean, default: false },
    companyIds: [{ type: Schema.Types.ObjectId, ref: 'Company' }],
  },
  { timestamps: true }
);

export const User = mongoose.model<UserDocument>('User', UserSchema);
