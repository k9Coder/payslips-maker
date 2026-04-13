import { useMemo } from 'react';
import type { IDeductions, IWorkDetails, IPayCalculation } from '@payslips-maker/shared';

/**
 * Israeli tax rates for general foreign workers (2024/2025)
 * These are approximations - verify with an accountant for production use.
 */

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

// Personal credit points - foreign workers generally have 2.25 points
const PERSONAL_CREDIT_POINTS_VALUE = 242; // ILS per point (2024)
const FOREIGN_WORKER_CREDIT_POINTS = 2.25;

// National Insurance (ביטוח לאומי) - employee portion for foreign workers
// Foreign workers pay national insurance but at standard employee rates
const NATIONAL_INSURANCE_LOW_RATE = 0.004; // 0.4% up to first threshold
const NATIONAL_INSURANCE_HIGH_RATE = 0.07; // 7% above first threshold
const NATIONAL_INSURANCE_LOW_THRESHOLD = 7522; // ILS (2024)

// Health Insurance (ביטוח בריאות) - foreign workers pay this
const HEALTH_INSURANCE_LOW_RATE = 0.031; // 3.1% up to threshold
const HEALTH_INSURANCE_HIGH_RATE = 0.05; // 5% above threshold
const HEALTH_INSURANCE_THRESHOLD = 7522; // ILS (2024)

// Employer National Insurance contribution rate for foreign workers (higher than regular)
const EMPLOYER_NATIONAL_INSURANCE_RATE = 0.1742; // 17.42% for foreign workers
const EMPLOYER_PENSION_RATE = 0.0650; // 6.5% employer pension

function calculateIncomeTax(grossMonthly: number): number {
  let tax = 0;
  let remaining = grossMonthly;
  let previousBracketCeiling = 0;

  for (const bracket of INCOME_TAX_BRACKETS) {
    if (remaining <= 0) break;
    const bracketSize = bracket.upTo - previousBracketCeiling;
    const taxableInBracket = Math.min(remaining, bracketSize);
    tax += taxableInBracket * bracket.rate;
    remaining -= taxableInBracket;
    previousBracketCeiling = bracket.upTo;
  }

  // Subtract credit points
  const creditReduction = PERSONAL_CREDIT_POINTS_VALUE * FOREIGN_WORKER_CREDIT_POINTS;
  return Math.max(0, tax - creditReduction);
}

function calculateNationalInsurance(grossMonthly: number): number {
  if (grossMonthly <= NATIONAL_INSURANCE_LOW_THRESHOLD) {
    return grossMonthly * NATIONAL_INSURANCE_LOW_RATE;
  }
  return (
    NATIONAL_INSURANCE_LOW_THRESHOLD * NATIONAL_INSURANCE_LOW_RATE +
    (grossMonthly - NATIONAL_INSURANCE_LOW_THRESHOLD) * NATIONAL_INSURANCE_HIGH_RATE
  );
}

function calculateHealthInsurance(grossMonthly: number): number {
  if (grossMonthly <= HEALTH_INSURANCE_THRESHOLD) {
    return grossMonthly * HEALTH_INSURANCE_LOW_RATE;
  }
  return (
    HEALTH_INSURANCE_THRESHOLD * HEALTH_INSURANCE_LOW_RATE +
    (grossMonthly - HEALTH_INSURANCE_THRESHOLD) * HEALTH_INSURANCE_HIGH_RATE
  );
}

export function calculatePayFromWorkDetails(
  workDetails: Partial<IWorkDetails>,
  dailyRate: number
): Partial<IPayCalculation> {
  const workedDays = workDetails.workedDays ?? 0;
  const baseSalary = workedDays * dailyRate;

  // Overtime: assume 8h standard day rate
  const hourlyRate = dailyRate / 8;
  const overtime100Pay = (workDetails.overtime100h ?? 0) * hourlyRate * 1.0;
  const overtime125Pay = (workDetails.overtime125h ?? 0) * hourlyRate * 1.25;
  const overtime150Pay = (workDetails.overtime150h ?? 0) * hourlyRate * 1.5;
  const overtimePay = overtime100Pay + overtime125Pay + overtime150Pay;

  // Vacation payout (if applicable)
  const vacationPay = 0; // User can set manually

  const grossSalary = baseSalary + overtimePay + vacationPay;

  return {
    baseSalary: Math.round(baseSalary * 100) / 100,
    overtimePay: Math.round(overtimePay * 100) / 100,
    vacationPay,
    grossSalary: Math.round(grossSalary * 100) / 100,
  };
}

interface CalculationInputs {
  grossSalary: number;
  overrides: Partial<IDeductions>;
}

interface CalculationResult {
  calculated: IDeductions;
  effective: IDeductions;
  netSalary: number;
  employerNationalInsurance: number;
  employerPension: number;
}

export function usePayslipCalculations({ grossSalary, overrides = {} }: CalculationInputs): CalculationResult {
  return useMemo(() => {
    const calculated: IDeductions = {
      incomeTax: Math.round(calculateIncomeTax(grossSalary) * 100) / 100,
      nationalInsurance: Math.round(calculateNationalInsurance(grossSalary) * 100) / 100,
      healthInsurance: Math.round(calculateHealthInsurance(grossSalary) * 100) / 100,
      otherDeductions: 0,
    };

    const effective: IDeductions = {
      incomeTax: overrides.incomeTax !== undefined ? overrides.incomeTax : calculated.incomeTax,
      nationalInsurance: overrides.nationalInsurance !== undefined ? overrides.nationalInsurance : calculated.nationalInsurance,
      healthInsurance: overrides.healthInsurance !== undefined ? overrides.healthInsurance : calculated.healthInsurance,
      otherDeductions: overrides.otherDeductions !== undefined ? overrides.otherDeductions : calculated.otherDeductions,
    };

    const totalDeductions = effective.incomeTax + effective.nationalInsurance + effective.healthInsurance + effective.otherDeductions;
    const netSalary = Math.max(0, grossSalary - totalDeductions);

    const employerNationalInsurance = Math.round(grossSalary * EMPLOYER_NATIONAL_INSURANCE_RATE * 100) / 100;
    const employerPension = Math.round(grossSalary * EMPLOYER_PENSION_RATE * 100) / 100;

    return { calculated, effective, netSalary, employerNationalInsurance, employerPension };
  }, [grossSalary, overrides]);
}
