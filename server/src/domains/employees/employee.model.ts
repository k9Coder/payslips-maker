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
  weeklyRestDay: 'friday' | 'saturday' | 'sunday';
  hasPocketMoney: boolean;
  medicalInsuranceMonthlyCost: number;
  accommodationDeduction: number;
  utilitiesDeduction: number;
  hasFoodDeduction: boolean;
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
    weeklyRestDay: {
      type: String,
      enum: ['friday', 'saturday', 'sunday'],
      default: 'saturday',
    },
    hasPocketMoney: { type: Boolean, default: false },
    medicalInsuranceMonthlyCost: { type: Number, default: 0 },
    accommodationDeduction: { type: Number, default: 0 },
    utilitiesDeduction: { type: Number, default: 0 },
    hasFoodDeduction: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const Employee = mongoose.model<IEmployeeDocument>('Employee', EmployeeSchema);
