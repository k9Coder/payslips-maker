import { describe, it, expect } from 'vitest';
import { createFormSchema } from './form.schema';

const VALID_FORM = {
  employeeId: '507f1f77bcf86cd799439044',
  formType: 'payslip' as const,
  period: { month: 3, year: 2025 },
  employeeInfo: {
    fullName: 'Ana Ramirez',
    idNumber: 'AA1234567',
    nationality: 'Philippines',
    employerName: 'Test Employer',
    employerTaxId: '12345',
  },
  workDetails: { standardDays: 22, workedDays: 22 },
  payCalculation: { dailyRate: 300, baseSalary: 6600, grossSalary: 6600 },
  deductions: {},
  employerContributions: {},
  netSalary: 6600,
  paymentInfo: {},
};

describe('createFormSchema — required fields', () => {
  it('accepts a valid minimal form', () => {
    expect(createFormSchema.safeParse(VALID_FORM).success).toBe(true);
  });

  it('rejects missing employeeId', () => {
    const { employeeId: _, ...rest } = VALID_FORM;
    expect(createFormSchema.safeParse(rest).success).toBe(false);
  });

  it('rejects period month of 0', () => {
    const result = createFormSchema.safeParse({ ...VALID_FORM, period: { month: 0, year: 2025 } });
    expect(result.success).toBe(false);
  });

  it('rejects period month of 13', () => {
    const result = createFormSchema.safeParse({ ...VALID_FORM, period: { month: 13, year: 2025 } });
    expect(result.success).toBe(false);
  });

  it('defaults formType to payslip when omitted', () => {
    const { formType: _, ...rest } = VALID_FORM;
    const result = createFormSchema.safeParse(rest);
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.formType).toBe('payslip');
  });

  it('rejects employeeInfo.fullName shorter than 2 chars', () => {
    const result = createFormSchema.safeParse({
      ...VALID_FORM,
      employeeInfo: { ...VALID_FORM.employeeInfo, fullName: 'A' },
    });
    expect(result.success).toBe(false);
  });
});

describe('createFormSchema — workDetails defaults', () => {
  it('defaults vacationDays, sickDays, holidayDays to 0', () => {
    const result = createFormSchema.safeParse(VALID_FORM);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.workDetails.vacationDays).toBe(0);
      expect(result.data.workDetails.sickDays).toBe(0);
      expect(result.data.workDetails.holidayDays).toBe(0);
    }
  });
});

describe('createFormSchema — employerContributions new fields', () => {
  it('defaults all pension/fund fields to 0', () => {
    const result = createFormSchema.safeParse(VALID_FORM);
    expect(result.success).toBe(true);
    if (result.success) {
      const ec = result.data.employerContributions;
      expect(ec.pensionEmployeeRate).toBe(0);
      expect(ec.pensionEmployerRate).toBe(0);
      expect(ec.severanceFund).toBe(0);
      expect(ec.educationFund).toBe(0);
      expect(ec.educationFundEmployee).toBe(0);
    }
  });

  it('accepts pensionFund name', () => {
    const result = createFormSchema.safeParse({
      ...VALID_FORM,
      employerContributions: { nationalInsurance: 0, pension: 0, pensionFund: 'מנורה' },
    });
    expect(result.success).toBe(true);
  });
});

describe('createFormSchema — customPayItems', () => {
  it('defaults customPayItems to empty array', () => {
    const result = createFormSchema.safeParse(VALID_FORM);
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.customPayItems).toEqual([]);
  });

  it('accepts valid customPayItems', () => {
    const result = createFormSchema.safeParse({
      ...VALID_FORM,
      customPayItems: [
        { code: '21', description: 'Meal allowance', quantity: 22, rate: 15, amount: 330 },
        { description: 'Bonus', amount: 500, taxPercent: 100 },
      ],
    });
    expect(result.success).toBe(true);
  });

  it('rejects customPayItem with empty description', () => {
    const result = createFormSchema.safeParse({
      ...VALID_FORM,
      customPayItems: [{ code: '01', description: '', amount: 100 }],
    });
    expect(result.success).toBe(false);
  });

  it('rejects customPayItem with taxPercent above 100', () => {
    const result = createFormSchema.safeParse({
      ...VALID_FORM,
      customPayItems: [{ description: 'Extra', amount: 100, taxPercent: 101 }],
    });
    expect(result.success).toBe(false);
  });
});

describe('createFormSchema — vacationAccount / sickAccount', () => {
  it('accepts vacationAccount: null', () => {
    const result = createFormSchema.safeParse({ ...VALID_FORM, vacationAccount: null });
    expect(result.success).toBe(true);
  });

  it('accepts both accounts with balance fields', () => {
    const account = { previousBalance: 5, accrued: 1.75, used: 2, remaining: 4.75 };
    const result = createFormSchema.safeParse({
      ...VALID_FORM,
      vacationAccount: account,
      sickAccount: account,
    });
    expect(result.success).toBe(true);
  });

  it('rejects negative balance in vacationAccount', () => {
    const result = createFormSchema.safeParse({
      ...VALID_FORM,
      vacationAccount: { previousBalance: -1, accrued: 0, used: 0, remaining: 0 },
    });
    expect(result.success).toBe(false);
  });
});
