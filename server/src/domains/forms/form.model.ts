import mongoose, { Schema, Document, Types } from 'mongoose';
import type { IForm } from '@payslips-maker/shared';

export interface FormDocument extends Omit<IForm, '_id' | 'userId' | 'employeeId'>, Document {
  userId: Types.ObjectId;
  employeeId: Types.ObjectId;
}

const EmployeeInfoSchema = new Schema(
  {
    fullName: { type: Schema.Types.Mixed, required: true },
    passportNumber: { type: String, required: true },
    nationality: { type: String, required: true },
    employerName: { type: Schema.Types.Mixed, required: true },
    employerTaxId: { type: String, required: true },
    employerAddress: String,
    employerCity: String,
    employerZip: String,
    employmentStartDate: { type: String, required: true },
    seniorityMonths: { type: Number, required: true },
  },
  { _id: false }
);

const WorkDetailsSchema = new Schema(
  {
    workedDays: { type: Number, required: true },
    totalWorkHours: { type: Number, default: 0 },
    restDaysWorked: { type: Number, default: 0 },
    vacationDays: { type: Number, default: 0 },
    sickDays: { type: Number, default: 0 },
    holidayDays: { type: Number, default: 0 },
  },
  { _id: false }
);

const PayCalculationSchema = new Schema(
  {
    minimumWage: { type: Number, required: true },
    dailyRate: { type: Number, required: true },
    baseSalary: { type: Number, required: true },
    restDayPremium: { type: Number, default: 0 },
    sickPayAdjustment: { type: Number, default: 0 },
    recoveryPay: { type: Number, default: 0 },
    pocketMoneyPaid: { type: Number, default: 0 },
    grossSalary: { type: Number, required: true },
  },
  { _id: false }
);

const DeductionsSchema = new Schema(
  {
    medicalInsuranceDeduction: { type: Number, default: 0 },
    accommodationDeduction: { type: Number, default: 0 },
    utilitiesDeduction: { type: Number, default: 0 },
    foodDeduction: { type: Number, default: 0 },
    incomeTax: { type: Number, default: 0 },
    totalPermittedDeductions: { type: Number, default: 0 },
  },
  { _id: false }
);

const FinalSettlementDeductionsSchema = new Schema(
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
    nii: { type: Number, default: 0 },
    pensionSubstitute: { type: Number, default: 0 },
    severanceSubstitute: { type: Number, default: 0 },
    cumulativePensionBalance: { type: Number, default: 0 },
    cumulativeSeveranceBalance: { type: Number, default: 0 },
  },
  { _id: false }
);

const VacationAccountSchema = new Schema(
  {
    previousBalance: { type: Number, default: 0 },
    accrued: { type: Number, default: 0 },
    used: { type: Number, default: 0 },
    remaining: { type: Number, default: 0 },
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

const FinalSettlementDataSchema = new Schema(
  {
    employmentStartDate: String,
    employmentEndDate: String,
    terminationReason: { type: String, enum: ['dismissal', 'resignation', 'mutual'] },
    lastMonthlySalary: Number,
    unusedVacationDays: Number,
    severancePay: Number,
    vacationPayout: Number,
    recuperationPayout: Number,
    noticePeriodDays: Number,
    noticePeriodPay: Number,
    totalGross: Number,
    deductions: FinalSettlementDeductionsSchema,
    netTotal: Number,
  },
  { _id: false }
);

const FormSchema = new Schema<FormDocument>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    clerkId: { type: String, required: true, index: true },
    producedByName: { type: String, required: true, default: '' },
    employeeId: { type: Schema.Types.ObjectId, ref: 'Employee', required: true, index: true },
    formType: {
      type: String,
      enum: ['payslip', 'final_settlement'],
      required: true,
      default: 'payslip',
    },
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
    bankTransfer: { type: Number, default: 0 },
    paymentInfo: { type: PaymentInfoSchema, required: true },
    finalSettlementData: { type: FinalSettlementDataSchema, default: null },
    vacationAccount: { type: VacationAccountSchema, default: null },
    sickAccount: { type: VacationAccountSchema, default: null },
  },
  { timestamps: true }
);

FormSchema.index({ userId: 1, 'period.year': 1, 'period.month': 1 });

export const Form = mongoose.model<FormDocument>('Form', FormSchema);
