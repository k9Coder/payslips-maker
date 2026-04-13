import { describe, it, expect } from 'vitest';
import { payslipFormSchema } from './payslip.schema';

const VALID_FORM = {
  period: { month: 3, year: 2025 },
  employeeInfo: {
    fullName: 'Ana Ramirez',
    idNumber: 'AA1234567',
    nationality: 'Philippines',
    employerName: 'Test Employer Ltd',
    employerTaxId: '123456789',
  },
  workDetails: {
    standardDays: 22,
    workedDays: 22,
    vacationDays: 0,
    sickDays: 0,
    holidayDays: 0,
    overtime100h: 0,
    overtime125h: 0,
    overtime150h: 0,
  },
  payCalculation: {
    dailyRate: 300,
    baseSalary: 6600,
    overtimePay: 0,
    vacationPay: 0,
    grossSalary: 6600,
  },
  deductions: {
    incomeTax: 0,
    nationalInsurance: 0,
    healthInsurance: 0,
    otherDeductions: 0,
  },
  employerContributions: {
    nationalInsurance: 0,
    pension: 0,
  },
  netSalary: 6600,
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

  it('rejects fullName shorter than 2 characters', () => {
    const result = payslipFormSchema.safeParse({
      ...VALID_FORM,
      employeeInfo: { ...VALID_FORM.employeeInfo, fullName: 'A' },
    });
    expect(result.success).toBe(false);
  });

  it('rejects idNumber shorter than 5 characters', () => {
    const result = payslipFormSchema.safeParse({
      ...VALID_FORM,
      employeeInfo: { ...VALID_FORM.employeeInfo, idNumber: '1234' },
    });
    expect(result.success).toBe(false);
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
  it('accepts all new employer info fields when provided', () => {
    const result = payslipFormSchema.safeParse({
      ...VALID_FORM,
      employeeInfo: {
        ...VALID_FORM.employeeInfo,
        employerAddress: 'Herzl 1',
        employerCity: 'Tel Aviv',
        employerZip: '6100000',
        employerRegistrationNumber: '51-123456-7',
        taxFileNumber: '123-45678',
      },
    });
    expect(result.success).toBe(true);
  });

  it('accepts all new employee personal info fields when provided', () => {
    const result = payslipFormSchema.safeParse({
      ...VALID_FORM,
      employeeInfo: {
        ...VALID_FORM.employeeInfo,
        employeeNumber: 'E-042',
        jobTitle: '301',
        department: 'Kitchen',
        familyStatus: 'single',
        grade: 'A',
        jobFraction: 0.5,
        employmentStartDate: '2022-01-01',
        taxCalcType: 'annual',
        nationalInsuranceType: 'foreign',
        salaryBasis: 'daily',
        employeeAddress: 'Ben Yehuda 5',
        employeeCity: 'Haifa',
        employeeZip: '3100000',
      },
    });
    expect(result.success).toBe(true);
  });

  it('rejects salaryBasis values outside the enum', () => {
    const result = payslipFormSchema.safeParse({
      ...VALID_FORM,
      employeeInfo: { ...VALID_FORM.employeeInfo, salaryBasis: 'weekly' },
    });
    expect(result.success).toBe(false);
  });

  it('rejects jobFraction above 1', () => {
    const result = payslipFormSchema.safeParse({
      ...VALID_FORM,
      employeeInfo: { ...VALID_FORM.employeeInfo, jobFraction: 1.5 },
    });
    expect(result.success).toBe(false);
  });
});

describe('payslipFormSchema — employer contributions new fields', () => {
  it('accepts new pension and fund fields', () => {
    const result = payslipFormSchema.safeParse({
      ...VALID_FORM,
      employerContributions: {
        nationalInsurance: 1149,
        pension: 429,
        pensionFund: 'מנורה',
        pensionEmployeeRate: 6,
        pensionEmployerRate: 6.5,
        severanceFund: 660,
        educationFund: 792,
        educationFundEmployee: 528,
      },
    });
    expect(result.success).toBe(true);
  });

  it('defaults missing pension/fund fields to 0', () => {
    const result = payslipFormSchema.safeParse(VALID_FORM);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.employerContributions.pensionEmployeeRate).toBe(0);
      expect(result.data.employerContributions.pensionEmployerRate).toBe(0);
      expect(result.data.employerContributions.severanceFund).toBe(0);
      expect(result.data.employerContributions.educationFund).toBe(0);
      expect(result.data.employerContributions.educationFundEmployee).toBe(0);
    }
  });
});

describe('payslipFormSchema — customPayItems', () => {
  it('defaults to an empty array', () => {
    const result = payslipFormSchema.safeParse(VALID_FORM);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.customPayItems).toEqual([]);
    }
  });

  it('accepts a valid custom pay item', () => {
    const result = payslipFormSchema.safeParse({
      ...VALID_FORM,
      customPayItems: [{ code: '21', description: 'Meal allowance', quantity: 22, rate: 15, amount: 330, taxPercent: 100 }],
    });
    expect(result.success).toBe(true);
  });

  it('rejects a custom pay item with empty description', () => {
    const result = payslipFormSchema.safeParse({
      ...VALID_FORM,
      customPayItems: [{ code: '21', description: '', amount: 330 }],
    });
    expect(result.success).toBe(false);
  });

  it('rejects taxPercent above 100', () => {
    const result = payslipFormSchema.safeParse({
      ...VALID_FORM,
      customPayItems: [{ description: 'Bonus', amount: 500, taxPercent: 101 }],
    });
    expect(result.success).toBe(false);
  });

  it('accepts items without optional fields (quantity, rate, taxPercent)', () => {
    const result = payslipFormSchema.safeParse({
      ...VALID_FORM,
      customPayItems: [{ description: 'Bonus', amount: 1000 }],
    });
    expect(result.success).toBe(true);
  });
});

describe('payslipFormSchema — vacationAccount and sickAccount', () => {
  it('defaults vacationAccount and sickAccount to undefined (not set)', () => {
    const result = payslipFormSchema.safeParse(VALID_FORM);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.vacationAccount).toBeUndefined();
      expect(result.data.sickAccount).toBeUndefined();
    }
  });

  it('accepts vacationAccount: null (disabled)', () => {
    const result = payslipFormSchema.safeParse({ ...VALID_FORM, vacationAccount: null });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.vacationAccount).toBeNull();
    }
  });

  it('accepts vacationAccount with all balance fields', () => {
    const result = payslipFormSchema.safeParse({
      ...VALID_FORM,
      vacationAccount: { previousBalance: 5, accrued: 1.75, used: 2, remaining: 4.75 },
    });
    expect(result.success).toBe(true);
  });

  it('accepts sickAccount: null (disabled)', () => {
    const result = payslipFormSchema.safeParse({ ...VALID_FORM, sickAccount: null });
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
