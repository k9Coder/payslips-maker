import { payslipFormSchema, type PayslipFormValues } from './payslip.schema';
import { PayslipFormSections } from './components/PayslipFormSections';
import { PayslipPDF } from './components/PayslipPDF';
import type { FormConfig } from '../forms/types/form-config.types';
import type { IEmployee, IForm } from '@payslips-maker/shared';

export const payslipFormConfig: FormConfig<PayslipFormValues> = {
  labelHe: 'מחליף תלוש שכר',
  formType: 'payslip',
  schema: payslipFormSchema,

  defaultValues: (employee: IEmployee): PayslipFormValues => {
    const now = new Date();
    const start = new Date(employee.startDate ?? '');
    const periodStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const seniorityMonths = isNaN(start.getTime()) ? 0 : Math.max(
      0,
      (periodStart.getFullYear() - start.getFullYear()) * 12 +
      (periodStart.getMonth() - start.getMonth())
    );
    return {
      period: { month: now.getMonth() + 1, year: now.getFullYear() },
      employeeInfo: {
        fullName: employee.fullName ?? {},
        passportNumber: employee.passportNumber ?? '',
        nationality: employee.nationality ?? '',
        employerName: {},
        employerTaxId: '',
        employmentStartDate: employee.startDate ?? '',
        seniorityMonths,
      },
      workDetails: { workedDays: 0, restDaysWorked: 0, vacationDays: 0, sickDays: 0, holidayDays: 0 },
      payCalculation: { minimumWage: 0, dailyRate: 0, baseSalary: 0, restDayPremium: 0, sickPayAdjustment: 0, recoveryPay: 0, pocketMoneyPaid: 0, grossSalary: 0 },
      deductions: { medicalInsuranceDeduction: 0, accommodationDeduction: 0, utilitiesDeduction: 0, foodDeduction: 0, incomeTax: 0, totalPermittedDeductions: 0 },
      employerContributions: { nii: 0, pensionSubstitute: 0, severanceSubstitute: 0, cumulativePensionBalance: 0, cumulativeSeveranceBalance: 0 },
      netSalary: 0,
      bankTransfer: 0,
      paymentInfo: { paymentMethod: 'bank', bankName: '', accountNumber: '', branchNumber: '' },
      vacationAccount: null,
      sickAccount: null,
    };
  },

  fromApiForm: (form: IForm): PayslipFormValues => ({
    period: form.period,
    employeeInfo: {
      fullName: form.employeeInfo.fullName,
      passportNumber: form.employeeInfo.passportNumber,
      nationality: form.employeeInfo.nationality,
      employerName: form.employeeInfo.employerName,
      employerTaxId: form.employeeInfo.employerTaxId,
      employerAddress: form.employeeInfo.employerAddress,
      employerCity: form.employeeInfo.employerCity,
      employerZip: form.employeeInfo.employerZip,
      employmentStartDate: form.employeeInfo.employmentStartDate,
      seniorityMonths: form.employeeInfo.seniorityMonths,
    },
    workDetails: form.workDetails,
    payCalculation: form.payCalculation,
    deductions: form.deductions,
    employerContributions: form.employerContributions,
    netSalary: form.netSalary,
    bankTransfer: form.bankTransfer,
    paymentInfo: form.paymentInfo,
    vacationAccount: form.vacationAccount ?? null,
    sickAccount: form.sickAccount ?? null,
  }),

  FormSections: PayslipFormSections,
  PDFDocument: PayslipPDF,
};
