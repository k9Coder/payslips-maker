import { z } from 'zod';

const deductionsSchema = z.object({
  incomeTax: z.number().min(0).default(0),
  nationalInsurance: z.number().min(0).default(0),
  healthInsurance: z.number().min(0).default(0),
  otherDeductions: z.number().min(0).default(0),
});

export const finalSettlementFormSchema = z.object({
  // User-input fields
  employmentStartDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'תאריך לא תקין'),
  employmentEndDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'תאריך לא תקין'),
  terminationReason: z.enum(['dismissal', 'resignation', 'mutual']),
  lastMonthlySalary: z.number({ required_error: 'שדה חובה' }).min(0),
  vacationDaysUsed: z.number().min(0).default(0),
  recuperationDaysAlreadyPaid: z.number().min(0).default(0),
  noticeActuallyGiven: z.boolean().default(false),
  unpaidWages: z.number().min(0).default(0),
  otherAdditions: z.number().min(0).default(0),

  // Calculated fields (stored in form state, submitted as-is)
  totalMonths: z.number().default(0),
  dailyRate: z.number().default(0),
  severanceEligible: z.boolean().default(false),
  severancePay: z.number().default(0),
  vacationDaysAccrued: z.number().default(0),
  unusedVacationDays: z.number().default(0),
  vacationPayout: z.number().default(0),
  recuperationDaysEntitled: z.number().default(0),
  recuperationPayout: z.number().default(0),
  noticePeriodDays: z.number().default(0),
  noticePeriodPay: z.number().default(0),
  totalGross: z.number().default(0),
  deductions: deductionsSchema,
  netTotal: z.number().default(0),
});

export type FinalSettlementFormValues = z.infer<typeof finalSettlementFormSchema>;
