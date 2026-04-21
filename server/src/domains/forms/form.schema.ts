import { z } from 'zod';

const supportedLanguages = ['he', 'en', 'fil', 'th', 'am', 'hi', 'ar'] as const;
type MultiLangString = Partial<Record<typeof supportedLanguages[number], string>>;

const multiLangStringSchema = z.union([
  z.string().min(2),
  z.record(z.enum(supportedLanguages), z.string().optional()).refine(
    (val) => Object.values(val).some((v) => v && v.trim().length >= 2),
    { message: 'At least one language must have a value (min 2 chars)' }
  ),
]) as unknown as z.ZodType<MultiLangString>;

const periodSchema = z.object({
  month: z.number().int().min(1).max(12),
  year: z.number().int().min(2000).max(2100),
});

const employeeInfoSchema = z.object({
  fullName: multiLangStringSchema,
  passportNumber: z.string().min(5),
  nationality: z.string().min(2),
  employerName: multiLangStringSchema,
  employerTaxId: z.string().min(5),
  employerAddress: z.string().optional(),
  employerCity: z.string().optional(),
  employerZip: z.string().optional(),
  employmentStartDate: z.string(),
  seniorityMonths: z.number().min(0),
});

const workDetailsSchema = z.object({
  workedDays: z.number().min(0).max(31),
  totalWorkHours: z.number().min(0).default(0),
  restDaysWorked: z.number().min(0).default(0),
  vacationDays: z.number().min(0).default(0),
  sickDays: z.number().min(0).default(0),
  holidayDays: z.number().min(0).default(0),
});

const payCalculationSchema = z.object({
  minimumWage: z.number().min(0),
  dailyRate: z.number().min(0),
  baseSalary: z.number().min(0),
  restDayPremium: z.number().default(0),
  sickPayAdjustment: z.number().default(0),
  recoveryPay: z.number().min(0).default(0),
  pocketMoneyPaid: z.number().min(0).default(0),
  grossSalary: z.number().min(0),
});

const deductionsSchema = z.object({
  medicalInsuranceDeduction: z.number().min(0).default(0),
  accommodationDeduction: z.number().min(0).default(0),
  utilitiesDeduction: z.number().min(0).default(0),
  foodDeduction: z.number().min(0).default(0),
  incomeTax: z.number().min(0).default(0),
  totalPermittedDeductions: z.number().min(0).default(0),
});

const finalSettlementDeductionsSchema = z.object({
  incomeTax: z.number().min(0).default(0),
  nationalInsurance: z.number().min(0).default(0),
  healthInsurance: z.number().min(0).default(0),
  otherDeductions: z.number().min(0).default(0),
});

const employerContributionsSchema = z.object({
  nii: z.number().min(0).default(0),
  pensionSubstitute: z.number().min(0).default(0),
  severanceSubstitute: z.number().min(0).default(0),
  cumulativePensionBalance: z.number().min(0).default(0),
  cumulativeSeveranceBalance: z.number().min(0).default(0),
});

const vacationAccountSchema = z.object({
  previousBalance: z.number().min(0).default(0),
  accrued: z.number().min(0).default(0),
  used: z.number().min(0).default(0),
  remaining: z.number().min(0).default(0),
}).nullable().optional();

const paymentInfoSchema = z.object({
  paymentMethod: z.string().default(''),
  bankName: z.string().default(''),
  accountNumber: z.string().default(''),
  branchNumber: z.string().default(''),
});

const finalSettlementDataSchema = z.object({
  employmentStartDate: z.string(),
  employmentEndDate: z.string(),
  totalMonths: z.number().default(0),
  terminationReason: z.enum(['dismissal', 'resignation', 'mutual']),
  lastMonthlySalary: z.number().min(0),
  dailyRate: z.number().min(0).default(0),
  severanceEligible: z.boolean().default(false),
  severancePay: z.number().min(0).default(0),
  vacationDaysAccrued: z.number().min(0).default(0),
  vacationDaysUsed: z.number().min(0).default(0),
  unusedVacationDays: z.number().min(0).default(0),
  vacationPayout: z.number().min(0).default(0),
  recuperationDaysEntitled: z.number().min(0).default(0),
  recuperationDaysAlreadyPaid: z.number().min(0).default(0),
  recuperationPayout: z.number().min(0).default(0),
  noticePeriodDays: z.number().min(0).default(0),
  noticePeriodPay: z.number().min(0).default(0),
  noticeActuallyGiven: z.boolean().default(false),
  unpaidWages: z.number().min(0).default(0),
  otherAdditions: z.number().min(0).default(0),
  totalGross: z.number().min(0).default(0),
  deductions: finalSettlementDeductionsSchema,
  netTotal: z.number().default(0),
}).nullable().optional();

export const createFormSchema = z.object({
  employeeId: z.string().min(1),
  formType: z.enum(['payslip', 'final_settlement']).default('payslip'),
  period: periodSchema,
  employeeInfo: employeeInfoSchema,
  workDetails: workDetailsSchema,
  payCalculation: payCalculationSchema,
  deductions: deductionsSchema,
  employerContributions: employerContributionsSchema,
  netSalary: z.number(),
  bankTransfer: z.number().default(0),
  paymentInfo: paymentInfoSchema,
  finalSettlementData: finalSettlementDataSchema,
  vacationAccount: vacationAccountSchema,
  sickAccount: vacationAccountSchema,
});

export const updateFormSchema = createFormSchema;
