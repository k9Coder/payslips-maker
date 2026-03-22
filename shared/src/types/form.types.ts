export interface IEmployeeInfo {
  fullName: string;
  idNumber: string;
  nationality: string;
  employerName: string;
  employerTaxId: string;
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

export interface IForm {
  _id: string;
  userId: string;
  clerkId: string;
  period: IPeriod;
  employeeInfo: IEmployeeInfo;
  workDetails: IWorkDetails;
  payCalculation: IPayCalculation;
  deductions: IDeductions;
  employerContributions: IEmployerContributions;
  netSalary: number;
  paymentInfo: IPaymentInfo;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export type CreateFormDto = Omit<IForm, '_id' | 'userId' | 'clerkId' | 'createdAt' | 'updatedAt'>;
export type UpdateFormDto = CreateFormDto;

export interface FormListItem {
  _id: string;
  period: IPeriod;
  employeeName: string;
  grossSalary: number;
  netSalary: number;
  updatedAt: Date | string;
}
