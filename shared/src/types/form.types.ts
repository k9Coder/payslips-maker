import type { MultiLangString } from './employee.types';

export type FormType = 'payslip' | 'final_settlement';

export interface IVacationAccount {
  previousBalance: number;
  accrued: number;
  used: number;
  remaining: number;
}

export interface ISickAccount {
  previousBalance: number;
  accrued: number;
  used: number;
  remaining: number;
}

export interface IEmployeeInfo {
  fullName: MultiLangString;
  passportNumber: string;
  nationality: string;
  employerName: MultiLangString;
  employerTaxId: string;
  employerAddress?: string;
  employerCity?: string;
  employerZip?: string;
  employmentStartDate: string;
  seniorityMonths: number;
}

export interface IWorkDetails {
  workedDays: number;
  totalWorkHours: number;
  restDaysWorked: number;
  vacationDays: number;
  sickDays: number;
  holidayDays: number;
}

export interface IPayCalculation {
  minimumWage: number;
  dailyRate: number;
  hourlyRate: number;
  baseSalary: number;
  restDayPremium: number;
  sickPayAdjustment: number;
  recoveryPay: number;
  pocketMoneyPaid: number;
  grossSalary: number;
}

export interface IDeductions {
  medicalInsuranceDeduction: number;
  accommodationDeduction: number;
  utilitiesDeduction: number;
  foodDeduction: number;
  incomeTax: number;
  totalPermittedDeductions: number;
}

export interface IEmployerContributions {
  nii: number;
  pensionSubstitute: number;
  severanceSubstitute: number;
  cumulativePensionBalance: number;
  cumulativeSeveranceBalance: number;
}

export interface IPaymentInfo {
  paymentMethod: string;
  bankName: string;
  accountNumber: string;
  branchNumber: string;
}

export interface IPeriod {
  month: number;
  year: number;
}

export interface IFinalSettlementData {
  // Employment period
  employmentStartDate: string;
  employmentEndDate: string;
  totalMonths: number;
  terminationReason: 'dismissal' | 'resignation' | 'mutual';

  // Last salary info
  lastMonthlySalary: number;
  dailyRate: number;

  // Severance (פיצויים)
  severanceEligible: boolean;
  severancePay: number;

  // Vacation payout (פדיון חופשה)
  vacationDaysAccrued: number;
  vacationDaysUsed: number;
  unusedVacationDays: number;
  vacationPayout: number;

  // Recuperation pay (הבראה)
  recuperationDaysEntitled: number;
  recuperationDaysAlreadyPaid: number;
  recuperationPayout: number;

  // Notice period (הודעה מוקדמת)
  noticePeriodDays: number;
  noticePeriodPay: number;
  noticeActuallyGiven: boolean;

  // Additional unpaid items
  unpaidWages: number;
  otherAdditions: number;

  // Totals
  totalGross: number;
  deductions: {
    incomeTax: number;
    nationalInsurance: number;
    healthInsurance: number;
    otherDeductions: number;
  };
  netTotal: number;
}

export interface IPayslipConstants {
  _id?: string;
  minimumMonthlyWage: number;
  minimumHourlyWage: number;
  dailyRate: number;
  restDayPremium: number;
  medicalDeductionCeiling: number;
  utilitiesDeductionCeiling: number;
  recoveryPayDayRate: number;
  niiEmployerRate: number;
  pensionSubstituteRate: number;
  severanceSubstituteRate: number;
  pocketMoneyPerWeekend: number;
  effectiveFrom: string;
  updatedAt?: Date | string;
}

export interface IForm {
  _id: string;
  userId: string;
  clerkId: string;
  employeeId: string;
  formType: FormType;
  producedByName: string;
  period: IPeriod;
  employeeInfo: IEmployeeInfo;
  workDetails: IWorkDetails;
  payCalculation: IPayCalculation;
  deductions: IDeductions;
  employerContributions: IEmployerContributions;
  netSalary: number;
  bankTransfer: number;
  paymentInfo: IPaymentInfo;
  finalSettlementData?: IFinalSettlementData | null;
  vacationAccount?: IVacationAccount | null;
  sickAccount?: ISickAccount | null;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export type CreateFormDto = Omit<IForm, '_id' | 'userId' | 'clerkId' | 'producedByName' | 'createdAt' | 'updatedAt'>;
export type UpdateFormDto = CreateFormDto;

export interface FormListItem {
  _id: string;
  formType: FormType;
  employeeId: string;
  period: IPeriod;
  employeeName: MultiLangString;
  grossSalary: number;
  netSalary: number;
  producedByName: string;
  updatedAt: Date | string;
}
