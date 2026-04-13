export interface PayslipPDFTranslation {
  title: string;
  printedOn: string;
  period: string;
  months: Record<number, string>;

  header: {
    taxFileNumber: string;
    employerRegistrationNumber: string;
    company: string;
    address: string;
    cityZip: string;
  };

  personalDetails: {
    sectionTitle: string;
    employeeNumber: string;
    taxCalcType: string;
    nationalInsuranceType: string;
    jobFraction: string;
    employmentStartDate: string;
    idNumber: string;
    jobTitle: string;
    salaryBasis: string;
    department: string;
    familyStatus: string;
    grade: string;
    bankAccount: string;
    bankCode: string;
    salaryBasisValues: {
      monthly: string;
      daily: string;
      hourly: string;
    };
  };

  addressBox: {
    sectionTitle: string;
  };

  table: {
    paymentCode: string;
    quantity: string;
    rate: string;
    grossAmount: string;
    taxPercent: string;
    payment: string;
    mandatoryDeduction: string;
    deductionType: string;
  };

  earnings: {
    sectionTitle: string;
    amount: string;
    baseSalary: string;
    overtimePay: string;
    overtime125: string;
    overtime150: string;
    vacationPay: string;
    vacationDays: string;
    sickDays: string;
    grossSalary: string;
  };

  deductionRows: {
    incomeTax: string;
    nationalInsurance: string;
    healthInsurance: string;
    pension: string;
    educationFund: string;
    otherDeductions: string;
    totalMandatoryDeductions: string;
    incomeTaxShort: string;
    niShort: string;
    healthShort: string;
    pensionShort: string;
  };

  netPayBox: {
    grossSalary: string;
    totalDeductions: string;
    netSalary: string;
    voluntaryDeductions: string;
    netPayment: string;
  };

  vacationAccount: {
    sectionTitle: string;
    previousBalance: string;
    accrued: string;
    used: string;
    remaining: string;
  };

  sickAccount: {
    sectionTitle: string;
    previousBalance: string;
    accrued: string;
    used: string;
    remaining: string;
  };

  taxData: {
    sectionTitle: string;
    cumulativeGross: string;
    cumulativeTax: string;
    creditPoints: string;
    taxBracket: string;
  };

  additionalData: {
    sectionTitle: string;
    standardDays: string;
    workedDays: string;
    vacationDays: string;
    sickDays: string;
    holidayDays: string;
    creditPoints: string;
  };

  deductions: {
    sectionTitle: string;
    amount: string;
    incomeTax: string;
    nationalInsurance: string;
    healthInsurance: string;
    otherDeductions: string;
    total: string;
  };

  employerContributions: {
    sectionTitle: string;
    nationalInsurance: string;
    pension: string;
    pensionFund: string;
    educationFund: string;
    severanceFund: string;
  };

  payment: {
    sectionTitle: string;
    bank: string;
    branch: string;
    accountNumber: string;
  };

  employee: {
    name: string;
    idNumber: string;
    nationality: string;
    workedDays: string;
    dailyRate: string;
  };

  netSalary: string;
  taxId: string;
  signature: string;
  date: string;
}

export interface FinalSettlementPDFTranslation {
  title: string;
  employee: {
    name: string;
    idNumber: string;
    nationality: string;
    lastMonthlySalary: string;
  };
  employmentPeriod: string;
  terminationReasons: {
    dismissal: string;
    resignation: string;
    mutual: string;
  };
  totalMonths: string;
  items: {
    severance: string;
    vacationPayout: string;
    recuperation: string;
    noticePay: string;
    unpaidWages: string;
    otherAdditions: string;
  };
  subtotalGross: string;
  deductions: {
    sectionTitle: string;
    incomeTax: string;
    nationalInsurance: string;
    healthInsurance: string;
    otherDeductions: string;
    total: string;
  };
  netTotal: string;
  date: string;
  signature: string;
}

export interface PDFTranslations {
  payslip: PayslipPDFTranslation;
  finalSettlement: FinalSettlementPDFTranslation;
}
