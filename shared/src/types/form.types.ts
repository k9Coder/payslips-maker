import type { MultiLangString } from './employee.types';

export type FormType = 'payslip' | 'final_settlement';

export interface ICustomPayItem {
  code: string;
  description: MultiLangString;
  quantity?: number;
  rate?: number;
  amount: number;
  taxPercent?: number;
}

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
  idNumber: string;
  nationality: string;
  employerName: MultiLangString;
  employerTaxId: string;
  // Employer additions
  employerAddress?: string;
  employerCity?: string;
  employerZip?: string;
  employerRegistrationNumber?: string;
  taxFileNumber?: string;
  // Employee personal details
  employeeNumber?: string;
  jobTitle?: MultiLangString;
  department?: MultiLangString;
  familyStatus?: string;
  grade?: string;
  jobFraction?: number;
  employmentStartDate?: string;
  taxCalcType?: string;
  nationalInsuranceType?: string;
  salaryBasis?: 'monthly' | 'daily' | 'hourly';
  // Employee address
  employeeAddress?: string;
  employeeCity?: string;
  employeeZip?: string;
}

export interface IWorkDetails {
  standardDays: number;
  workedDays: number;
  vacationDays: number;
  sickDays: number;
  holidayDays: number;
  overtime100h: number;
  overtime125h: number;
  overtime150h: number;
}

export interface IPayCalculation {
  dailyRate: number;
  baseSalary: number;
  overtimePay: number;
  vacationPay: number;
  grossSalary: number;
}

export interface IDeductions {
  incomeTax: number;
  nationalInsurance: number;
  healthInsurance: number;
  otherDeductions: number;
}

export interface IEmployerContributions {
  nationalInsurance: number;
  pension: number;
  pensionFund?: string;
  pensionEmployeeRate?: number;
  pensionEmployerRate?: number;
  severanceFund?: number;
  educationFund?: number;
  educationFundEmployee?: number;
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
  employmentStartDate: string;       // YYYY-MM-DD
  employmentEndDate: string;         // YYYY-MM-DD
  totalMonths: number;               // calculated
  terminationReason: 'dismissal' | 'resignation' | 'mutual';

  // Last salary info
  lastMonthlySalary: number;
  dailyRate: number;                 // calculated: lastMonthlySalary / 22

  // Severance (פיצויים)
  severanceEligible: boolean;        // calculated based on terminationReason + tenure
  severancePay: number;              // calculated

  // Vacation payout (פדיון חופשה)
  vacationDaysAccrued: number;       // calculated (based on tenure)
  vacationDaysUsed: number;          // user input
  unusedVacationDays: number;        // calculated: accrued - used
  vacationPayout: number;            // calculated

  // Recuperation pay (הבראה)
  recuperationDaysEntitled: number;  // calculated (based on tenure)
  recuperationDaysAlreadyPaid: number; // user input
  recuperationPayout: number;        // calculated

  // Notice period (הודעה מוקדמת)
  noticePeriodDays: number;          // calculated
  noticePeriodPay: number;           // calculated
  noticeActuallyGiven: boolean;      // user input — if true, no notice pay

  // Additional unpaid items
  unpaidWages: number;               // user input
  otherAdditions: number;            // user input

  // Totals
  totalGross: number;                // calculated
  deductions: {
    incomeTax: number;
    nationalInsurance: number;
    healthInsurance: number;
    otherDeductions: number;
  };
  netTotal: number;                  // calculated
}

export interface IForm {
  _id: string;
  userId: string;       // producer — who generated this form
  clerkId: string;
  employeeId: string;
  formType: FormType;
  producedByName: string; // snapshot of producer's fullName at creation time
  period: IPeriod;
  employeeInfo: IEmployeeInfo;
  workDetails: IWorkDetails;
  payCalculation: IPayCalculation;
  deductions: IDeductions;
  employerContributions: IEmployerContributions;
  netSalary: number;
  paymentInfo: IPaymentInfo;
  finalSettlementData?: IFinalSettlementData | null;
  customPayItems?: ICustomPayItem[];
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
