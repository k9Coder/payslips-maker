import mongoose, { Schema, Document, Types } from 'mongoose';
import type { IForm } from '@payslips-maker/shared';

export interface FormDocument extends Omit<IForm, '_id' | 'companyId' | 'userId' | 'employeeId'>, Document {
  companyId: Types.ObjectId;
  userId: Types.ObjectId;
  employeeId: Types.ObjectId;
}

const EmployeeInfoSchema = new Schema(
  {
    fullName: { type: Schema.Types.Mixed, required: true },
    idNumber: { type: String, required: true },
    nationality: { type: String, required: true },
    employerName: { type: Schema.Types.Mixed, required: true },
    employerTaxId: { type: String, required: true },
    employerAddress: String,
    employerCity: String,
    employerZip: String,
    employerRegistrationNumber: String,
    taxFileNumber: String,
    employeeNumber: String,
    jobTitle: { type: Schema.Types.Mixed },
    department: { type: Schema.Types.Mixed },
    familyStatus: String,
    grade: String,
    jobFraction: Number,
    employmentStartDate: String,
    taxCalcType: String,
    nationalInsuranceType: String,
    salaryBasis: { type: String, enum: ['monthly', 'daily', 'hourly'] },
    employeeAddress: String,
    employeeCity: String,
    employeeZip: String,
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
    pensionFund: String,
    pensionEmployeeRate: { type: Number, default: 0 },
    pensionEmployerRate: { type: Number, default: 0 },
    severanceFund: { type: Number, default: 0 },
    educationFund: { type: Number, default: 0 },
    educationFundEmployee: { type: Number, default: 0 },
  },
  { _id: false }
);

const CustomPayItemSchema = new Schema(
  {
    code: { type: String, default: '' },
    description: { type: Schema.Types.Mixed, required: true },
    quantity: Number,
    rate: Number,
    amount: { type: Number, required: true },
    taxPercent: Number,
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
    deductions: DeductionsSchema,
    netTotal: Number,
  },
  { _id: false }
);

const FormSchema = new Schema<FormDocument>(
  {
    companyId: { type: Schema.Types.ObjectId, ref: 'Company', required: true, index: true },
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
    paymentInfo: { type: PaymentInfoSchema, required: true },
    finalSettlementData: { type: FinalSettlementDataSchema, default: null },
    customPayItems: { type: [CustomPayItemSchema], default: [] },
    vacationAccount: { type: VacationAccountSchema, default: null },
    sickAccount: { type: VacationAccountSchema, default: null },
  },
  { timestamps: true }
);

FormSchema.index({ companyId: 1, 'period.year': 1, 'period.month': 1 });

export const Form = mongoose.model<FormDocument>('Form', FormSchema);
