import mongoose, { Schema, Document } from 'mongoose';

export interface EmailLogDocument extends Document {
  formId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  sentAt: Date;
  toEmail: string;
}

const EmailLogSchema = new Schema<EmailLogDocument>({
  formId: { type: Schema.Types.ObjectId, required: true, index: true },
  userId: { type: Schema.Types.ObjectId, required: true },
  sentAt: { type: Date, default: Date.now },
  toEmail: { type: String, required: true },
});

// TTL index: auto-delete logs older than 24 hours so rate limit resets daily
EmailLogSchema.index({ sentAt: 1 }, { expireAfterSeconds: 86400 });

export const EmailLog = mongoose.model<EmailLogDocument>('EmailLog', EmailLogSchema);
