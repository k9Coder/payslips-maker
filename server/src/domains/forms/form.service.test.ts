import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('./form.model', () => ({
  Form: {
    countDocuments: vi.fn(),
    create: vi.fn(),
    find: vi.fn(),
    findOne: vi.fn(),
    findOneAndUpdate: vi.fn(),
    deleteOne: vi.fn(),
  },
}));

import { FormService } from './form.service';
import { Form } from './form.model';

const mockForm = Form as unknown as Record<string, ReturnType<typeof vi.fn>>;

const USER_ID = '507f1f77bcf86cd799439011';
const CLERK_ID = 'clerk_abc123';
const FORM_ID = '507f1f77bcf86cd799439033';
const EMPLOYEE_ID = '507f1f77bcf86cd799439044';
const PRODUCED_BY_NAME = 'Test Producer';

const BASE_DTO = {
  employeeId: EMPLOYEE_ID,
  formType: 'payslip' as const,
  period: { month: 3, year: 2025 },
  employeeInfo: {
    fullName: { en: 'Ana Ramirez' },
    passportNumber: 'AA1234567',
    nationality: 'Philippines',
    employerName: { en: 'Test Employer' },
    employerTaxId: '123456789',
    employmentStartDate: '2022-01-01',
    seniorityMonths: 38,
  },
  workDetails: { workedDays: 22, totalWorkHours: 0, restDaysWorked: 0, vacationDays: 0, sickDays: 0, holidayDays: 0 },
  payCalculation: { minimumWage: 6443.85, dailyRate: 257.75, baseSalary: 6443.85, restDayPremium: 0, sickPayAdjustment: 0, recoveryPay: 0, pocketMoneyPaid: 0, grossSalary: 6443.85 },
  deductions: { medicalInsuranceDeduction: 0, accommodationDeduction: 0, utilitiesDeduction: 0, foodDeduction: 0, incomeTax: 0, totalPermittedDeductions: 0 },
  employerContributions: { nii: 0, pensionSubstitute: 0, severanceSubstitute: 0, cumulativePensionBalance: 0, cumulativeSeveranceBalance: 0 },
  netSalary: 6443.85,
  bankTransfer: 6443.85,
  paymentInfo: { paymentMethod: 'bank', bankName: '', branchNumber: '', accountNumber: '' },
};

beforeEach(() => vi.clearAllMocks());

// ─── createForm — subscription limit ─────────────────────────────────────────

describe('FormService.createForm — subscription limit', () => {
  it('subscribed user bypasses the 10-form check', async () => {
    const fakeForm = { _id: FORM_ID, toObject: () => ({ ...BASE_DTO, _id: FORM_ID }) };
    mockForm.create.mockResolvedValue(fakeForm);

    await FormService.createForm(CLERK_ID, USER_ID, PRODUCED_BY_NAME, BASE_DTO, true);
    expect(mockForm.countDocuments).not.toHaveBeenCalled();
  });

  it('non-subscribed user with 9 forms can create the 10th', async () => {
    mockForm.countDocuments.mockResolvedValue(9);
    const fakeForm = { _id: FORM_ID, toObject: () => ({ ...BASE_DTO, _id: FORM_ID }) };
    mockForm.create.mockResolvedValue(fakeForm);

    await expect(FormService.createForm(CLERK_ID, USER_ID, PRODUCED_BY_NAME, BASE_DTO, false)).resolves.toBeDefined();
  });

  it('non-subscribed user with 10 forms throws FORM_LIMIT_REACHED', async () => {
    mockForm.countDocuments.mockResolvedValue(10);

    await expect(FormService.createForm(CLERK_ID, USER_ID, PRODUCED_BY_NAME, BASE_DTO, false))
      .rejects.toThrow('FORM_LIMIT_REACHED');
    expect(mockForm.create).not.toHaveBeenCalled();
  });

  it('non-subscribed user with 11 forms throws FORM_LIMIT_REACHED', async () => {
    mockForm.countDocuments.mockResolvedValue(11);

    await expect(FormService.createForm(CLERK_ID, USER_ID, PRODUCED_BY_NAME, BASE_DTO, false))
      .rejects.toThrow('FORM_LIMIT_REACHED');
  });
});

// ─── deleteForm — ownership ───────────────────────────────────────────────────

describe('FormService.deleteForm', () => {
  it('returns true when form deleted successfully', async () => {
    mockForm.deleteOne.mockResolvedValue({ deletedCount: 1 });
    await expect(FormService.deleteForm(FORM_ID, USER_ID)).resolves.toBe(true);
  });

  it('returns false when form not found or belongs to another user', async () => {
    mockForm.deleteOne.mockResolvedValue({ deletedCount: 0 });
    await expect(FormService.deleteForm(FORM_ID, USER_ID)).resolves.toBe(false);
  });
});

// ─── getUserForms — filters ────────────────────────────────────────────────────

describe('FormService.getUserForms', () => {
  const makeDoc = (overrides = {}) => ({
    _id: { toString: () => FORM_ID },
    formType: 'payslip',
    employeeId: { toString: () => EMPLOYEE_ID },
    period: { month: 3, year: 2025 },
    employeeInfo: { fullName: 'Ana Ramirez' },
    payCalculation: { grossSalary: 6600 },
    netSalary: 6600,
    producedByName: PRODUCED_BY_NAME,
    updatedAt: new Date(),
    ...overrides,
  });

  it('queries with userId filter', async () => {
    mockForm.find.mockReturnValue({
      sort: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      lean: vi.fn().mockResolvedValue([makeDoc()]),
    });

    await FormService.getUserForms(USER_ID);

    const findArg = mockForm.find.mock.calls[0][0];
    expect(findArg).toHaveProperty('userId');
  });

  it('adds employeeId filter when provided', async () => {
    mockForm.find.mockReturnValue({
      sort: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      lean: vi.fn().mockResolvedValue([]),
    });

    await FormService.getUserForms(USER_ID, { employeeId: EMPLOYEE_ID });

    const findArg = mockForm.find.mock.calls[0][0];
    expect(findArg).toHaveProperty('employeeId');
  });

  it('adds formType filter when provided', async () => {
    mockForm.find.mockReturnValue({
      sort: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      lean: vi.fn().mockResolvedValue([]),
    });

    await FormService.getUserForms(USER_ID, { formType: 'final_settlement' });

    const findArg = mockForm.find.mock.calls[0][0];
    expect(findArg.formType).toBe('final_settlement');
  });

  it('maps result to FormListItem shape with string _id', async () => {
    mockForm.find.mockReturnValue({
      sort: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      lean: vi.fn().mockResolvedValue([makeDoc()]),
    });

    const result = await FormService.getUserForms(USER_ID);
    expect(result).toHaveLength(1);
    expect(typeof result[0]._id).toBe('string');
    expect(typeof result[0].employeeId).toBe('string');
  });
});
