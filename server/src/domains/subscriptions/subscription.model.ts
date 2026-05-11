import mongoose, { Schema, Document, Types } from 'mongoose';
import type { ISubscription, SubscriptionPlan, SubscriptionStatus } from '@payslips-maker/shared';

export interface SubscriptionDocument extends Omit<ISubscription, '_id' | 'userId' | 'employeeId'>, Document {
  userId:      Types.ObjectId;
  employeeId?: Types.ObjectId;
}

const SubscriptionSchema = new Schema<SubscriptionDocument>(
  {
    userId:     { type: Schema.Types.ObjectId, ref: 'User',     required: true, index: true },
    employeeId: { type: Schema.Types.ObjectId, ref: 'Employee', index: true },
    plan:       { type: String, enum: ['per_employee', 'full'] as SubscriptionPlan[], required: true },
    status:     { type: String, enum: ['active', 'cancelled', 'expired'] as SubscriptionStatus[], default: 'active' },
    amountILS:  { type: Number, required: true },
    startedAt:  { type: Date, required: true },
    expiresAt:  { type: Date, required: true },
    billingRef: { type: String },
  },
  { timestamps: true }
);

SubscriptionSchema.index({ userId: 1, status: 1 });
SubscriptionSchema.index({ userId: 1, employeeId: 1, status: 1 });

export const Subscription = mongoose.model<SubscriptionDocument>('Subscription', SubscriptionSchema);
