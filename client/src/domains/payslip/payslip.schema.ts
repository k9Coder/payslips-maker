import { z } from 'zod';

export const payslipFormSchema = z.object({
  period: z.object({
    month: z.number({ required_error: 'שדה חובה' }).int().min(1).max(12),
    year: z.number({ required_error: 'שדה חובה' }).int().min(2000).max(2100),
  }),
  employeeInfo: z.object({
    fullName: z.string({ required_error: 'שדה חובה' }).min(2, 'שם מלא חייב להכיל לפחות 2 תווים'),
    idNumber: z.string({ required_error: 'שדה חובה' }).min(5, 'מספר זהות לא תקין'),
    nationality: z.string({ required_error: 'שדה חובה' }).min(2, 'שדה חובה'),
    employerName: z.string({ required_error: 'שדה חובה' }).min(2, 'שם המעסיק חייב להכיל לפחות 2 תווים'),
    employerTaxId: z.string({ required_error: 'שדה חובה' }).min(5, 'מספר עוסק לא תקין'),
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
  }),
  netSalary: z.number().min(0),
  paymentInfo: z.object({
    paymentMethod: z.string().default('bank'),
    bankName: z.string().default(''),
    accountNumber: z.string().default(''),
    branchNumber: z.string().default(''),
  }),
});

export type PayslipFormValues = z.infer<typeof payslipFormSchema>;
