import { z } from 'zod';
import type { MultiLangString } from '@payslips-maker/shared';

const supportedLanguages = ['he', 'en', 'fil', 'th', 'am', 'hi', 'ar'] as const;

const multiLangStringSchema = z.union([
  z.string().min(1),
  z.record(z.enum(supportedLanguages), z.string().optional()),
]) as unknown as z.ZodType<MultiLangString>;

export const payslipFormSchema = z.object({
  period: z.object({
    month: z.number().int().min(1).max(12),
    year: z.number().int().min(2000).max(2100),
  }),
  employeeInfo: z.object({
    fullName: multiLangStringSchema,
    passportNumber: z.string().min(0),
    nationality: z.string().min(0),
    employerName: multiLangStringSchema,
    employerTaxId: z.string().min(0),
    employerAddress: z.string().optional(),
    employerCity: z.string().optional(),
    employerZip: z.string().optional(),
    employmentStartDate: z.string(),
    seniorityMonths: z.number().min(0),
  }),
  workDetails: z.object({
    workedDays: z.number().min(0).max(31),
    totalWorkHours: z.number().min(0).default(0),
    restDaysWorked: z.number().min(0).default(0),
    vacationDays: z.number().min(0).default(0),
    sickDays: z.number().min(0).default(0),
    holidayDays: z.number().min(0).default(0),
  }),
  payCalculation: z.object({
    minimumWage: z.number().min(0),
    dailyRate: z.number().min(0),
    hourlyRate: z.number().min(0),
    baseSalary: z.number().min(0),
    restDayPremium: z.number().default(0),
    sickPayAdjustment: z.number().default(0),
    recoveryPay: z.number().min(0).default(0),
    pocketMoneyPaid: z.number().min(0).default(0),
    grossSalary: z.number().min(0),
  }),
  deductions: z.object({
    medicalInsuranceDeduction: z.number().min(0).default(0),
    accommodationDeduction: z.number().min(0).default(0),
    utilitiesDeduction: z.number().min(0).default(0),
    foodDeduction: z.number().min(0).default(0),
    incomeTax: z.number().min(0).default(0),
    totalPermittedDeductions: z.number().min(0).default(0),
  }),
  employerContributions: z.object({
    nii: z.number().min(0).default(0),
    pensionSubstitute: z.number().min(0).default(0),
    severanceSubstitute: z.number().min(0).default(0),
    cumulativePensionBalance: z.number().min(0).default(0),
    cumulativeSeveranceBalance: z.number().min(0).default(0),
  }),
  netSalary: z.number().min(0),
  bankTransfer: z.number(),
  paymentInfo: z.object({
    paymentMethod: z.string().default('bank'),
    bankName: z.string().default(''),
    accountNumber: z.string().default(''),
    branchNumber: z.string().default(''),
  }),
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
