import mongoose, { Schema, Document } from 'mongoose';
import type { IUser } from '@payslips-maker/shared';

export interface UserDocument extends Omit<IUser, '_id'>, Document {}

const UserSchema = new Schema<UserDocument>(
  {
    clerkId: { type: String, required: true, unique: true, index: true },
    email: { type: String, required: true, unique: true, index: true },
    fullName: { type: String, required: true },
    phone: { type: String },
    isAdmin: { type: Boolean, default: false },
    employerName: { type: Map, of: String },
    employerTaxId: { type: String },
    employerAddress: { type: String },
    employerCity: { type: String },
    employerZip: { type: String },
  },
  { timestamps: true }
);

export const User = mongoose.model<UserDocument>('User', UserSchema);
