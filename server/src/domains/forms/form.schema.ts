import { z } from 'zod';

const supportedLanguages = ['he', 'en', 'fil', 'th', 'am', 'hi', 'ar'] as const;
type MultiLangString = Partial<Record<typeof supportedLanguages[number], string>>;

// Accepts a legacy plain string OR a MultiLangString object (at least one lang with ≥2 chars)
const multiLangStringSchema = z.union([
  z.string().min(2),
  z.record(z.enum(supportedLanguages), z.string().optional()).refine(
    (val) => Object.values(val).some((v) => v && v.trim().length >= 2),
    { message: 'At least one language must have a value (min 2 chars)' }
  ),
]) as unknown as z.ZodType<MultiLangString>;

const optionalMultiLangStringSchema = z
  .union([
    z.string().optional(),
    z.record(z.enum(supportedLanguages), z.string().optional()).optional(),
  ])
  .optional() as unknown as z.ZodType<MultiLangString | undefined>;

const periodSchema = z.object({
  month: z.number().int().min(1).max(12),
  year: z.number().int().min(2000).max(2100),
});

const employeeInfoSchema = z.object({
  fullName: multiLangStringSchema,
  idNumber: z.string().min(5),
  nationality: z.string().min(2),
  employerName: multiLangStringSchema,
  employerTaxId: z.string().min(5),
  employerAddress: z.string().optional(),
  employerCity: z.string().optional(),
  employerZip: z.string().optional(),
  employerRegistrationNumber: z.string().optional(),
  taxFileNumber: z.string().optional(),
  employeeNumber: z.string().optional(),
  jobTitle: optionalMultiLangStringSchema,
  department: optionalMultiLangStringSchema,
  familyStatus: z.string().optional(),
  grade: z.string().optional(),
  jobFraction: z.number().min(0).max(1).optional(),
  employmentStartDate: z.string().optional(),
  taxCalcType: z.string().optional(),
  nationalInsuranceType: z.string().optional(),
  salaryBasis: z.enum(['monthly', 'daily', 'hourly']).optional(),
  employeeAddress: z.string().optional(),
  employeeCity: z.string().optional(),
  employeeZip: z.string().optional(),
});

const workDetailsSchema = z.object({
  standardDays: z.number().min(0).max(31),
  workedDays: z.number().min(0).max(31),
  vacationDays: z.number().min(0).default(0),
  sickDays: z.number().min(0).default(0),
  holidayDays: z.number().min(0).default(0),
  overtime100h: z.number().min(0).default(0),
  overtime125h: z.number().min(0).default(0),
  overtime150h: z.number().min(0).default(0),
});

const payCalculationSchema = z.object({
  dailyRate: z.number().min(0),
  baseSalary: z.number().min(0),
  overtimePay: z.number().min(0).default(0),
  vacationPay: z.number().min(0).default(0),
  grossSalary: z.number().min(0),
});

const deductionsSchema = z.object({
  incomeTax: z.number().min(0).default(0),
  nationalInsurance: z.number().min(0).default(0),
  healthInsurance: z.number().min(0).default(0),
  otherDeductions: z.number().min(0).default(0),
});

const employerContributionsSchema = z.object({
  nationalInsurance: z.number().min(0).default(0),
  pension: z.number().min(0).default(0),
  pensionFund: z.string().optional(),
  pensionEmployeeRate: z.number().min(0).default(0),
  pensionEmployerRate: z.number().min(0).default(0),
  severanceFund: z.number().min(0).default(0),
  educationFund: z.number().min(0).default(0),
  educationFundEmployee: z.number().min(0).default(0),
});

const customPayItemSchema = z.object({
  code: z.string().default(''),
  description: multiLangStringSchema,
  quantity: z.number().min(0).optional(),
  rate: z.number().min(0).optional(),
  amount: z.number(),
  taxPercent: z.number().min(0).max(100).optional(),
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
  deductions: deductionsSchema,
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
  paymentInfo: paymentInfoSchema,
  finalSettlementData: finalSettlementDataSchema,
  customPayItems: z.array(customPayItemSchema).default([]),
  vacationAccount: vacationAccountSchema,
  sickAccount: vacationAccountSchema,
});

export const updateFormSchema = createFormSchema;
