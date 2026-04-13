import { describe, it, expect } from 'vitest';
import { calculateFinalSettlement, type FinalSettlementInput } from './final-settlement.calculations';

// ─── helpers ────────────────────────────────────────────────────────────────

function makeInput(overrides: Partial<FinalSettlementInput> = {}): FinalSettlementInput {
  return {
    employmentStartDate: '2022-01-01',
    employmentEndDate: '2024-01-01',   // 24 months by default
    terminationReason: 'dismissal',
    lastMonthlySalary: 6600,
    vacationDaysUsed: 0,
    recuperationDaysAlreadyPaid: 0,
    noticeActuallyGiven: false,
    unpaidWages: 0,
    otherAdditions: 0,
    deductions: { incomeTax: 0, nationalInsurance: 0, healthInsurance: 0, otherDeductions: 0 },
    ...overrides,
  };
}

// ─── totalMonths ─────────────────────────────────────────────────────────────

describe('totalMonths', () => {
  it('counts whole months between dates', () => {
    const result = calculateFinalSettlement(makeInput({
      employmentStartDate: '2023-01-01',
      employmentEndDate: '2023-07-01',
    }));
    expect(result.totalMonths).toBe(6);
  });

  it('is 0 when end equals start', () => {
    const result = calculateFinalSettlement(makeInput({
      employmentStartDate: '2023-01-01',
      employmentEndDate: '2023-01-01',
    }));
    expect(result.totalMonths).toBe(0);
  });
});

// ─── dailyRate ───────────────────────────────────────────────────────────────

describe('dailyRate', () => {
  it('is lastMonthlySalary / 22, rounded to 2 decimals', () => {
    const result = calculateFinalSettlement(makeInput({ lastMonthlySalary: 6600 }));
    expect(result.dailyRate).toBe(300);
  });
});

// ─── severance ───────────────────────────────────────────────────────────────

describe('severance', () => {
  it('dismissal + 12 months → eligible', () => {
    const result = calculateFinalSettlement(makeInput({
      employmentStartDate: '2023-01-01',
      employmentEndDate: '2024-01-01', // 12 months
      terminationReason: 'dismissal',
    }));
    expect(result.severanceEligible).toBe(true);
    expect(result.severancePay).toBeGreaterThan(0);
  });

  it('dismissal + 11 months → not eligible', () => {
    const result = calculateFinalSettlement(makeInput({
      employmentStartDate: '2023-01-01',
      employmentEndDate: '2023-12-01', // 11 months
      terminationReason: 'dismissal',
    }));
    expect(result.severanceEligible).toBe(false);
    expect(result.severancePay).toBe(0);
  });

  it('resignation → not eligible', () => {
    const result = calculateFinalSettlement(makeInput({ terminationReason: 'resignation' }));
    expect(result.severanceEligible).toBe(false);
    expect(result.severancePay).toBe(0);
  });

  it('mutual termination + 12 months → eligible (treated like dismissal)', () => {
    const result = calculateFinalSettlement(makeInput({
      employmentStartDate: '2023-01-01',
      employmentEndDate: '2024-01-01',
      terminationReason: 'mutual',
    }));
    expect(result.severanceEligible).toBe(true);
    expect(result.severancePay).toBeGreaterThan(0);
  });

  it('severancePay = lastSalary/12 × totalMonths', () => {
    // 24 months, salary 6000 → 6000/12 × 24 = 12000
    const result = calculateFinalSettlement(makeInput({
      employmentStartDate: '2022-01-01',
      employmentEndDate: '2024-01-01',
      lastMonthlySalary: 6000,
    }));
    expect(result.severancePay).toBe(12000);
  });
});

// ─── vacation payout ─────────────────────────────────────────────────────────

describe('vacation payout', () => {
  it('years 1–4 accrue 12 days/year', () => {
    // 24 months = 2 years → 12 days/year × 2 = 24 accrued
    const result = calculateFinalSettlement(makeInput({
      employmentStartDate: '2022-01-01',
      employmentEndDate: '2024-01-01',
      vacationDaysUsed: 0,
    }));
    expect(result.vacationDaysAccrued).toBe(24);
    expect(result.unusedVacationDays).toBe(24);
  });

  it('used days reduce the payout', () => {
    const result = calculateFinalSettlement(makeInput({
      employmentStartDate: '2022-01-01',
      employmentEndDate: '2024-01-01',
      vacationDaysUsed: 10,
    }));
    expect(result.unusedVacationDays).toBe(14);
  });

  it('unusedVacationDays cannot be negative', () => {
    const result = calculateFinalSettlement(makeInput({
      employmentStartDate: '2022-01-01',
      employmentEndDate: '2024-01-01',
      vacationDaysUsed: 999,
    }));
    expect(result.unusedVacationDays).toBe(0);
    expect(result.vacationPayout).toBe(0);
  });

  it('vacationPayout = unusedDays × dailyRate', () => {
    // 24 months, salary 6600 → dailyRate=300, 24 unused days → 7200
    const result = calculateFinalSettlement(makeInput({
      employmentStartDate: '2022-01-01',
      employmentEndDate: '2024-01-01',
      lastMonthlySalary: 6600,
      vacationDaysUsed: 0,
    }));
    expect(result.vacationPayout).toBe(24 * 300);
  });

  it('year 5 accrues 14 days/year', () => {
    // 60 months = 5 years
    const result = calculateFinalSettlement(makeInput({
      employmentStartDate: '2019-01-01',
      employmentEndDate: '2024-01-01', // 60 months
      vacationDaysUsed: 0,
    }));
    // 5 years × 14 days = 70
    expect(result.vacationDaysAccrued).toBe(70);
  });
});

// ─── recuperation pay ────────────────────────────────────────────────────────

describe('recuperation pay', () => {
  it('< 12 months → 0 days entitled', () => {
    const result = calculateFinalSettlement(makeInput({
      employmentStartDate: '2023-06-01',
      employmentEndDate: '2024-01-01', // 7 months
    }));
    expect(result.recuperationDaysEntitled).toBe(0);
    expect(result.recuperationPayout).toBe(0);
  });

  it('12–23 months → 5 days entitled', () => {
    const result = calculateFinalSettlement(makeInput({
      employmentStartDate: '2023-01-01',
      employmentEndDate: '2024-01-01', // 12 months
      recuperationDaysAlreadyPaid: 0,
    }));
    expect(result.recuperationDaysEntitled).toBe(5);
    expect(result.recuperationPayout).toBe(5 * 378);
  });

  it('24–35 months → 6 days entitled', () => {
    const result = calculateFinalSettlement(makeInput({
      employmentStartDate: '2022-01-01',
      employmentEndDate: '2024-01-01', // 24 months
    }));
    expect(result.recuperationDaysEntitled).toBe(6);
    expect(result.recuperationPayout).toBe(6 * 378);
  });

  it('36 months – 10 years → 7 days entitled', () => {
    const result = calculateFinalSettlement(makeInput({
      employmentStartDate: '2021-01-01',
      employmentEndDate: '2024-01-01', // 36 months
    }));
    expect(result.recuperationDaysEntitled).toBe(7);
  });

  it('11–20 years → 8 days entitled', () => {
    const result = calculateFinalSettlement(makeInput({
      employmentStartDate: '2012-01-01',
      employmentEndDate: '2024-01-01', // 144 months = 12 years
    }));
    expect(result.recuperationDaysEntitled).toBe(8);
  });

  it('21+ years → 10 days entitled', () => {
    const result = calculateFinalSettlement(makeInput({
      employmentStartDate: '2000-01-01',
      employmentEndDate: '2024-01-01', // 288 months = 24 years
    }));
    expect(result.recuperationDaysEntitled).toBe(10);
  });

  it('already-paid days reduce payout', () => {
    const result = calculateFinalSettlement(makeInput({
      employmentStartDate: '2022-01-01',
      employmentEndDate: '2024-01-01', // 24 months → 6 days
      recuperationDaysAlreadyPaid: 4,
    }));
    expect(result.recuperationPayout).toBe(2 * 378);
  });

  it('recuperation payout cannot be negative', () => {
    const result = calculateFinalSettlement(makeInput({
      employmentStartDate: '2022-01-01',
      employmentEndDate: '2024-01-01',
      recuperationDaysAlreadyPaid: 999,
    }));
    expect(result.recuperationPayout).toBe(0);
  });
});

// ─── notice period ───────────────────────────────────────────────────────────

describe('notice period', () => {
  it('0 months → 0 days', () => {
    const result = calculateFinalSettlement(makeInput({
      employmentStartDate: '2024-01-01',
      employmentEndDate: '2024-01-01',
    }));
    expect(result.noticePeriodDays).toBe(0);
  });

  it('1 month → 1 day', () => {
    const result = calculateFinalSettlement(makeInput({
      employmentStartDate: '2023-12-01',
      employmentEndDate: '2024-01-01',
    }));
    expect(result.noticePeriodDays).toBe(1);
  });

  it('3 months → 3 days', () => {
    const result = calculateFinalSettlement(makeInput({
      employmentStartDate: '2023-10-01',
      employmentEndDate: '2024-01-01',
    }));
    expect(result.noticePeriodDays).toBe(3);
  });

  it('6 months → 6 days', () => {
    const result = calculateFinalSettlement(makeInput({
      employmentStartDate: '2023-07-01',
      employmentEndDate: '2024-01-01',
    }));
    expect(result.noticePeriodDays).toBe(6);
  });

  it('13+ months → 30 days (full month)', () => {
    const result = calculateFinalSettlement(makeInput({
      employmentStartDate: '2022-11-01',
      employmentEndDate: '2024-01-01', // 14 months
    }));
    expect(result.noticePeriodDays).toBe(30);
  });

  it('noticeActuallyGiven = true → noticePeriodPay = 0', () => {
    const result = calculateFinalSettlement(makeInput({ noticeActuallyGiven: true }));
    expect(result.noticePeriodPay).toBe(0);
  });

  it('noticeActuallyGiven = false → noticePeriodPay = days × (salary/30)', () => {
    // 24 months → 30 days notice, salary 6000 → 6000/30=200/day → 6000
    const result = calculateFinalSettlement(makeInput({
      employmentStartDate: '2022-01-01',
      employmentEndDate: '2024-01-01',
      lastMonthlySalary: 6000,
      noticeActuallyGiven: false,
    }));
    expect(result.noticePeriodDays).toBe(30);
    expect(result.noticePeriodPay).toBe(6000);
  });
});

// ─── totals ──────────────────────────────────────────────────────────────────

describe('totals', () => {
  it('totalGross is sum of all components', () => {
    const result = calculateFinalSettlement(makeInput({
      unpaidWages: 500,
      otherAdditions: 200,
    }));
    const expected = result.severancePay + result.vacationPayout + result.recuperationPayout +
      result.noticePeriodPay + 500 + 200;
    expect(result.totalGross).toBeCloseTo(expected, 2);
  });

  it('netTotal = totalGross - all deductions', () => {
    const result = calculateFinalSettlement(makeInput({
      deductions: { incomeTax: 0, nationalInsurance: 0, healthInsurance: 0, otherDeductions: 100 },
    }));
    const expectedNet = result.totalGross
      - result.deductions.incomeTax
      - result.deductions.nationalInsurance
      - result.deductions.healthInsurance
      - 100;
    expect(result.netTotal).toBeCloseTo(expectedNet, 2);
  });

  it('netTotal cannot be negative', () => {
    const result = calculateFinalSettlement(makeInput({
      employmentStartDate: '2023-12-01',
      employmentEndDate: '2024-01-01', // 1 month → near-zero gross
      lastMonthlySalary: 0,
      deductions: { incomeTax: 0, nationalInsurance: 0, healthInsurance: 0, otherDeductions: 99999 },
    }));
    expect(result.netTotal).toBe(0);
  });

  it('zero salary, zero tenure → all zeros', () => {
    const result = calculateFinalSettlement(makeInput({
      employmentStartDate: '2024-01-01',
      employmentEndDate: '2024-01-01',
      lastMonthlySalary: 0,
    }));
    expect(result.severancePay).toBe(0);
    expect(result.vacationPayout).toBe(0);
    expect(result.recuperationPayout).toBe(0);
    expect(result.noticePeriodPay).toBe(0);
    expect(result.totalGross).toBe(0);
    expect(result.netTotal).toBe(0);
  });
});
