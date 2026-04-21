import { describe, it, expect, vi } from 'vitest';

// Mock React components so the configs can be imported in a Node environment
vi.mock('../payslip/components/PayslipFormSections', () => ({ PayslipFormSections: vi.fn() }));
vi.mock('../payslip/components/PayslipPDF', () => ({ PayslipPDF: vi.fn() }));
vi.mock('../final-settlement/components/FinalSettlementFormSections', () => ({ FinalSettlementFormSections: vi.fn() }));
vi.mock('../final-settlement/components/FinalSettlementPDF', () => ({ FinalSettlementPDF: vi.fn() }));

import { getFormConfig, formRegistry } from './form-registry';
import type { IEmployee, IForm } from '@payslips-maker/shared';

// ─── helpers ──────────────────────────────────────────────────────────────────

const EMPLOYEE: IEmployee = {
  _id: 'emp1',
  userId: 'user1',
  fullName: { en: 'Ana Ramirez' },
  passportNumber: 'AA1234567',
  nationality: 'Philippines',
  startDate: '2022-03-01',
  preferredLanguage: 'fil',
  weeklyRestDay: 'saturday',
  hasPocketMoney: false,
  medicalInsuranceMonthlyCost: 0,
  accommodationDeduction: 0,
  utilitiesDeduction: 0,
  hasFoodDeduction: false,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

// ─── registry completeness ────────────────────────────────────────────────────

describe('formRegistry', () => {
  it('has exactly 2 entries registered', () => {
    expect(formRegistry.size).toBe(2);
  });

  it('has "payslip" registered', () => {
    expect(formRegistry.has('payslip')).toBe(true);
  });

  it('has "final_settlement" registered', () => {
    expect(formRegistry.has('final_settlement')).toBe(true);
  });
});

// ─── getFormConfig ────────────────────────────────────────────────────────────

describe('getFormConfig', () => {
  it('throws for an unknown formType', () => {
    expect(() => getFormConfig('unknown' as never)).toThrow(
      'No form config registered for type: unknown'
    );
  });

  it('returns the payslip config for "payslip"', () => {
    const config = getFormConfig('payslip');
    expect(config).toBeDefined();
    expect(config.formType).toBe('payslip');
  });

  it('returns the final settlement config for "final_settlement"', () => {
    const config = getFormConfig('final_settlement');
    expect(config).toBeDefined();
    expect(config.formType).toBe('final_settlement');
  });
});

// ─── payslip config shape ─────────────────────────────────────────────────────

describe('payslipFormConfig', () => {
  const config = getFormConfig('payslip');

  it('labelHe is "מחליף תלוש שכר"', () => {
    expect(config.labelHe).toBe('מחליף תלוש שכר');
  });

  it('has a Zod schema with a parse method', () => {
    expect(typeof config.schema.parse).toBe('function');
  });

  it('has FormSections and PDFDocument components', () => {
    expect(config.FormSections).toBeDefined();
    expect(config.PDFDocument).toBeDefined();
  });

  it('defaultValues seeds fullName from employee', () => {
    const values = config.defaultValues(EMPLOYEE);
    expect((values as { employeeInfo: { fullName: unknown } }).employeeInfo.fullName)
      .toEqual({ en: 'Ana Ramirez' });
  });

  it('defaultValues seeds passportNumber from employee', () => {
    const values = config.defaultValues(EMPLOYEE);
    expect((values as { employeeInfo: { passportNumber: string } }).employeeInfo.passportNumber)
      .toBe('AA1234567');
  });

  it('defaultValues seeds nationality from employee', () => {
    const values = config.defaultValues(EMPLOYEE);
    expect((values as { employeeInfo: { nationality: string } }).employeeInfo.nationality)
      .toBe('Philippines');
  });

  it('defaultValues sets workedDays to 0', () => {
    const values = config.defaultValues(EMPLOYEE);
    expect((values as { workDetails: { workedDays: number } }).workDetails.workedDays).toBe(0);
  });

  it('fromApiForm extracts the correct payslip fields', () => {
    const form = {
      period: { month: 3, year: 2025 },
      employeeInfo: { fullName: { en: 'Ana' }, idNumber: 'AA1', nationality: 'PH', employerName: { en: 'E' }, employerTaxId: '1' },
      workDetails: { standardDays: 22, workedDays: 20, vacationDays: 2, sickDays: 0, holidayDays: 0, overtime100h: 0, overtime125h: 0, overtime150h: 0 },
      payCalculation: { dailyRate: 300, baseSalary: 6000, overtimePay: 0, vacationPay: 0, grossSalary: 6000 },
      deductions: { incomeTax: 0, nationalInsurance: 0, healthInsurance: 0, otherDeductions: 0 },
      employerContributions: { nationalInsurance: 0, pension: 0 },
      netSalary: 6000,
      paymentInfo: { paymentMethod: 'bank', bankName: '', accountNumber: '', branchNumber: '' },
    } as unknown as IForm;

    const values = config.fromApiForm(form) as { netSalary: number; period: { month: number } };
    expect(values.netSalary).toBe(6000);
    expect(values.period.month).toBe(3);
  });
});

// ─── final settlement config shape ───────────────────────────────────────────

describe('finalSettlementFormConfig', () => {
  const config = getFormConfig('final_settlement');

  it('labelHe is "גמר חשבון"', () => {
    expect(config.labelHe).toBe('גמר חשבון');
  });

  it('has a Zod schema with a parse method', () => {
    expect(typeof config.schema.parse).toBe('function');
  });

  it('has FormSections and PDFDocument components', () => {
    expect(config.FormSections).toBeDefined();
    expect(config.PDFDocument).toBeDefined();
  });

  it('defaultValues seeds employmentStartDate from employee.startDate', () => {
    const values = config.defaultValues(EMPLOYEE) as { employmentStartDate: string };
    expect(values.employmentStartDate).toBe('2022-03-01');
  });

  it('defaultValues sets terminationReason to "dismissal"', () => {
    const values = config.defaultValues(EMPLOYEE) as { terminationReason: string };
    expect(values.terminationReason).toBe('dismissal');
  });

  it('defaultValues sets all numeric fields to 0', () => {
    const values = config.defaultValues(EMPLOYEE) as Record<string, unknown>;
    const numericFields = [
      'lastMonthlySalary', 'vacationDaysUsed', 'recuperationDaysAlreadyPaid',
      'unpaidWages', 'otherAdditions', 'totalGross', 'netTotal',
    ];
    numericFields.forEach((field) => {
      expect(values[field]).toBe(0);
    });
  });

  it('has a toApiPayload function', () => {
    expect(typeof config.toApiPayload).toBe('function');
  });

  it('toApiPayload wraps data in finalSettlementData', () => {
    const data = config.defaultValues(EMPLOYEE);
    const payload = config.toApiPayload!(data as never, {
      formType: 'final_settlement',
      employeeId: 'emp1',
    });
    expect(payload.finalSettlementData).toBeDefined();
    expect(payload.formType).toBe('final_settlement');
    expect(payload.employeeId).toBe('emp1');
  });
});
