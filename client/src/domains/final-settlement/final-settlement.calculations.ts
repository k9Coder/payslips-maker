import type { IFinalSettlementData } from '@payslips-maker/shared';

// TODO: Update when Israeli government changes recuperation rates
const RECUPERATION_RATE_PER_DAY = 378; // NIS, 2025, private sector

// TODO: Update vacation accrual table if law changes
const VACATION_DAYS_BY_YEAR: Record<number, number> = {
  1: 12, 2: 12, 3: 12, 4: 12,
  5: 14, 6: 14, 7: 15,
};

function getVacationDaysPerYear(yearsWorked: number): number {
  const year = Math.ceil(yearsWorked);
  if (year <= 7) return VACATION_DAYS_BY_YEAR[year] ?? 12;
  return Math.min(15 + (year - 7), 28);
}

function getRecuperationDaysEntitled(totalMonths: number): number {
  if (totalMonths < 12) return 0;
  const years = totalMonths / 12;
  if (years < 2) return 5;
  if (years < 3) return 6;
  if (years < 11) return 7;
  if (years < 21) return 8;
  return 10;
}

function getNoticePeriodDays(totalMonths: number): number {
  if (totalMonths < 1) return 0;
  if (totalMonths <= 6) return totalMonths;
  if (totalMonths <= 12) return 6 + Math.ceil((totalMonths - 6) * 2.5);
  return 30;
}

function monthsBetween(startDate: string, endDate: string): number {
  const start = new Date(startDate);
  const end = new Date(endDate);
  return Math.max(
    0,
    (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth())
  );
}

// Income tax brackets (monthly, ILS) - standard Israeli brackets
const INCOME_TAX_BRACKETS = [
  { upTo: 7010, rate: 0.1 },
  { upTo: 10060, rate: 0.14 },
  { upTo: 16150, rate: 0.2 },
  { upTo: 21240, rate: 0.31 },
  { upTo: 41910, rate: 0.35 },
  { upTo: 67440, rate: 0.47 },
  { upTo: Infinity, rate: 0.5 },
];
const PERSONAL_CREDIT_POINTS_VALUE = 242;
const FOREIGN_WORKER_CREDIT_POINTS = 2.25;
const NATIONAL_INSURANCE_LOW_RATE = 0.004;
const NATIONAL_INSURANCE_HIGH_RATE = 0.07;
const NATIONAL_INSURANCE_LOW_THRESHOLD = 7522;
const HEALTH_INSURANCE_LOW_RATE = 0.031;
const HEALTH_INSURANCE_HIGH_RATE = 0.05;
const HEALTH_INSURANCE_THRESHOLD = 7522;

function calcIncomeTax(gross: number): number {
  let tax = 0;
  let remaining = gross;
  let prevCeiling = 0;
  for (const bracket of INCOME_TAX_BRACKETS) {
    if (remaining <= 0) break;
    const size = bracket.upTo - prevCeiling;
    const taxable = Math.min(remaining, size);
    tax += taxable * bracket.rate;
    remaining -= taxable;
    prevCeiling = bracket.upTo;
  }
  const credit = PERSONAL_CREDIT_POINTS_VALUE * FOREIGN_WORKER_CREDIT_POINTS;
  return Math.max(0, Math.round((tax - credit) * 100) / 100);
}

function calcNationalInsurance(gross: number): number {
  if (gross <= NATIONAL_INSURANCE_LOW_THRESHOLD) return Math.round(gross * NATIONAL_INSURANCE_LOW_RATE * 100) / 100;
  return Math.round(
    (NATIONAL_INSURANCE_LOW_THRESHOLD * NATIONAL_INSURANCE_LOW_RATE +
      (gross - NATIONAL_INSURANCE_LOW_THRESHOLD) * NATIONAL_INSURANCE_HIGH_RATE) * 100) / 100;
}

function calcHealthInsurance(gross: number): number {
  if (gross <= HEALTH_INSURANCE_THRESHOLD) return Math.round(gross * HEALTH_INSURANCE_LOW_RATE * 100) / 100;
  return Math.round(
    (HEALTH_INSURANCE_THRESHOLD * HEALTH_INSURANCE_LOW_RATE +
      (gross - HEALTH_INSURANCE_THRESHOLD) * HEALTH_INSURANCE_HIGH_RATE) * 100) / 100;
}

export type FinalSettlementInput = {
  employmentStartDate: string;
  employmentEndDate: string;
  terminationReason: 'dismissal' | 'resignation' | 'mutual';
  lastMonthlySalary: number;
  vacationDaysUsed: number;
  recuperationDaysAlreadyPaid: number;
  noticeActuallyGiven: boolean;
  unpaidWages: number;
  otherAdditions: number;
  deductions: {
    incomeTax: number;
    nationalInsurance: number;
    healthInsurance: number;
    otherDeductions: number;
  };
};

export type FinalSettlementCalculated = Pick<IFinalSettlementData,
  | 'totalMonths' | 'dailyRate' | 'severanceEligible' | 'severancePay'
  | 'vacationDaysAccrued' | 'unusedVacationDays' | 'vacationPayout'
  | 'recuperationDaysEntitled' | 'recuperationPayout'
  | 'noticePeriodDays' | 'noticePeriodPay'
  | 'totalGross' | 'deductions' | 'netTotal'
>;

export function calculateFinalSettlement(
  input: FinalSettlementInput
): FinalSettlementCalculated {
  const totalMonths = monthsBetween(input.employmentStartDate, input.employmentEndDate);
  const yearsWorked = totalMonths / 12;
  const lastSalary = input.lastMonthlySalary;
  const dailyRate = Math.round((lastSalary / 22) * 100) / 100;

  // Severance — eligible for dismissal or mutual termination (≥ 12 months)
  // TODO: Resignation severance eligibility (Section 11 exceptions) — currently not supported
  const severanceEligible = totalMonths >= 12 && input.terminationReason !== 'resignation';
  const severancePay = severanceEligible
    ? Math.round((lastSalary / 12) * totalMonths * 100) / 100
    : 0;

  // Vacation
  const vacationDaysAccrued = Math.round(getVacationDaysPerYear(yearsWorked) * yearsWorked * 100) / 100;
  const unusedVacationDays = Math.max(0, vacationDaysAccrued - input.vacationDaysUsed);
  const vacationPayout = Math.round(unusedVacationDays * dailyRate * 100) / 100;

  // Recuperation
  const recuperationDaysEntitled = getRecuperationDaysEntitled(totalMonths);
  const recuperationPayout = Math.max(
    0,
    Math.round((recuperationDaysEntitled - input.recuperationDaysAlreadyPaid) * RECUPERATION_RATE_PER_DAY * 100) / 100
  );

  // Notice
  const noticePeriodDays = getNoticePeriodDays(totalMonths);
  const noticePeriodPay = input.noticeActuallyGiven
    ? 0
    : Math.round(noticePeriodDays * (lastSalary / 30) * 100) / 100;

  // Totals
  const totalGross = Math.round(
    (severancePay + vacationPayout + recuperationPayout + noticePeriodPay + input.unpaidWages + input.otherAdditions) * 100
  ) / 100;

  const deductions = {
    incomeTax: calcIncomeTax(totalGross),
    nationalInsurance: calcNationalInsurance(totalGross),
    healthInsurance: calcHealthInsurance(totalGross),
    otherDeductions: input.deductions.otherDeductions,
  };

  const netTotal = Math.max(
    0,
    Math.round(
      (totalGross - deductions.incomeTax - deductions.nationalInsurance - deductions.healthInsurance - deductions.otherDeductions) * 100
    ) / 100
  );

  return {
    totalMonths,
    dailyRate,
    severanceEligible,
    severancePay,
    vacationDaysAccrued,
    unusedVacationDays,
    vacationPayout,
    recuperationDaysEntitled,
    recuperationPayout,
    noticePeriodDays,
    noticePeriodPay,
    totalGross,
    deductions,
    netTotal,
  };
}
