import type { IUser, IForm, FormListItem, AdminUserView } from '@payslips-maker/shared';

// ─── Demo Users ────────────────────────────────────────────────────────────────

export const DEMO_USER: IUser = {
  _id: 'demo-user-admin',
  clerkId: 'demo-clerk-admin',
  email: 'israel@demo.local',
  fullName: 'ישראל האדמין',
  isAdmin: true,
  employerName: 'חברת הדמו בע"מ',
  employerTaxId: '512345678',
  createdAt: '2024-01-15T08:00:00.000Z',
  updatedAt: '2024-01-15T08:00:00.000Z',
};

const DAVID_COHEN: IUser = {
  _id: 'demo-user-1',
  clerkId: 'demo-clerk-1',
  email: 'david.cohen@demo.local',
  fullName: 'דוד כהן',
  isAdmin: false,
  employerName: 'כהן קבלנות בנין בע"מ',
  employerTaxId: '523456789',
  createdAt: '2024-02-01T08:00:00.000Z',
  updatedAt: '2024-02-01T08:00:00.000Z',
};

const SARAH_LEVI: IUser = {
  _id: 'demo-user-2',
  clerkId: 'demo-clerk-2',
  email: 'sarah.levi@demo.local',
  fullName: 'שרה לוי',
  isAdmin: false,
  employerName: 'לוי ניקיון ושמירה בע"מ',
  employerTaxId: '534567890',
  createdAt: '2024-03-10T08:00:00.000Z',
  updatedAt: '2024-03-10T08:00:00.000Z',
};

const YOSEF_MIZRAHI: IUser = {
  _id: 'demo-user-3',
  clerkId: 'demo-clerk-3',
  email: 'yosef.mizrahi@demo.local',
  fullName: 'יוסף מזרחי',
  isAdmin: false,
  employerName: 'מזרחי חקלאות בע"מ',
  employerTaxId: '545678901',
  createdAt: '2024-04-05T08:00:00.000Z',
  updatedAt: '2024-04-05T08:00:00.000Z',
};

const RACHEL_ABRAHAM: IUser = {
  _id: 'demo-user-4',
  clerkId: 'demo-clerk-4',
  email: 'rachel.abraham@demo.local',
  fullName: 'רחל אברהם',
  isAdmin: false,
  employerName: 'אברהם מסעדות בע"מ',
  employerTaxId: '556789012',
  createdAt: '2024-05-20T08:00:00.000Z',
  updatedAt: '2024-05-20T08:00:00.000Z',
};

export const ALL_DEMO_USERS: IUser[] = [
  DEMO_USER,
  DAVID_COHEN,
  SARAH_LEVI,
  YOSEF_MIZRAHI,
  RACHEL_ABRAHAM,
];

// ─── Demo Admin's Forms ─────────────────────────────────────────────────────────

const FORM_ADMIN_1: IForm = {
  _id: 'demo-form-admin-1',
  userId: 'demo-user-admin',
  clerkId: 'demo-clerk-admin',
  period: { month: 1, year: 2025 },
  employeeInfo: {
    fullName: 'Nguyen Van An',
    idNumber: 'P12345678',
    nationality: 'וייטנאמית',
    employerName: 'חברת הדמו בע"מ',
    employerTaxId: '512345678',
  },
  workDetails: {
    standardDays: 22,
    workedDays: 22,
    vacationDays: 0,
    sickDays: 0,
    holidayDays: 0,
    overtime100h: 0,
    overtime125h: 0,
    overtime150h: 0,
  },
  payCalculation: {
    dailyRate: 400,
    baseSalary: 8800,
    overtimePay: 0,
    vacationPay: 0,
    grossSalary: 8800,
  },
  deductions: {
    incomeTax: 880,
    nationalInsurance: 528,
    healthInsurance: 282,
    otherDeductions: 0,
  },
  employerContributions: {
    nationalInsurance: 1056,
    pension: 616,
  },
  netSalary: 7110,
  paymentInfo: {
    paymentMethod: 'bank',
    bankName: 'בנק הפועלים',
    accountNumber: '12345678',
    branchNumber: '600',
  },
  createdAt: '2025-01-31T10:00:00.000Z',
  updatedAt: '2025-01-31T10:00:00.000Z',
};

const FORM_ADMIN_2: IForm = {
  _id: 'demo-form-admin-2',
  userId: 'demo-user-admin',
  clerkId: 'demo-clerk-admin',
  period: { month: 2, year: 2025 },
  employeeInfo: {
    fullName: 'Ahmed Al-Rashid',
    idNumber: 'J98765432',
    nationality: 'ירדנית',
    employerName: 'חברת הדמו בע"מ',
    employerTaxId: '512345678',
  },
  workDetails: {
    standardDays: 20,
    workedDays: 20,
    vacationDays: 0,
    sickDays: 0,
    holidayDays: 0,
    overtime100h: 2,
    overtime125h: 0,
    overtime150h: 0,
  },
  payCalculation: {
    dailyRate: 450,
    baseSalary: 9000,
    overtimePay: 225,
    vacationPay: 0,
    grossSalary: 9225,
  },
  deductions: {
    incomeTax: 1015,
    nationalInsurance: 554,
    healthInsurance: 297,
    otherDeductions: 0,
  },
  employerContributions: {
    nationalInsurance: 1107,
    pension: 646,
  },
  netSalary: 7359,
  paymentInfo: {
    paymentMethod: 'bank',
    bankName: 'בנק לאומי',
    accountNumber: '87654321',
    branchNumber: '800',
  },
  createdAt: '2025-02-28T10:00:00.000Z',
  updatedAt: '2025-02-28T10:00:00.000Z',
};

const FORM_ADMIN_3: IForm = {
  _id: 'demo-form-admin-3',
  userId: 'demo-user-admin',
  clerkId: 'demo-clerk-admin',
  period: { month: 3, year: 2025 },
  employeeInfo: {
    fullName: 'Olena Kovalenko',
    idNumber: 'U55544433',
    nationality: 'אוקראינית',
    employerName: 'חברת הדמו בע"מ',
    employerTaxId: '512345678',
  },
  workDetails: {
    standardDays: 21,
    workedDays: 21,
    vacationDays: 1,
    sickDays: 0,
    holidayDays: 0,
    overtime100h: 0,
    overtime125h: 3,
    overtime150h: 0,
  },
  payCalculation: {
    dailyRate: 477,
    baseSalary: 10017,
    overtimePay: 537,
    vacationPay: 477,
    grossSalary: 11031,
  },
  deductions: {
    incomeTax: 1413,
    nationalInsurance: 662,
    healthInsurance: 354,
    otherDeductions: 0,
  },
  employerContributions: {
    nationalInsurance: 1324,
    pension: 772,
  },
  netSalary: 8602,
  paymentInfo: {
    paymentMethod: 'bank',
    bankName: 'בנק דיסקונט',
    accountNumber: '11223344',
    branchNumber: '50',
  },
  createdAt: '2025-03-31T10:00:00.000Z',
  updatedAt: '2025-03-31T10:00:00.000Z',
};

// ─── Other Users' Forms ─────────────────────────────────────────────────────────

const FORM_DAVID_1: IForm = {
  _id: 'demo-form-david-1',
  userId: 'demo-user-1',
  clerkId: 'demo-clerk-1',
  period: { month: 12, year: 2024 },
  employeeInfo: {
    fullName: 'Carlos Mendoza',
    idNumber: 'M33322211',
    nationality: 'מקסיקנית',
    employerName: 'כהן קבלנות בנין בע"מ',
    employerTaxId: '523456789',
  },
  workDetails: {
    standardDays: 22,
    workedDays: 20,
    vacationDays: 2,
    sickDays: 0,
    holidayDays: 0,
    overtime100h: 0,
    overtime125h: 0,
    overtime150h: 0,
  },
  payCalculation: {
    dailyRate: 350,
    baseSalary: 7000,
    overtimePay: 0,
    vacationPay: 700,
    grossSalary: 7700,
  },
  deductions: {
    incomeTax: 616,
    nationalInsurance: 462,
    healthInsurance: 248,
    otherDeductions: 0,
  },
  employerContributions: {
    nationalInsurance: 924,
    pension: 539,
  },
  netSalary: 6374,
  paymentInfo: {
    paymentMethod: 'bank',
    bankName: 'בנק מזרחי טפחות',
    accountNumber: '44455566',
    branchNumber: '123',
  },
  createdAt: '2024-12-31T10:00:00.000Z',
  updatedAt: '2024-12-31T10:00:00.000Z',
};

const FORM_DAVID_2: IForm = {
  _id: 'demo-form-david-2',
  userId: 'demo-user-1',
  clerkId: 'demo-clerk-1',
  period: { month: 1, year: 2025 },
  employeeInfo: {
    fullName: 'Priya Sharma',
    idNumber: 'I77788899',
    nationality: 'הודית',
    employerName: 'כהן קבלנות בנין בע"מ',
    employerTaxId: '523456789',
  },
  workDetails: {
    standardDays: 22,
    workedDays: 22,
    vacationDays: 0,
    sickDays: 0,
    holidayDays: 0,
    overtime100h: 0,
    overtime125h: 0,
    overtime150h: 0,
  },
  payCalculation: {
    dailyRate: 380,
    baseSalary: 8360,
    overtimePay: 0,
    vacationPay: 0,
    grossSalary: 8360,
  },
  deductions: {
    incomeTax: 753,
    nationalInsurance: 502,
    healthInsurance: 269,
    otherDeductions: 0,
  },
  employerContributions: {
    nationalInsurance: 1003,
    pension: 585,
  },
  netSalary: 6836,
  paymentInfo: {
    paymentMethod: 'bank',
    bankName: 'בנק הפועלים',
    accountNumber: '99988877',
    branchNumber: '410',
  },
  createdAt: '2025-01-31T10:00:00.000Z',
  updatedAt: '2025-01-31T10:00:00.000Z',
};

const FORM_SARAH_1: IForm = {
  _id: 'demo-form-sarah-1',
  userId: 'demo-user-2',
  clerkId: 'demo-clerk-2',
  period: { month: 11, year: 2024 },
  employeeInfo: {
    fullName: 'Mohamed Hassan',
    idNumber: 'E22233344',
    nationality: 'מצרית',
    employerName: 'לוי ניקיון ושמירה בע"מ',
    employerTaxId: '534567890',
  },
  workDetails: {
    standardDays: 21,
    workedDays: 21,
    vacationDays: 0,
    sickDays: 0,
    holidayDays: 0,
    overtime100h: 4,
    overtime125h: 0,
    overtime150h: 0,
  },
  payCalculation: {
    dailyRate: 320,
    baseSalary: 6720,
    overtimePay: 384,
    vacationPay: 0,
    grossSalary: 7104,
  },
  deductions: {
    incomeTax: 497,
    nationalInsurance: 426,
    healthInsurance: 228,
    otherDeductions: 0,
  },
  employerContributions: {
    nationalInsurance: 853,
    pension: 497,
  },
  netSalary: 5953,
  paymentInfo: {
    paymentMethod: 'bank',
    bankName: 'בנק לאומי',
    accountNumber: '66677788',
    branchNumber: '222',
  },
  createdAt: '2024-11-30T10:00:00.000Z',
  updatedAt: '2024-11-30T10:00:00.000Z',
};

const FORM_SARAH_2: IForm = {
  _id: 'demo-form-sarah-2',
  userId: 'demo-user-2',
  clerkId: 'demo-clerk-2',
  period: { month: 12, year: 2024 },
  employeeInfo: {
    fullName: 'Fatima Al-Zahra',
    idNumber: 'M55566677',
    nationality: 'מרוקאית',
    employerName: 'לוי ניקיון ושמירה בע"מ',
    employerTaxId: '534567890',
  },
  workDetails: {
    standardDays: 22,
    workedDays: 19,
    vacationDays: 3,
    sickDays: 0,
    holidayDays: 0,
    overtime100h: 0,
    overtime125h: 0,
    overtime150h: 0,
  },
  payCalculation: {
    dailyRate: 320,
    baseSalary: 6080,
    overtimePay: 0,
    vacationPay: 960,
    grossSalary: 7040,
  },
  deductions: {
    incomeTax: 493,
    nationalInsurance: 422,
    healthInsurance: 226,
    otherDeductions: 0,
  },
  employerContributions: {
    nationalInsurance: 845,
    pension: 493,
  },
  netSalary: 5899,
  paymentInfo: {
    paymentMethod: 'bank',
    bankName: 'בנק לאומי',
    accountNumber: '44433322',
    branchNumber: '222',
  },
  createdAt: '2024-12-31T10:00:00.000Z',
  updatedAt: '2024-12-31T10:00:00.000Z',
};

const FORM_YOSEF_1: IForm = {
  _id: 'demo-form-yosef-1',
  userId: 'demo-user-3',
  clerkId: 'demo-clerk-3',
  period: { month: 10, year: 2024 },
  employeeInfo: {
    fullName: 'Andrei Popescu',
    idNumber: 'R88877766',
    nationality: 'רומנית',
    employerName: 'מזרחי חקלאות בע"מ',
    employerTaxId: '545678901',
  },
  workDetails: {
    standardDays: 23,
    workedDays: 23,
    vacationDays: 0,
    sickDays: 0,
    holidayDays: 0,
    overtime100h: 0,
    overtime125h: 6,
    overtime150h: 2,
  },
  payCalculation: {
    dailyRate: 290,
    baseSalary: 6670,
    overtimePay: 979,
    vacationPay: 0,
    grossSalary: 7649,
  },
  deductions: {
    incomeTax: 611,
    nationalInsurance: 459,
    healthInsurance: 246,
    otherDeductions: 0,
  },
  employerContributions: {
    nationalInsurance: 918,
    pension: 535,
  },
  netSalary: 6333,
  paymentInfo: {
    paymentMethod: 'bank',
    bankName: 'בנק הפועלים',
    accountNumber: '55544433',
    branchNumber: '150',
  },
  createdAt: '2024-10-31T10:00:00.000Z',
  updatedAt: '2024-10-31T10:00:00.000Z',
};

const FORM_YOSEF_2: IForm = {
  _id: 'demo-form-yosef-2',
  userId: 'demo-user-3',
  clerkId: 'demo-clerk-3',
  period: { month: 11, year: 2024 },
  employeeInfo: {
    fullName: 'Svetlana Ivanova',
    idNumber: 'R11122233',
    nationality: 'רוסית',
    employerName: 'מזרחי חקלאות בע"מ',
    employerTaxId: '545678901',
  },
  workDetails: {
    standardDays: 21,
    workedDays: 21,
    vacationDays: 0,
    sickDays: 0,
    holidayDays: 0,
    overtime100h: 0,
    overtime125h: 0,
    overtime150h: 0,
  },
  payCalculation: {
    dailyRate: 295,
    baseSalary: 6195,
    overtimePay: 0,
    vacationPay: 0,
    grossSalary: 6195,
  },
  deductions: {
    incomeTax: 433,
    nationalInsurance: 372,
    healthInsurance: 199,
    otherDeductions: 0,
  },
  employerContributions: {
    nationalInsurance: 743,
    pension: 434,
  },
  netSalary: 5191,
  paymentInfo: {
    paymentMethod: 'cash',
    bankName: '',
    accountNumber: '',
    branchNumber: '',
  },
  createdAt: '2024-11-30T10:00:00.000Z',
  updatedAt: '2024-11-30T10:00:00.000Z',
};

const FORM_RACHEL_1: IForm = {
  _id: 'demo-form-rachel-1',
  userId: 'demo-user-4',
  clerkId: 'demo-clerk-4',
  period: { month: 2, year: 2025 },
  employeeInfo: {
    fullName: 'Jean-Pierre Dubois',
    idNumber: 'F99900011',
    nationality: 'צרפתית',
    employerName: 'אברהם מסעדות בע"מ',
    employerTaxId: '556789012',
  },
  workDetails: {
    standardDays: 20,
    workedDays: 20,
    vacationDays: 0,
    sickDays: 0,
    holidayDays: 0,
    overtime100h: 8,
    overtime125h: 4,
    overtime150h: 0,
  },
  payCalculation: {
    dailyRate: 500,
    baseSalary: 10000,
    overtimePay: 1500,
    vacationPay: 0,
    grossSalary: 11500,
  },
  deductions: {
    incomeTax: 1495,
    nationalInsurance: 690,
    healthInsurance: 369,
    otherDeductions: 0,
  },
  employerContributions: {
    nationalInsurance: 1380,
    pension: 805,
  },
  netSalary: 8946,
  paymentInfo: {
    paymentMethod: 'bank',
    bankName: 'בנק מזרחי טפחות',
    accountNumber: '77766655',
    branchNumber: '321',
  },
  createdAt: '2025-02-28T10:00:00.000Z',
  updatedAt: '2025-02-28T10:00:00.000Z',
};

const FORM_RACHEL_2: IForm = {
  _id: 'demo-form-rachel-2',
  userId: 'demo-user-4',
  clerkId: 'demo-clerk-4',
  period: { month: 3, year: 2025 },
  employeeInfo: {
    fullName: 'Anna Kowalski',
    idNumber: 'P44455566',
    nationality: 'פולנית',
    employerName: 'אברהם מסעדות בע"מ',
    employerTaxId: '556789012',
  },
  workDetails: {
    standardDays: 21,
    workedDays: 18,
    vacationDays: 2,
    sickDays: 1,
    holidayDays: 0,
    overtime100h: 0,
    overtime125h: 0,
    overtime150h: 0,
  },
  payCalculation: {
    dailyRate: 500,
    baseSalary: 9000,
    overtimePay: 0,
    vacationPay: 1000,
    grossSalary: 10000,
  },
  deductions: {
    incomeTax: 1200,
    nationalInsurance: 600,
    healthInsurance: 321,
    otherDeductions: 0,
  },
  employerContributions: {
    nationalInsurance: 1200,
    pension: 700,
  },
  netSalary: 7879,
  paymentInfo: {
    paymentMethod: 'bank',
    bankName: 'בנק מזרחי טפחות',
    accountNumber: '33344455',
    branchNumber: '321',
  },
  createdAt: '2025-03-31T10:00:00.000Z',
  updatedAt: '2025-03-31T10:00:00.000Z',
};

// ─── Aggregates ─────────────────────────────────────────────────────────────────

export const DEMO_USER_FORMS: IForm[] = [FORM_ADMIN_1, FORM_ADMIN_2, FORM_ADMIN_3];

export const ALL_DEMO_FORMS: IForm[] = [
  FORM_ADMIN_1, FORM_ADMIN_2, FORM_ADMIN_3,
  FORM_DAVID_1, FORM_DAVID_2,
  FORM_SARAH_1, FORM_SARAH_2,
  FORM_YOSEF_1, FORM_YOSEF_2,
  FORM_RACHEL_1, FORM_RACHEL_2,
];

export const DEMO_USER_FORMS_LIST: FormListItem[] = DEMO_USER_FORMS.map((f) => ({
  _id: f._id,
  period: f.period,
  employeeName: f.employeeInfo.fullName,
  grossSalary: f.payCalculation.grossSalary,
  netSalary: f.netSalary,
  updatedAt: f.updatedAt,
}));

function formCountFor(userId: string): number {
  return ALL_DEMO_FORMS.filter((f) => f.userId === userId).length;
}

export const DEMO_ADMIN_USERS: AdminUserView[] = ALL_DEMO_USERS.map((u) => ({
  ...u,
  formCount: formCountFor(u._id),
}));

// ─── Mock API Router ────────────────────────────────────────────────────────────

export function getDemoResponse<T>(url: string, method: string): T {
  const cleanUrl = url.split('?')[0];

  // GET /api/users/me
  if (cleanUrl === '/api/users/me' && method === 'GET') {
    return { success: true, data: DEMO_USER } as T;
  }

  // PATCH /api/users/me
  if (cleanUrl === '/api/users/me' && (method === 'PATCH' || method === 'PUT')) {
    return { success: true, data: DEMO_USER } as T;
  }

  // GET /api/forms  (user's own forms list)
  if (cleanUrl === '/api/forms' && method === 'GET') {
    return { success: true, data: DEMO_USER_FORMS_LIST } as T;
  }

  // POST /api/forms  (create — no-op, usePayslipForm blocks this in demo mode)
  if (cleanUrl === '/api/forms' && method === 'POST') {
    return { success: true, data: DEMO_USER_FORMS[0] } as T;
  }

  // GET/PUT /api/forms/:id
  const formMatch = cleanUrl.match(/^\/api\/forms\/([^/]+)$/);
  if (formMatch) {
    const form = ALL_DEMO_FORMS.find((f) => f._id === formMatch[1]);
    return { success: true, data: form ?? null } as T;
  }

  // GET /api/admin/users/:id
  const adminUserMatch = cleanUrl.match(/^\/api\/admin\/users\/([^/]+)$/);
  if (adminUserMatch) {
    const user = ALL_DEMO_USERS.find((u) => u._id === adminUserMatch[1]);
    const forms: FormListItem[] = ALL_DEMO_FORMS
      .filter((f) => f.userId === adminUserMatch[1])
      .map((f) => ({
        _id: f._id,
        period: f.period,
        employeeName: f.employeeInfo.fullName,
        grossSalary: f.payCalculation.grossSalary,
        netSalary: f.netSalary,
        updatedAt: f.updatedAt,
      }));
    return { success: true, data: { user: user ?? null, forms } } as T;
  }

  // GET /api/admin/users  (paginated)
  if (cleanUrl === '/api/admin/users' && method === 'GET') {
    return {
      success: true,
      data: DEMO_ADMIN_USERS,
      total: DEMO_ADMIN_USERS.length,
      page: 1,
      limit: 20,
    } as T;
  }

  // GET /api/admin/forms
  if (cleanUrl === '/api/admin/forms' && method === 'GET') {
    return {
      success: true,
      forms: ALL_DEMO_FORMS,
      total: ALL_DEMO_FORMS.length,
      page: 1,
      limit: 20,
    } as T;
  }

  // Fallback — should not happen
  console.warn('[Demo] Unhandled API route:', method, url);
  return { success: false, data: null } as T;
}
