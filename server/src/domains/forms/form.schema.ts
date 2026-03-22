import { z } from 'zod';

const periodSchema = z.object({
  month: z.number().int().min(1).max(12),
  year: z.number().int().min(2000).max(2100),
});

const employeeInfoSchema = z.object({
  fullName: z.string().min(2),
  idNumber: z.string().min(5),
  nationality: z.string().min(2),
  employerName: z.string().min(2),
  employerTaxId: z.string().min(5),
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
});

const paymentInfoSchema = z.object({
  paymentMethod: z.string().default(''),
  bankName: z.string().default(''),
  accountNumber: z.string().default(''),
  branchNumber: z.string().default(''),
});

export const createFormSchema = z.object({
  period: periodSchema,
  employeeInfo: employeeInfoSchema,
  workDetails: workDetailsSchema,
  payCalculation: payCalculationSchema,
  deductions: deductionsSchema,
  employerContributions: employerContributionsSchema,
  netSalary: z.number(),
  paymentInfo: paymentInfoSchema,
});

export const updateFormSchema = createFormSchema;
