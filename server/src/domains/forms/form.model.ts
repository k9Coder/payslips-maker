import mongoose, { Schema, Document, Types } from 'mongoose';
import type { IForm } from '@payslips-maker/shared';

export interface FormDocument extends Omit<IForm, '_id' | 'userId'>, Document {
  userId: Types.ObjectId;
}

const EmployeeInfoSchema = new Schema(
  {
    fullName: { type: String, required: true },
    idNumber: { type: String, required: true },
    nationality: { type: String, required: true },
    employerName: { type: String, required: true },
    employerTaxId: { type: String, required: true },
  },
  { _id: false }
);

const WorkDetailsSchema = new Schema(
  {
    standardDays: { type: Number, required: true },
    workedDays: { type: Number, required: true },
    vacationDays: { type: Number, default: 0 },
    sickDays: { type: Number, default: 0 },
    holidayDays: { type: Number, default: 0 },
    overtime100h: { type: Number, default: 0 },
    overtime125h: { type: Number, default: 0 },
    overtime150h: { type: Number, default: 0 },
  },
  { _id: false }
);

const PayCalculationSchema = new Schema(
  {
    dailyRate: { type: Number, required: true },
    baseSalary: { type: Number, required: true },
    overtimePay: { type: Number, default: 0 },
    vacationPay: { type: Number, default: 0 },
    grossSalary: { type: Number, required: true },
  },
  { _id: false }
);

const DeductionsSchema = new Schema(
  {
    incomeTax: { type: Number, default: 0 },
    nationalInsurance: { type: Number, default: 0 },
    healthInsurance: { type: Number, default: 0 },
    otherDeductions: { type: Number, default: 0 },
  },
  { _id: false }
);

const EmployerContributionsSchema = new Schema(
  {
    nationalInsurance: { type: Number, default: 0 },
    pension: { type: Number, default: 0 },
  },
  { _id: false }
);

const PaymentInfoSchema = new Schema(
  {
    paymentMethod: { type: String, default: '' },
    bankName: { type: String, default: '' },
    accountNumber: { type: String, default: '' },
    branchNumber: { type: String, default: '' },
  },
  { _id: false }
);

const FormSchema = new Schema<FormDocument>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    clerkId: { type: String, required: true, index: true },
    period: {
      month: { type: Number, required: true, min: 1, max: 12 },
      year: { type: Number, required: true },
    },
    employeeInfo: { type: EmployeeInfoSchema, required: true },
    workDetails: { type: WorkDetailsSchema, required: true },
    payCalculation: { type: PayCalculationSchema, required: true },
    deductions: { type: DeductionsSchema, required: true },
    employerContributions: { type: EmployerContributionsSchema, required: true },
    netSalary: { type: Number, required: true },
    paymentInfo: { type: PaymentInfoSchema, required: true },
  },
  { timestamps: true }
);

FormSchema.index({ userId: 1, 'period.year': 1, 'period.month': 1 });

export const Form = mongoose.model<FormDocument>('Form', FormSchema);
