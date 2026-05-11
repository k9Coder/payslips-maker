import type {
  IEmployee,
  IPayslipConstants,
  WorkLogMonthSummary,
  IForm,
} from '@payslips-maker/shared';
import type { PayslipFormValues } from './payslip.schema';

const r = (n: number) => Math.round(n * 100) / 100;

export function countWeekendDays(
  year: number,
  month: number,
  restDay: 'friday' | 'saturday' | 'sunday'
): number {
  const dayIndex = { friday: 5, saturday: 6, sunday: 0 }[restDay];
  const daysInMonth = new Date(year, month, 0).getDate();
  let count = 0;
  for (let d = 1; d <= daysInMonth; d++) {
    if (new Date(year, month - 1, d).getDay() === dayIndex) count++;
  }
  return count;
}

export function getVacationDaysPerYear(seniorityMonths: number): number {
  const years = Math.floor(seniorityMonths / 12);
  if (years <= 4) return 14;
  if (years === 5) return 16;
  if (years === 6) return 18;
  return 18 + (years - 6);
}

export interface ComputePayslipSources {
  employee: IEmployee;
  employerProfile: {
    employerName: Record<string, string>;
    employerTaxId: string;
    employerAddress?: string;
    employerCity?: string;
    employerZip?: string;
  };
  worklogSummary: WorkLogMonthSummary;
  previousPayslip: IForm | null;
  constants: IPayslipConstants;
  period: { year: number; month: number };
}

export function computePayslip(sources: ComputePayslipSources): PayslipFormValues {
  const { employee, employerProfile, worklogSummary, previousPayslip, constants, period } = sources;

  // Seniority
  const start = new Date(employee.startDate);
  const periodStart = new Date(period.year, period.month - 1, 1);
  const seniorityMonths =
    (periodStart.getFullYear() - start.getFullYear()) * 12 +
    (periodStart.getMonth() - start.getMonth());

  // Pay
  const baseSalary = r(worklogSummary.totalWorkHours * constants.minimumHourlyWage);
  const restDayPremium = r(worklogSummary.restDays * constants.restDayPremium);

  // Sick pay adjustment
  const sick = worklogSummary.sickDays;
  let sickPayAdjustment = 0;
  if (sick >= 1) sickPayAdjustment -= constants.dailyRate;          // day 1: unpaid
  if (sick >= 2) sickPayAdjustment -= r(constants.dailyRate * 0.5); // day 2: 50%
  if (sick >= 3) sickPayAdjustment -= r(constants.dailyRate * 0.5); // day 3: 50%
  // day 4+: full pay, no deduction
  sickPayAdjustment = r(sickPayAdjustment);

  const grossSalary = r(baseSalary + restDayPremium + sickPayAdjustment);

  // Deductions — guard against missing contract fields on legacy employees
  const medicalInsuranceDeduction = r(
    Math.min((employee.medicalInsuranceMonthlyCost ?? 0) / 2, constants.medicalDeductionCeiling)
  );
  const accommodationDeduction = r(employee.accommodationDeduction ?? 0);
  const utilitiesDeduction = r(
    Math.min(employee.utilitiesDeduction ?? 0, constants.utilitiesDeductionCeiling)
  );
  const foodDeduction = (employee.hasFoodDeduction ?? false)
    ? r(grossSalary * 0.1)
    : 0;
  const incomeTax = 0;

  let totalPermittedDeductions = r(
    medicalInsuranceDeduction + accommodationDeduction + utilitiesDeduction + foodDeduction
  );
  const maxDeductions = r(grossSalary * 0.25);
  if (totalPermittedDeductions > maxDeductions) totalPermittedDeductions = maxDeductions;

  const netSalary = r(grossSalary - totalPermittedDeductions);

  // Pocket money
  const weekends = countWeekendDays(period.year, period.month, employee.weeklyRestDay ?? 'saturday');
  const pocketMoneyPaid = (employee.hasPocketMoney ?? false)
    ? r(weekends * constants.pocketMoneyPerWeekend)
    : 0;
  const bankTransfer = r(netSalary - pocketMoneyPaid);

  // Employer contributions
  const nii = r(netSalary * constants.niiEmployerRate);
  const pensionSubstitute =
    seniorityMonths >= 7
      ? r(constants.minimumMonthlyWage * constants.pensionSubstituteRate)
      : 0;
  const severanceSubstitute =
    seniorityMonths >= 7
      ? r(constants.minimumMonthlyWage * constants.severanceSubstituteRate)
      : 0;
  const cumulativePensionBalance = r(
    (previousPayslip?.employerContributions.cumulativePensionBalance ?? 0) + pensionSubstitute
  );
  const cumulativeSeveranceBalance = r(
    (previousPayslip?.employerContributions.cumulativeSeveranceBalance ?? 0) + severanceSubstitute
  );

  // Leave balances
  const vacationDaysPerYear = getVacationDaysPerYear(seniorityMonths);
  const vacationAccrued = r(vacationDaysPerYear / 12);
  const vacationPrevBalance = previousPayslip?.vacationAccount?.remaining ?? 0;
  const vacationRemaining = Math.max(
    0,
    r(vacationPrevBalance + vacationAccrued - worklogSummary.vacationDays)
  );

  const sickAccrued = 1.5;
  const sickPrevBalance = previousPayslip?.sickAccount?.remaining ?? 0;
  const sickRemaining = Math.max(
    0,
    r(sickPrevBalance + sickAccrued - worklogSummary.sickDays)
  );

  return {
    period,
    employeeInfo: {
      fullName: employee.fullName,
      passportNumber: employee.passportNumber,
      nationality: employee.nationality,
      employerName: employerProfile.employerName,
      employerTaxId: employerProfile.employerTaxId,
      employerAddress: employerProfile.employerAddress,
      employerCity: employerProfile.employerCity,
      employerZip: employerProfile.employerZip,
      employmentStartDate: employee.startDate,
      seniorityMonths,
    },
    workDetails: {
      workedDays: worklogSummary.workDays,
      totalWorkHours: worklogSummary.totalWorkHours,
      restDaysWorked: worklogSummary.restDays,
      vacationDays: worklogSummary.vacationDays,
      sickDays: worklogSummary.sickDays,
      holidayDays: worklogSummary.holidayDays,
    },
    payCalculation: {
      minimumWage: constants.minimumMonthlyWage,
      dailyRate: constants.dailyRate,
      hourlyRate: constants.minimumHourlyWage,
      baseSalary,
      restDayPremium,
      sickPayAdjustment,
      recoveryPay: 0,
      pocketMoneyPaid,
      grossSalary,
    },
    deductions: {
      medicalInsuranceDeduction,
      accommodationDeduction,
      utilitiesDeduction,
      foodDeduction,
      incomeTax,
      totalPermittedDeductions,
    },
    employerContributions: {
      nii,
      pensionSubstitute,
      severanceSubstitute,
      cumulativePensionBalance,
      cumulativeSeveranceBalance,
    },
    netSalary,
    bankTransfer,
    paymentInfo: {
      paymentMethod: 'bank',
      bankName: '',
      accountNumber: '',
      branchNumber: '',
    },
    vacationAccount: {
      previousBalance: vacationPrevBalance,
      accrued: vacationAccrued,
      used: worklogSummary.vacationDays,
      remaining: vacationRemaining,
    },
    sickAccount: {
      previousBalance: sickPrevBalance,
      accrued: sickAccrued,
      used: worklogSummary.sickDays,
      remaining: sickRemaining,
    },
  };
}
