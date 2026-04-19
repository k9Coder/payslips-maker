import mongoose, { Schema, Document } from 'mongoose';

export interface IEmployeeDocument extends Document {
  userId: mongoose.Types.ObjectId;
  fullName: Record<string, string>;
  passportNumber: string;
  nationality: string;
  email?: string;
  phone?: string;
  startDate: string;
  preferredLanguage: string;
}

const EmployeeSchema = new Schema<IEmployeeDocument>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    fullName: { type: Map, of: String, required: true },
    passportNumber: { type: String, required: true },
    nationality: { type: String, required: true },
    email: { type: String },
    phone: { type: String },
    startDate: { type: String, required: true },
    preferredLanguage: {
      type: String,
      enum: ['he', 'en', 'fil', 'th', 'am', 'hi', 'ar'],
      default: 'en',
    },
  },
  { timestamps: true }
);

export const Employee = mongoose.model<IEmployeeDocument>('Employee', EmployeeSchema);
