import { describe, it, expect } from 'vitest';
import { createFormSchema } from './form.schema';

const VALID_FORM = {
  employeeId: '507f1f77bcf86cd799439044',
  formType: 'payslip' as const,
  period: { month: 3, year: 2025 },
  employeeInfo: {
    fullName: 'Ana Ramirez',
    passportNumber: 'AA1234567',
    nationality: 'Philippines',
    employerName: 'Test Employer',
    employerTaxId: '12345',
    employmentStartDate: '2022-01-01',
    seniorityMonths: 38,
  },
  workDetails: { workedDays: 22 },
  payCalculation: { minimumWage: 6443.85, dailyRate: 257.75, baseSalary: 6443.85, grossSalary: 6443.85 },
  deductions: {},
  employerContributions: {},
  netSalary: 6443.85,
  bankTransfer: 6443.85,
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

describe('createFormSchema — employerContributions', () => {
  it('defaults all employer contribution fields to 0', () => {
    const result = createFormSchema.safeParse(VALID_FORM);
    expect(result.success).toBe(true);
    if (result.success) {
      const ec = result.data.employerContributions;
      expect(ec.nii).toBe(0);
      expect(ec.pensionSubstitute).toBe(0);
      expect(ec.severanceSubstitute).toBe(0);
      expect(ec.cumulativePensionBalance).toBe(0);
      expect(ec.cumulativeSeveranceBalance).toBe(0);
    }
  });
});

describe('createFormSchema — vacationAccount / sickAccount', () => {
  it('leaves vacationAccount / sickAccount undefined when omitted', () => {
    const result = createFormSchema.safeParse(VALID_FORM);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.vacationAccount == null).toBe(true);
      expect(result.data.sickAccount == null).toBe(true);
    }
  });

  it('accepts a valid vacationAccount', () => {
    const result = createFormSchema.safeParse({
      ...VALID_FORM,
      vacationAccount: { previousBalance: 5, accrued: 1.17, used: 0, remaining: 6.17 },
    });
    expect(result.success).toBe(true);
  });
});
