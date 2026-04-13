import { z } from 'zod';
import type { MultiLangString } from '@payslips-maker/shared';

const supportedLanguages = ['he', 'en', 'fil', 'th', 'am', 'hi', 'ar'] as const;

const multiLangStringSchema = z.union([
  z.string().min(2, 'שדה חובה'),
  z.record(z.enum(supportedLanguages), z.string().optional()).refine(
    (val) => Object.values(val).some((v) => v && v.trim().length >= 2),
    { message: 'נדרש ערך בלפחות שפה אחת' }
  ),
]) as unknown as z.ZodType<MultiLangString>;

const optionalMultiLangStringSchema = z
  .union([
    z.string().optional(),
    z.record(z.enum(supportedLanguages), z.string().optional()).optional(),
  ])
  .optional() as unknown as z.ZodType<MultiLangString | undefined>;

export const payslipFormSchema = z.object({
  period: z.object({
    month: z.number({ required_error: 'שדה חובה' }).int().min(1).max(12),
    year: z.number({ required_error: 'שדה חובה' }).int().min(2000).max(2100),
  }),
  employeeInfo: z.object({
    fullName: multiLangStringSchema,
    idNumber: z.string({ required_error: 'שדה חובה' }).min(5, 'מספר זהות לא תקין'),
    nationality: z.string({ required_error: 'שדה חובה' }).min(2, 'שדה חובה'),
    employerName: multiLangStringSchema,
    employerTaxId: z.string({ required_error: 'שדה חובה' }).min(5, 'מספר עוסק לא תקין'),
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
  }),
  workDetails: z.object({
    standardDays: z.number().min(1).max(31).default(22),
    workedDays: z.number().min(0).max(31),
    vacationDays: z.number().min(0).default(0),
    sickDays: z.number().min(0).default(0),
    holidayDays: z.number().min(0).default(0),
    overtime100h: z.number().min(0).default(0),
    overtime125h: z.number().min(0).default(0),
    overtime150h: z.number().min(0).default(0),
  }),
  payCalculation: z.object({
    dailyRate: z.number({ required_error: 'שדה חובה' }).min(0, 'תעריף חייב להיות חיובי'),
    baseSalary: z.number().min(0),
    overtimePay: z.number().min(0).default(0),
    vacationPay: z.number().min(0).default(0),
    grossSalary: z.number().min(0),
  }),
  deductions: z.object({
    incomeTax: z.number().min(0).default(0),
    nationalInsurance: z.number().min(0).default(0),
    healthInsurance: z.number().min(0).default(0),
    otherDeductions: z.number().min(0).default(0),
  }),
  employerContributions: z.object({
    nationalInsurance: z.number().min(0).default(0),
    pension: z.number().min(0).default(0),
    pensionFund: z.string().optional(),
    pensionEmployeeRate: z.number().min(0).default(0),
    pensionEmployerRate: z.number().min(0).default(0),
    severanceFund: z.number().min(0).default(0),
    educationFund: z.number().min(0).default(0),
    educationFundEmployee: z.number().min(0).default(0),
  }),
  netSalary: z.number().min(0),
  paymentInfo: z.object({
    paymentMethod: z.string().default('bank'),
    bankName: z.string().default(''),
    accountNumber: z.string().default(''),
    branchNumber: z.string().default(''),
  }),
  customPayItems: z.array(z.object({
    code: z.string().default(''),
    description: multiLangStringSchema,
    quantity: z.number().min(0).optional(),
    rate: z.number().min(0).optional(),
    amount: z.number(),
    taxPercent: z.number().min(0).max(100).optional(),
  })).default([]),
  vacationAccount: z.object({
    previousBalance: z.number().min(0).default(0),
    accrued: z.number().min(0).default(0),
    used: z.number().min(0).default(0),
    remaining: z.number().min(0).default(0),
  }).nullable().optional(),
  sickAccount: z.object({
    previousBalance: z.number().min(0).default(0),
    accrued: z.number().min(0).default(0),
    used: z.number().min(0).default(0),
    remaining: z.number().min(0).default(0),
  }).nullable().optional(),
});

export type PayslipFormValues = z.infer<typeof payslipFormSchema>;
