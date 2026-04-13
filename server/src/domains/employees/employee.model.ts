import mongoose, { Schema, Document } from 'mongoose';
import type { IEmployee } from '@payslips-maker/shared';

export interface EmployeeDocument extends Omit<IEmployee, '_id' | 'companyId'>, Document {
  companyId: mongoose.Types.ObjectId;
}

const EmployeeSchema = new Schema<EmployeeDocument>(
  {
    companyId: { type: Schema.Types.ObjectId, ref: 'Company', required: true, index: true },
    fullName: { type: Schema.Types.Mixed, required: true },
    passportNumber: { type: String, required: true },
    nationality: { type: String, required: true },
    email: { type: String },
    phone: { type: String },
    startDate: { type: String, required: true },
    preferredLanguage: {
      type: String,
      enum: ['he', 'en', 'fil', 'th', 'am', 'hi', 'ar'],
      default: 'he',
    },
  },
  { timestamps: true }
);

export const Employee = mongoose.model<EmployeeDocument>('Employee', EmployeeSchema);
