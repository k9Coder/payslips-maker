/**
 * Seed script — populates MongoDB with realistic mock data.
 * Run from the repo root:  npx tsx server/scripts/seed.ts
 * Or from server/:          npx tsx scripts/seed.ts
 *
 * Safe to re-run: deletes all documents whose clerkId starts with "user_mock_"
 * (users + their employees, worklogs, forms) before re-inserting.
 */
import path from 'path';
import { config } from 'dotenv';
import mongoose, { Types } from 'mongoose';

config({ path: path.resolve(__dirname, '../.env') });

import { User } from '../src/domains/users/user.model';
import { Employee } from '../src/domains/employees/employee.model';
import { WorkLog } from '../src/domains/worklog/worklog.model';
import { Form } from '../src/domains/forms/form.model';
import { PayslipConstants } from '../src/domains/payslip-constants/payslip-constants.model';

const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
  console.error('❌  MONGODB_URI not found in server/.env');
  process.exit(1);
}

// ── Legal constants (April 2026) ──────────────────────────────────────────────

const CONSTANTS = {
  minimumMonthlyWage: 6443.85,
  dailyRate: 257.75,
  restDayPremium: 426.35,
  medicalDeductionCeiling: 164.91,
  utilitiesDeductionCeiling: 94.34,
  recoveryPayDayRate: 418.00,
  niiEmployerRate: 0.036,
  pensionSubstituteRate: 0.065,
  severanceSubstituteRate: 0.060,
  pocketMoneyPerWeekend: 100,
};

const r = (n: number) => Math.round(n * 100) / 100;

// ── date helpers ─────────────────────────────────────────────────────────────

function getIsraeliWorkdays(year: number, month: number): string[] {
  const days: string[] = [];
  const d = new Date(year, month - 1, 1);
  while (d.getMonth() === month - 1) {
    const dow = d.getDay();
    if (dow !== 5 && dow !== 6) days.push(d.toISOString().slice(0, 10));
    d.setDate(d.getDate() + 1);
  }
  return days;
}

// ── worklog builder ───────────────────────────────────────────────────────────

interface WorklogSpec {
  employeeId: Types.ObjectId;
  userId: Types.ObjectId;
  year: number;
  month: number;
  sickDays?: number;
  vacationDays?: number;
  restDays?: number; // days where employee worked their weekly rest day
  holidays?: string[];
}

function buildWorklogEntries(spec: WorklogSpec) {
  const {
    employeeId, userId, year, month,
    sickDays = 0, vacationDays = 0, restDays = 0, holidays = [],
  } = spec;

  const holidaySet = new Set(holidays);
  const workdays = getIsraeliWorkdays(year, month).filter((d) => !holidaySet.has(d));
  const entries: object[] = [];

  for (const date of holidays) {
    entries.push({ employeeId, userId, date, type: 'holiday', hours: 0 });
  }

  let sick = sickDays;
  let vacation = vacationDays;
  let rest = restDays;

  for (const date of workdays) {
    if (sick > 0) {
      entries.push({ employeeId, userId, date, type: 'sick', hours: 0 });
      sick--;
    } else if (vacation > 0) {
      entries.push({ employeeId, userId, date, type: 'vacation', hours: 8, startTime: '08:00', endTime: '16:00' });
      vacation--;
    } else if (rest > 0) {
      entries.push({ employeeId, userId, date, type: 'rest_day', hours: 9, startTime: '08:00', endTime: '17:00' });
      rest--;
    } else {
      entries.push({ employeeId, userId, date, type: 'work', hours: 9, startTime: '08:00', endTime: '17:00' });
    }
  }

  return entries;
}

// ── payslip builder ───────────────────────────────────────────────────────────

interface PayslipSpec {
  userId: Types.ObjectId;
  clerkId: string;
  employeeId: Types.ObjectId;
  producedByName: string;
  month: number;
  year: number;
  workedDays: number;
  restDaysWorked: number;
  sickDays: number;
  vacationDays: number;
  holidayDays: number;
  seniorityMonths: number;
  employeeInfo: object;
  paymentInfo: object;
  vacationPrevBalance?: number;
  sickPrevBalance?: number;
  cumulativePensionBalance?: number;
  cumulativeSeveranceBalance?: number;
}

function buildPayslip(s: PayslipSpec) {
  const baseSalary = r(CONSTANTS.minimumMonthlyWage);
  const restDayPremium = r(s.restDaysWorked * CONSTANTS.restDayPremium);

  const sick = s.sickDays;
  let sickPayAdjustment = 0;
  if (sick >= 1) sickPayAdjustment -= CONSTANTS.dailyRate;
  if (sick >= 2) sickPayAdjustment -= r(CONSTANTS.dailyRate * 0.5);
  if (sick >= 3) sickPayAdjustment -= r(CONSTANTS.dailyRate * 0.5);
  sickPayAdjustment = r(sickPayAdjustment);

  const grossSalary = r(baseSalary + restDayPremium + sickPayAdjustment);

  const medicalInsuranceDeduction = 0;
  const accommodationDeduction = 0;
  const utilitiesDeduction = 0;
  const foodDeduction = 0;
  const incomeTax = 0;
  const totalPermittedDeductions = 0;

  const netSalary = r(grossSalary - totalPermittedDeductions);
  const pocketMoneyPaid = 0;
  const bankTransfer = r(netSalary - pocketMoneyPaid);

  const nii = r(netSalary * CONSTANTS.niiEmployerRate);
  const pensionSubstitute = s.seniorityMonths >= 7 ? r(CONSTANTS.minimumMonthlyWage * CONSTANTS.pensionSubstituteRate) : 0;
  const severanceSubstitute = s.seniorityMonths >= 7 ? r(CONSTANTS.minimumMonthlyWage * CONSTANTS.severanceSubstituteRate) : 0;
  const cumulativePensionBalance = r((s.cumulativePensionBalance ?? 0) + pensionSubstitute);
  const cumulativeSeveranceBalance = r((s.cumulativeSeveranceBalance ?? 0) + severanceSubstitute);

  const years = Math.floor(s.seniorityMonths / 12);
  const vacationDaysPerYear = years <= 4 ? 14 : years === 5 ? 16 : 18;
  const vacationAccrued = r(vacationDaysPerYear / 12);
  const vacationPrevBalance = s.vacationPrevBalance ?? 0;
  const vacationRemaining = Math.max(0, r(vacationPrevBalance + vacationAccrued - s.vacationDays));

  const sickAccrued = 1.5;
  const sickPrevBalance = s.sickPrevBalance ?? 0;
  const sickRemaining = Math.max(0, r(sickPrevBalance + sickAccrued - s.sickDays));

  return {
    userId: s.userId,
    clerkId: s.clerkId,
    employeeId: s.employeeId,
    formType: 'payslip',
    producedByName: s.producedByName,
    period: { month: s.month, year: s.year },
    employeeInfo: s.employeeInfo,
    workDetails: {
      workedDays: s.workedDays,
      restDaysWorked: s.restDaysWorked,
      vacationDays: s.vacationDays,
      sickDays: s.sickDays,
      holidayDays: s.holidayDays,
    },
    payCalculation: {
      minimumWage: CONSTANTS.minimumMonthlyWage,
      dailyRate: CONSTANTS.dailyRate,
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
    paymentInfo: s.paymentInfo,
    vacationAccount: {
      previousBalance: vacationPrevBalance,
      accrued: vacationAccrued,
      used: s.vacationDays,
      remaining: vacationRemaining,
    },
    sickAccount: {
      previousBalance: sickPrevBalance,
      accrued: sickAccrued,
      used: s.sickDays,
      remaining: sickRemaining,
    },
  };
}

// ── main ──────────────────────────────────────────────────────────────────────

async function seed() {
  await mongoose.connect(MONGODB_URI!);
  console.log('✅  Connected to MongoDB');

  // ── Seed PayslipConstants ──────────────────────────────────────────────────
  await PayslipConstants.deleteMany({});
  await PayslipConstants.create({
    minimumMonthlyWage: 6443.85,
    dailyRate: 257.75,
    restDayPremium: 426.35,
    medicalDeductionCeiling: 164.91,
    utilitiesDeductionCeiling: 94.34,
    recoveryPayDayRate: 418.00,
    niiEmployerRate: 0.036,
    pensionSubstituteRate: 0.065,
    severanceSubstituteRate: 0.060,
    pocketMoneyPerWeekend: 100,
    effectiveFrom: '2026-04-01',
  });
  console.log('📋  Seeded PayslipConstants (April 2026 values)');

  // ── cleanup ────────────────────────────────────────────────────────────────
  const existingUsers = await User.find({ clerkId: /^user_mock_/ }).select('_id');
  const mockUserIds = existingUsers.map((u) => u._id);

  if (mockUserIds.length > 0) {
    const existingEmps = await Employee.find({ userId: { $in: mockUserIds } }).select('_id');
    const mockEmpIds = existingEmps.map((e) => e._id);
    await Promise.all([
      Form.deleteMany({ userId: { $in: mockUserIds } }),
      WorkLog.deleteMany({ userId: { $in: mockUserIds } }),
      Employee.deleteMany({ userId: { $in: mockUserIds } }),
      User.deleteMany({ _id: { $in: mockUserIds } }),
    ]);
    console.log(`🗑   Cleared ${mockUserIds.length} mock users, ${mockEmpIds.length} mock employees`);
  }

  // ── users ──────────────────────────────────────────────────────────────────

  const [moshe, yael] = await User.insertMany([
    {
      clerkId: 'user_mock_moshe_001',
      email: 'moshe.cohen@cohen-cleaning.co.il',
      fullName: 'משה כהן',
      phone: '052-3456789',
      isAdmin: false,
      hasSubscription: true,
      employerName: { he: 'כהן שירותי ניקיון בע"מ', en: 'Cohen Cleaning Services Ltd' },
      employerTaxId: '514789023',
      employerAddress: 'רחוב הרצל 45',
      employerCity: 'פתח תקווה',
      employerZip: '4921100',
    },
    {
      clerkId: 'user_mock_yael_002',
      email: 'yael.levi@restaurant-levi.co.il',
      fullName: 'יעל לוי',
      phone: '054-7654321',
      isAdmin: false,
      hasSubscription: true,
      employerName: { he: 'מסעדת לוי בע"מ', en: 'Levi Restaurant Ltd' },
      employerTaxId: '523456781',
      employerAddress: 'שדרות בן גוריון 12',
      employerCity: 'תל אביב-יפו',
      employerZip: '6463401',
    },
  ]);
  console.log(`👤  Created users: ${moshe.fullName}, ${yael.fullName}`);

  // ── employees ──────────────────────────────────────────────────────────────

  const [somchai, malee, maria, araya, jennifer] = await Employee.insertMany([
    {
      userId: moshe._id,
      fullName: { he: "סומחאי ג'אידי", en: 'Somchai Jaidee', th: 'สมชาย ใจดี' },
      passportNumber: 'TH8812345',
      nationality: 'Thai',
      email: 'somchai.jaidee@gmail.com',
      phone: '050-1112233',
      startDate: '2024-03-01',
      preferredLanguage: 'th',
      weeklyRestDay: 'saturday',
      hasPocketMoney: false,
      medicalInsuranceMonthlyCost: 280,
      accommodationDeduction: 0,
      utilitiesDeduction: 94.34,
      hasFoodDeduction: false,
    },
    {
      userId: moshe._id,
      fullName: { he: 'מאלי תונגדי', en: 'Malee Thongdee', th: 'มาลี ทองดี' },
      passportNumber: 'TH7754321',
      nationality: 'Thai',
      email: 'malee.thongdee@gmail.com',
      phone: '050-4445566',
      startDate: '2023-07-15',
      preferredLanguage: 'th',
      weeklyRestDay: 'saturday',
      hasPocketMoney: false,
      medicalInsuranceMonthlyCost: 280,
      accommodationDeduction: 0,
      utilitiesDeduction: 94.34,
      hasFoodDeduction: false,
    },
    {
      userId: moshe._id,
      fullName: { he: 'מריה סנטוס', en: 'Maria Santos', fil: 'Maria Santos' },
      passportNumber: 'PH2234567',
      nationality: 'Filipino',
      email: 'maria.santos@gmail.com',
      phone: '050-7778899',
      startDate: '2024-01-10',
      preferredLanguage: 'fil',
      weeklyRestDay: 'saturday',
      hasPocketMoney: true,
      medicalInsuranceMonthlyCost: 280,
      accommodationDeduction: 0,
      utilitiesDeduction: 94.34,
      hasFoodDeduction: false,
    },
    {
      userId: yael._id,
      fullName: { he: 'אראיה קאוסאי', en: 'Araya Kaewsai', th: 'อาระยา แก้วสาย' },
      passportNumber: 'TH9901234',
      nationality: 'Thai',
      email: 'araya.kaewsai@gmail.com',
      phone: '052-1234567',
      startDate: '2023-11-01',
      preferredLanguage: 'th',
      weeklyRestDay: 'friday',
      hasPocketMoney: false,
      medicalInsuranceMonthlyCost: 280,
      accommodationDeduction: 0,
      utilitiesDeduction: 94.34,
      hasFoodDeduction: false,
    },
    {
      userId: yael._id,
      fullName: { he: "ג'ניפר ריס", en: 'Jennifer Reyes', fil: 'Jennifer Reyes' },
      passportNumber: 'PH3345678',
      nationality: 'Filipino',
      email: 'jennifer.reyes@gmail.com',
      phone: '052-9876543',
      startDate: '2024-06-01',
      preferredLanguage: 'fil',
      weeklyRestDay: 'saturday',
      hasPocketMoney: true,
      medicalInsuranceMonthlyCost: 280,
      accommodationDeduction: 0,
      utilitiesDeduction: 94.34,
      hasFoodDeduction: false,
    },
  ]);
  console.log(`👷  Created 5 employees (3 for Moshe, 2 for Yael)`);

  // ── worklogs ───────────────────────────────────────────────────────────────

  const allWorklogDocs: object[] = [];

  // Somchai — Feb: 1 sick; Mar: 1 rest_day (worked Saturday); Apr: normal
  allWorklogDocs.push(
    ...buildWorklogEntries({ employeeId: somchai._id, userId: moshe._id, year: 2026, month: 2, sickDays: 1 }),
    ...buildWorklogEntries({ employeeId: somchai._id, userId: moshe._id, year: 2026, month: 3, restDays: 1 }),
    ...buildWorklogEntries({ employeeId: somchai._id, userId: moshe._id, year: 2026, month: 4 })
      .filter((e: any) => e.date <= '2026-04-18'),
  );

  // Malee — Feb: 2 vacation; Mar: 1 sick; Apr: normal
  allWorklogDocs.push(
    ...buildWorklogEntries({ employeeId: malee._id, userId: moshe._id, year: 2026, month: 2, vacationDays: 2 }),
    ...buildWorklogEntries({ employeeId: malee._id, userId: moshe._id, year: 2026, month: 3, sickDays: 1 }),
    ...buildWorklogEntries({ employeeId: malee._id, userId: moshe._id, year: 2026, month: 4 })
      .filter((e: any) => e.date <= '2026-04-18'),
  );

  // Maria — Feb: normal; Mar: 1 vacation; Apr: normal
  allWorklogDocs.push(
    ...buildWorklogEntries({ employeeId: maria._id, userId: moshe._id, year: 2026, month: 2 }),
    ...buildWorklogEntries({ employeeId: maria._id, userId: moshe._id, year: 2026, month: 3, vacationDays: 1 }),
    ...buildWorklogEntries({ employeeId: maria._id, userId: moshe._id, year: 2026, month: 4 })
      .filter((e: any) => e.date <= '2026-04-18'),
  );

  // Araya — Feb: 1 sick; Mar: 1 rest_day; Apr: holiday on Apr 2
  allWorklogDocs.push(
    ...buildWorklogEntries({ employeeId: araya._id, userId: yael._id, year: 2026, month: 2, sickDays: 1 }),
    ...buildWorklogEntries({ employeeId: araya._id, userId: yael._id, year: 2026, month: 3, restDays: 1 }),
    ...buildWorklogEntries({ employeeId: araya._id, userId: yael._id, year: 2026, month: 4, holidays: ['2026-04-02'] })
      .filter((e: any) => e.date <= '2026-04-18'),
  );

  // Jennifer — Feb: 2 vacation; Mar: normal; Apr: holiday on Apr 2
  allWorklogDocs.push(
    ...buildWorklogEntries({ employeeId: jennifer._id, userId: yael._id, year: 2026, month: 2, vacationDays: 2 }),
    ...buildWorklogEntries({ employeeId: jennifer._id, userId: yael._id, year: 2026, month: 3 }),
    ...buildWorklogEntries({ employeeId: jennifer._id, userId: yael._id, year: 2026, month: 4, holidays: ['2026-04-02'] })
      .filter((e: any) => e.date <= '2026-04-18'),
  );

  await WorkLog.insertMany(allWorklogDocs);
  console.log(`📅  Created ${allWorklogDocs.length} worklog entries`);

  // ── payslips ───────────────────────────────────────────────────────────────

  const cohenEmployerInfo = (fullName: object, passportNumber: string, nationality: string, startDate: string, seniorityMonths: number) => ({
    fullName,
    passportNumber,
    nationality,
    employerName: { he: 'כהן שירותי ניקיון בע"מ', en: 'Cohen Cleaning Services Ltd' },
    employerTaxId: '514789023',
    employerAddress: 'רחוב הרצל 45',
    employerCity: 'פתח תקווה',
    employerZip: '4921100',
    employmentStartDate: startDate,
    seniorityMonths,
  });

  const leviEmployerInfo = (fullName: object, passportNumber: string, nationality: string, startDate: string, seniorityMonths: number) => ({
    fullName,
    passportNumber,
    nationality,
    employerName: { he: 'מסעדת לוי בע"מ', en: 'Levi Restaurant Ltd' },
    employerTaxId: '523456781',
    employerAddress: 'שדרות בן גוריון 12',
    employerCity: 'תל אביב-יפו',
    employerZip: '6463401',
    employmentStartDate: startDate,
    seniorityMonths,
  });

  const paymentPoalim = { paymentMethod: 'bank', bankName: 'בנק הפועלים', accountNumber: '123456', branchNumber: '012' };
  const paymentLeumi = { paymentMethod: 'bank', bankName: 'בנק לאומי', accountNumber: '654321', branchNumber: '020' };
  const paymentDiscount = { paymentMethod: 'bank', bankName: 'בנק דיסקונט', accountNumber: '789012', branchNumber: '039' };

  const payslipDocs: object[] = [];

  // Somchai: startDate 2024-03-01 → Feb 2026 = 23 months, Mar 2026 = 24 months
  payslipDocs.push(
    buildPayslip({
      userId: moshe._id, clerkId: 'user_mock_moshe_001', employeeId: somchai._id,
      producedByName: 'משה כהן', month: 2, year: 2026,
      workedDays: 19, restDaysWorked: 0, sickDays: 1, vacationDays: 0, holidayDays: 0,
      seniorityMonths: 23,
      employeeInfo: cohenEmployerInfo(
        { he: "סומחאי ג'אידי", en: 'Somchai Jaidee', th: 'สมชาย ใจดี' },
        'TH8812345', 'Thai', '2024-03-01', 23
      ),
      paymentInfo: paymentPoalim,
      vacationPrevBalance: 0, sickPrevBalance: 0,
    }),
  );
  payslipDocs.push(
    buildPayslip({
      userId: moshe._id, clerkId: 'user_mock_moshe_001', employeeId: somchai._id,
      producedByName: 'משה כהן', month: 3, year: 2026,
      workedDays: 22, restDaysWorked: 1, sickDays: 0, vacationDays: 0, holidayDays: 0,
      seniorityMonths: 24,
      employeeInfo: cohenEmployerInfo(
        { he: "סומחאי ג'אידי", en: 'Somchai Jaidee', th: 'สมชาย ใจดี' },
        'TH8812345', 'Thai', '2024-03-01', 24
      ),
      paymentInfo: paymentPoalim,
      vacationPrevBalance: r(14 / 12 - 0), sickPrevBalance: r(1.5 - 1),
      cumulativePensionBalance: r(6443.85 * 0.065),
      cumulativeSeveranceBalance: r(6443.85 * 0.060),
    }),
  );

  // Malee: startDate 2023-07-15 → Feb 2026 = 31 months, Mar 2026 = 32 months
  payslipDocs.push(
    buildPayslip({
      userId: moshe._id, clerkId: 'user_mock_moshe_001', employeeId: malee._id,
      producedByName: 'משה כהן', month: 2, year: 2026,
      workedDays: 18, restDaysWorked: 0, sickDays: 0, vacationDays: 2, holidayDays: 0,
      seniorityMonths: 31,
      employeeInfo: cohenEmployerInfo(
        { he: 'מאלי תונגדי', en: 'Malee Thongdee', th: 'มาลี ทองดี' },
        'TH7754321', 'Thai', '2023-07-15', 31
      ),
      paymentInfo: paymentPoalim,
      vacationPrevBalance: 4.5, sickPrevBalance: 2,
    }),
  );
  payslipDocs.push(
    buildPayslip({
      userId: moshe._id, clerkId: 'user_mock_moshe_001', employeeId: malee._id,
      producedByName: 'משה כהן', month: 3, year: 2026,
      workedDays: 21, restDaysWorked: 0, sickDays: 1, vacationDays: 0, holidayDays: 0,
      seniorityMonths: 32,
      employeeInfo: cohenEmployerInfo(
        { he: 'מאלי תונגדי', en: 'Malee Thongdee', th: 'มาลี ทองดี' },
        'TH7754321', 'Thai', '2023-07-15', 32
      ),
      paymentInfo: paymentPoalim,
      vacationPrevBalance: 4, sickPrevBalance: 2,
    }),
  );

  // Maria: startDate 2024-01-10 → Feb 2026 = 25 months, Mar 2026 = 26 months
  payslipDocs.push(
    buildPayslip({
      userId: moshe._id, clerkId: 'user_mock_moshe_001', employeeId: maria._id,
      producedByName: 'משה כהן', month: 2, year: 2026,
      workedDays: 20, restDaysWorked: 0, sickDays: 0, vacationDays: 0, holidayDays: 0,
      seniorityMonths: 25,
      employeeInfo: cohenEmployerInfo(
        { he: 'מריה סנטוס', en: 'Maria Santos', fil: 'Maria Santos' },
        'PH2234567', 'Filipino', '2024-01-10', 25
      ),
      paymentInfo: paymentLeumi,
      vacationPrevBalance: 1.5, sickPrevBalance: 1,
    }),
  );
  payslipDocs.push(
    buildPayslip({
      userId: moshe._id, clerkId: 'user_mock_moshe_001', employeeId: maria._id,
      producedByName: 'משה כהן', month: 3, year: 2026,
      workedDays: 21, restDaysWorked: 0, sickDays: 0, vacationDays: 1, holidayDays: 0,
      seniorityMonths: 26,
      employeeInfo: cohenEmployerInfo(
        { he: 'מריה סנטוס', en: 'Maria Santos', fil: 'Maria Santos' },
        'PH2234567', 'Filipino', '2024-01-10', 26
      ),
      paymentInfo: paymentLeumi,
      vacationPrevBalance: 3, sickPrevBalance: 2,
    }),
  );

  // Araya: startDate 2023-11-01 → Feb 2026 = 27 months, Mar 2026 = 28 months
  payslipDocs.push(
    buildPayslip({
      userId: yael._id, clerkId: 'user_mock_yael_002', employeeId: araya._id,
      producedByName: 'יעל לוי', month: 2, year: 2026,
      workedDays: 19, restDaysWorked: 0, sickDays: 1, vacationDays: 0, holidayDays: 0,
      seniorityMonths: 27,
      employeeInfo: leviEmployerInfo(
        { he: 'אראיה קאוסאי', en: 'Araya Kaewsai', th: 'อาระยา แก้วสาย' },
        'TH9901234', 'Thai', '2023-11-01', 27
      ),
      paymentInfo: paymentDiscount,
      vacationPrevBalance: 3.5, sickPrevBalance: 1.5,
    }),
  );
  payslipDocs.push(
    buildPayslip({
      userId: yael._id, clerkId: 'user_mock_yael_002', employeeId: araya._id,
      producedByName: 'יעל לוי', month: 3, year: 2026,
      workedDays: 22, restDaysWorked: 1, sickDays: 0, vacationDays: 0, holidayDays: 0,
      seniorityMonths: 28,
      employeeInfo: leviEmployerInfo(
        { he: 'אראיה קאוסאי', en: 'Araya Kaewsai', th: 'อาระยา แก้วสาย' },
        'TH9901234', 'Thai', '2023-11-01', 28
      ),
      paymentInfo: paymentDiscount,
      vacationPrevBalance: 5, sickPrevBalance: 2,
    }),
  );

  // Jennifer: startDate 2024-06-01 → Feb 2026 = 20 months, Mar 2026 = 21 months
  payslipDocs.push(
    buildPayslip({
      userId: yael._id, clerkId: 'user_mock_yael_002', employeeId: jennifer._id,
      producedByName: 'יעל לוי', month: 2, year: 2026,
      workedDays: 18, restDaysWorked: 0, sickDays: 0, vacationDays: 2, holidayDays: 0,
      seniorityMonths: 20,
      employeeInfo: leviEmployerInfo(
        { he: "ג'ניפר ריס", en: 'Jennifer Reyes', fil: 'Jennifer Reyes' },
        'PH3345678', 'Filipino', '2024-06-01', 20
      ),
      paymentInfo: paymentLeumi,
      vacationPrevBalance: 2, sickPrevBalance: 1,
    }),
  );
  payslipDocs.push(
    buildPayslip({
      userId: yael._id, clerkId: 'user_mock_yael_002', employeeId: jennifer._id,
      producedByName: 'יעל לוי', month: 3, year: 2026,
      workedDays: 22, restDaysWorked: 0, sickDays: 0, vacationDays: 0, holidayDays: 0,
      seniorityMonths: 21,
      employeeInfo: leviEmployerInfo(
        { he: "ג'ניפר ריס", en: 'Jennifer Reyes', fil: 'Jennifer Reyes' },
        'PH3345678', 'Filipino', '2024-06-01', 21
      ),
      paymentInfo: paymentLeumi,
      vacationPrevBalance: 1.5, sickPrevBalance: 2,
    }),
  );

  await Form.insertMany(payslipDocs);
  console.log(`📄  Created ${payslipDocs.length} payslips (2 months × 5 employees)`);

  await mongoose.disconnect();
  console.log('\n🎉  Seed complete!');
  console.log('   Users:     משה כהן (moshe.cohen@cohen-cleaning.co.il)');
  console.log('              יעל לוי  (yael.levi@restaurant-levi.co.il)');
  console.log('   clerkIds:  user_mock_moshe_001  /  user_mock_yael_002');
}

seed().catch((err) => {
  console.error('❌  Seed failed:', err);
  mongoose.disconnect();
  process.exit(1);
});
