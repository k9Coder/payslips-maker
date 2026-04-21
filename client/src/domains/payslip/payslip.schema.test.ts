import { describe, it, expect } from 'vitest';
import { payslipFormSchema } from './payslip.schema';

const VALID_FORM = {
  period: { month: 3, year: 2025 },
  employeeInfo: {
    fullName: 'Ana Ramirez',
    passportNumber: 'AA1234567',
    nationality: 'Philippines',
    employerName: 'Test Employer Ltd',
    employerTaxId: '123456789',
    employmentStartDate: '2022-01-01',
    seniorityMonths: 38,
  },
  workDetails: {
    workedDays: 22,
    restDaysWorked: 0,
    vacationDays: 0,
    sickDays: 0,
    holidayDays: 0,
  },
  payCalculation: {
    minimumWage: 6443.85,
    dailyRate: 257.75,
    baseSalary: 6443.85,
    restDayPremium: 0,
    sickPayAdjustment: 0,
    recoveryPay: 0,
    pocketMoneyPaid: 0,
    grossSalary: 6443.85,
  },
  deductions: {
    medicalInsuranceDeduction: 0,
    accommodationDeduction: 0,
    utilitiesDeduction: 0,
    foodDeduction: 0,
    incomeTax: 0,
    totalPermittedDeductions: 0,
  },
  employerContributions: {
    nii: 0,
    pensionSubstitute: 0,
    severanceSubstitute: 0,
    cumulativePensionBalance: 0,
    cumulativeSeveranceBalance: 0,
  },
  netSalary: 6443.85,
  bankTransfer: 6043.85,
  paymentInfo: {
    paymentMethod: 'bank',
    bankName: '',
    accountNumber: '',
    branchNumber: '',
  },
};

describe('payslipFormSchema — required fields', () => {
  it('accepts a minimal valid form', () => {
    expect(payslipFormSchema.safeParse(VALID_FORM).success).toBe(true);
  });

  it('rejects fullName shorter than 1 character', () => {
    const result = payslipFormSchema.safeParse({
      ...VALID_FORM,
      employeeInfo: { ...VALID_FORM.employeeInfo, fullName: '' },
    });
    expect(result.success).toBe(false);
  });

  it('accepts passportNumber of any length including short (relaxed to allow legacy employees)', () => {
    const result = payslipFormSchema.safeParse({
      ...VALID_FORM,
      employeeInfo: { ...VALID_FORM.employeeInfo, passportNumber: '1234' },
    });
    expect(result.success).toBe(true);
  });

  it('rejects month 0', () => {
    const result = payslipFormSchema.safeParse({
      ...VALID_FORM,
      period: { month: 0, year: 2025 },
    });
    expect(result.success).toBe(false);
  });

  it('rejects month 13', () => {
    const result = payslipFormSchema.safeParse({
      ...VALID_FORM,
      period: { month: 13, year: 2025 },
    });
    expect(result.success).toBe(false);
  });

  it('rejects year below 2000', () => {
    const result = payslipFormSchema.safeParse({
      ...VALID_FORM,
      period: { month: 1, year: 1999 },
    });
    expect(result.success).toBe(false);
  });
});

describe('payslipFormSchema — optional employer info fields', () => {
  it('accepts optional employer address fields', () => {
    const result = payslipFormSchema.safeParse({
      ...VALID_FORM,
      employeeInfo: {
        ...VALID_FORM.employeeInfo,
        employerAddress: 'Herzl 1',
        employerCity: 'Tel Aviv',
        employerZip: '6100000',
      },
    });
    expect(result.success).toBe(true);
  });
});

describe('payslipFormSchema — employer contributions fields', () => {
  it('defaults all employer contribution fields to 0', () => {
    const result = payslipFormSchema.safeParse(VALID_FORM);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.employerContributions.nii).toBe(0);
      expect(result.data.employerContributions.pensionSubstitute).toBe(0);
      expect(result.data.employerContributions.severanceSubstitute).toBe(0);
      expect(result.data.employerContributions.cumulativePensionBalance).toBe(0);
      expect(result.data.employerContributions.cumulativeSeveranceBalance).toBe(0);
    }
  });
});

describe('payslipFormSchema — vacationAccount and sickAccount', () => {
  it('defaults vacationAccount and sickAccount to undefined when omitted', () => {
    const result = payslipFormSchema.safeParse(VALID_FORM);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.vacationAccount == null).toBe(true);
      expect(result.data.sickAccount == null).toBe(true);
    }
  });

  it('accepts vacationAccount: null', () => {
    const result = payslipFormSchema.safeParse({ ...VALID_FORM, vacationAccount: null });
    expect(result.success).toBe(true);
  });

  it('accepts vacationAccount with all balance fields', () => {
    const result = payslipFormSchema.safeParse({
      ...VALID_FORM,
      vacationAccount: { previousBalance: 5, accrued: 1.75, used: 2, remaining: 4.75 },
    });
    expect(result.success).toBe(true);
  });

  it('rejects negative values in vacationAccount', () => {
    const result = payslipFormSchema.safeParse({
      ...VALID_FORM,
      vacationAccount: { previousBalance: -1, accrued: 0, used: 0, remaining: 0 },
    });
    expect(result.success).toBe(false);
  });
});
