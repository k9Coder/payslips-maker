import type { FormConfig, ToApiPayloadCtx } from '../forms/types/form-config.types';
import type { IEmployee, IForm, CreateFormDto } from '@payslips-maker/shared';
import { finalSettlementFormSchema, type FinalSettlementFormValues } from './final-settlement.schema';
import { FinalSettlementFormSections } from './components/FinalSettlementFormSections';
import { FinalSettlementPDF } from './components/FinalSettlementPDF';

export const finalSettlementFormConfig: FormConfig<FinalSettlementFormValues> = {
  labelHe: 'גמר חשבון',
  formType: 'final_settlement',
  schema: finalSettlementFormSchema,

  defaultValues: (employee: IEmployee) => ({
    employmentStartDate: employee.startDate,
    employmentEndDate: new Date().toISOString().slice(0, 10),
    terminationReason: 'dismissal' as const,
    lastMonthlySalary: 0,
    vacationDaysUsed: 0,
    recuperationDaysAlreadyPaid: 0,
    noticeActuallyGiven: false,
    unpaidWages: 0,
    otherAdditions: 0,
    totalMonths: 0,
    dailyRate: 0,
    severanceEligible: false,
    severancePay: 0,
    vacationDaysAccrued: 0,
    unusedVacationDays: 0,
    vacationPayout: 0,
    recuperationDaysEntitled: 0,
    recuperationPayout: 0,
    noticePeriodDays: 0,
    noticePeriodPay: 0,
    totalGross: 0,
    deductions: { incomeTax: 0, nationalInsurance: 0, healthInsurance: 0, otherDeductions: 0 },
    netTotal: 0,
  }),

  fromApiForm: (form: IForm): FinalSettlementFormValues => {
    const fs = form.finalSettlementData!;
    return {
      employmentStartDate: fs.employmentStartDate,
      employmentEndDate: fs.employmentEndDate,
      terminationReason: fs.terminationReason,
      lastMonthlySalary: fs.lastMonthlySalary,
      vacationDaysUsed: fs.vacationDaysUsed,
      recuperationDaysAlreadyPaid: fs.recuperationDaysAlreadyPaid,
      noticeActuallyGiven: fs.noticeActuallyGiven,
      unpaidWages: fs.unpaidWages,
      otherAdditions: fs.otherAdditions,
      totalMonths: fs.totalMonths,
      dailyRate: fs.dailyRate,
      severanceEligible: fs.severanceEligible,
      severancePay: fs.severancePay,
      vacationDaysAccrued: fs.vacationDaysAccrued,
      unusedVacationDays: fs.unusedVacationDays,
      vacationPayout: fs.vacationPayout,
      recuperationDaysEntitled: fs.recuperationDaysEntitled,
      recuperationPayout: fs.recuperationPayout,
      noticePeriodDays: fs.noticePeriodDays,
      noticePeriodPay: fs.noticePeriodPay,
      totalGross: fs.totalGross,
      deductions: fs.deductions,
      netTotal: fs.netTotal,
    };
  },

  toApiPayload: (
    data: FinalSettlementFormValues,
    { formType, employeeId }: ToApiPayloadCtx
  ): Partial<CreateFormDto> => ({
    formType: formType as CreateFormDto['formType'],
    employeeId,
    // Dummy payslip fields required by the shared schema
    period: { month: new Date().getMonth() + 1, year: new Date().getFullYear() },
    employeeInfo: { fullName: {}, passportNumber: '', nationality: '', employerName: {}, employerTaxId: '', employmentStartDate: '', seniorityMonths: 0 },
    workDetails: { workedDays: 0, totalWorkHours: 0, restDaysWorked: 0, vacationDays: 0, sickDays: 0, holidayDays: 0 },
    payCalculation: { minimumWage: 0, dailyRate: 0, baseSalary: 0, restDayPremium: 0, sickPayAdjustment: 0, recoveryPay: 0, pocketMoneyPaid: 0, grossSalary: 0 },
    deductions: { medicalInsuranceDeduction: 0, accommodationDeduction: 0, utilitiesDeduction: 0, foodDeduction: 0, incomeTax: 0, totalPermittedDeductions: 0 },
    employerContributions: { nii: 0, pensionSubstitute: 0, severanceSubstitute: 0, cumulativePensionBalance: 0, cumulativeSeveranceBalance: 0 },
    netSalary: 0,
    bankTransfer: 0,
    paymentInfo: { paymentMethod: '', bankName: '', accountNumber: '', branchNumber: '' },
    finalSettlementData: data,
  }),

  FormSections: FinalSettlementFormSections,
  PDFDocument: FinalSettlementPDF,
};
