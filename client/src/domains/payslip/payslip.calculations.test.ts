import { describe, it, expect } from 'vitest';
import { computePayslip, countWeekendDays, getVacationDaysPerYear } from './payslip.calculations';
import type { IEmployee, IPayslipConstants, WorkLogMonthSummary, IForm } from '@payslips-maker/shared';

const CONSTANTS: IPayslipConstants = {
  minimumMonthlyWage: 6443.85,
  dailyRate: 257.75,
  restDayPremium: 426.35,
  medicalDeductionCeiling: 164.91,
  utilitiesDeductionCeiling: 94.34,
  recoveryPayDayRate: 418.00,
  niiEmployerRate: 0.036,
  pensionSubstituteRate: 0.065,
  severanceSubstituteRate: 0.060,
  pocketMoneyPerWeekend: 100.00,
  effectiveFrom: '2026-04-01',
};

const EMPLOYEE: IEmployee = {
  _id: 'emp1',
  userId: 'user1',
  fullName: { he: 'מריה סנטוס', en: 'Maria Santos' },
  passportNumber: 'PH123456',
  nationality: 'Filipino',
  startDate: '2025-09-01',
  preferredLanguage: 'fil',
  weeklyRestDay: 'saturday',
  hasPocketMoney: true,
  medicalInsuranceMonthlyCost: 280,
  accommodationDeduction: 0,
  utilitiesDeduction: 94.34,
  hasFoodDeduction: false,
  createdAt: '2025-09-01T00:00:00.000Z',
  updatedAt: '2025-09-01T00:00:00.000Z',
};

const WORKLOG: WorkLogMonthSummary = {
  employeeId: 'emp1',
  userId: 'user1',
  year: 2026,
  month: 4,
  workDays: 25,
  restDays: 1,
  vacationDays: 0,
  sickDays: 0,
  holidayDays: 0,
  overtimeHours: 0,
  totalWorkHours: 0,
  entries: [],
};

const EMPLOYER = {
  employerName: { he: 'מעסיק בע"מ' },
  employerTaxId: '514789023',
};

describe('computePayslip', () => {
  it('calculates base salary = minimum wage', () => {
    const result = computePayslip({ employee: EMPLOYEE, employerProfile: EMPLOYER, worklogSummary: { ...WORKLOG, restDays: 0 }, previousPayslip: null, constants: CONSTANTS, period: { year: 2026, month: 4 } });
    expect(result.payCalculation.baseSalary).toBe(6443.85);
  });

  it('calculates rest day premium = restDays × 426.35', () => {
    const result = computePayslip({ employee: EMPLOYEE, employerProfile: EMPLOYER, worklogSummary: WORKLOG, previousPayslip: null, constants: CONSTANTS, period: { year: 2026, month: 4 } });
    expect(result.payCalculation.restDayPremium).toBe(426.35);
  });

  it('calculates medical deduction as min(cost/2, ceiling)', () => {
    const result = computePayslip({ employee: EMPLOYEE, employerProfile: EMPLOYER, worklogSummary: WORKLOG, previousPayslip: null, constants: CONSTANTS, period: { year: 2026, month: 4 } });
    // 280/2 = 140 < 164.91 → 140
    expect(result.deductions.medicalInsuranceDeduction).toBe(140);
  });

  it('calculates pension/severance substitute from month 7', () => {
    const result = computePayslip({ employee: EMPLOYEE, employerProfile: EMPLOYER, worklogSummary: WORKLOG, previousPayslip: null, constants: CONSTANTS, period: { year: 2026, month: 4 } });
    expect(result.employerContributions.pensionSubstitute).toBe(418.85);
    expect(result.employerContributions.severanceSubstitute).toBe(386.63);
  });

  it('no pension/severance before month 7', () => {
    const junior = { ...EMPLOYEE, startDate: '2026-02-01' };
    const result = computePayslip({ employee: junior, employerProfile: EMPLOYER, worklogSummary: WORKLOG, previousPayslip: null, constants: CONSTANTS, period: { year: 2026, month: 4 } });
    expect(result.employerContributions.pensionSubstitute).toBe(0);
  });

  it('sick day 1 reduces pay by full daily rate', () => {
    const result = computePayslip({ employee: EMPLOYEE, employerProfile: EMPLOYER, worklogSummary: { ...WORKLOG, sickDays: 1, restDays: 0 }, previousPayslip: null, constants: CONSTANTS, period: { year: 2026, month: 4 } });
    expect(result.payCalculation.sickPayAdjustment).toBe(-257.75);
  });

  it('carries vacation balance from previous payslip', () => {
    const prev = { vacationAccount: { remaining: 5 }, sickAccount: { remaining: 3 }, employerContributions: { cumulativePensionBalance: 418.85, cumulativeSeveranceBalance: 386.63 } } as unknown as IForm;
    const result = computePayslip({ employee: EMPLOYEE, employerProfile: EMPLOYER, worklogSummary: WORKLOG, previousPayslip: prev, constants: CONSTANTS, period: { year: 2026, month: 4 } });
    expect(result.vacationAccount!.previousBalance).toBe(5);
  });
});

describe('countWeekendDays', () => {
  it('counts saturdays in April 2026 — should be 4', () => {
    expect(countWeekendDays(2026, 4, 'saturday')).toBe(4);
  });
});

describe('getVacationDaysPerYear', () => {
  it('returns 14 for year 1 (11 months)', () => {
    expect(getVacationDaysPerYear(11)).toBe(14);
  });
  it('returns 16 for year 6 (60 months)', () => {
    expect(getVacationDaysPerYear(60)).toBe(16);
  });
});
