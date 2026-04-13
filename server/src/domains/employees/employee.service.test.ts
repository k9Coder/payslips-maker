import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock the Employee model before importing the service
vi.mock('./employee.model', () => ({
  Employee: {
    countDocuments: vi.fn(),
    create: vi.fn(),
    find: vi.fn(),
    findOne: vi.fn(),
    findOneAndUpdate: vi.fn(),
    deleteOne: vi.fn(),
  },
}));

import { EmployeeService } from './employee.service';
import { Employee } from './employee.model';

const mockEmployee = Employee as unknown as Record<string, ReturnType<typeof vi.fn>>;

const COMPANY_ID = '507f1f77bcf86cd799439011';
const EMPLOYEE_ID = '507f1f77bcf86cd799439022';
const COMPANY_IDS = [COMPANY_ID];

const DTO = {
  fullName: { en: 'Ana Ramirez' },
  passportNumber: 'AA1234567',
  nationality: 'Philippines',
  startDate: '2023-01-15',
  preferredLanguage: 'fil' as const,
};

const FAKE_DOC = {
  _id: { toString: () => EMPLOYEE_ID },
  ...DTO,
  toObject: () => ({ _id: EMPLOYEE_ID, ...DTO }),
};

beforeEach(() => vi.clearAllMocks());

// ─── createEmployee — subscription limit ──────────────────────────────────────

describe('EmployeeService.createEmployee — subscription limit', () => {
  it('subscribed user can create employee regardless of existing count', async () => {
    mockEmployee.countDocuments.mockResolvedValue(5);
    mockEmployee.create.mockResolvedValue(FAKE_DOC);

    await expect(EmployeeService.createEmployee(COMPANY_ID, COMPANY_IDS, DTO, true)).resolves.toBeDefined();
    expect(mockEmployee.countDocuments).not.toHaveBeenCalled();
  });

  it('non-subscribed user with 0 employees can create first', async () => {
    mockEmployee.countDocuments.mockResolvedValue(0);
    mockEmployee.create.mockResolvedValue(FAKE_DOC);

    await expect(EmployeeService.createEmployee(COMPANY_ID, COMPANY_IDS, DTO, false)).resolves.toBeDefined();
  });

  it('non-subscribed user with 1 employee throws EMPLOYEE_LIMIT_REACHED', async () => {
    mockEmployee.countDocuments.mockResolvedValue(1);

    await expect(EmployeeService.createEmployee(COMPANY_ID, COMPANY_IDS, DTO, false))
      .rejects.toThrow('EMPLOYEE_LIMIT_REACHED');
    expect(mockEmployee.create).not.toHaveBeenCalled();
  });

  it('returns IEmployee with string _id', async () => {
    mockEmployee.countDocuments.mockResolvedValue(0);
    mockEmployee.create.mockResolvedValue(FAKE_DOC);

    const result = await EmployeeService.createEmployee(COMPANY_ID, COMPANY_IDS, DTO, false);
    expect(typeof result._id).toBe('string');
    expect(result._id).toBe(EMPLOYEE_ID);
  });
});

// ─── deleteEmployee — ownership ───────────────────────────────────────────────

describe('EmployeeService.deleteEmployee', () => {
  it('returns true when employee is found and deleted', async () => {
    mockEmployee.deleteOne.mockResolvedValue({ deletedCount: 1 });
    await expect(EmployeeService.deleteEmployee(EMPLOYEE_ID, COMPANY_IDS)).resolves.toBe(true);
  });

  it('returns false when employee not found (wrong owner)', async () => {
    mockEmployee.deleteOne.mockResolvedValue({ deletedCount: 0 });
    await expect(EmployeeService.deleteEmployee(EMPLOYEE_ID, COMPANY_IDS)).resolves.toBe(false);
  });
});

// ─── getEmployeeById — ownership ─────────────────────────────────────────────

describe('EmployeeService.getEmployeeById', () => {
  it('returns null when employee not found', async () => {
    mockEmployee.findOne.mockReturnValue({ lean: () => Promise.resolve(null) });
    await expect(EmployeeService.getEmployeeById(EMPLOYEE_ID, COMPANY_IDS)).resolves.toBeNull();
  });

  it('returns employee with string _id when found', async () => {
    const doc = { _id: { toString: () => EMPLOYEE_ID }, companyId: { toString: () => COMPANY_ID }, ...DTO };
    mockEmployee.findOne.mockReturnValue({ lean: () => Promise.resolve(doc) });

    const result = await EmployeeService.getEmployeeById(EMPLOYEE_ID, COMPANY_IDS);
    expect(result).not.toBeNull();
    expect(typeof result!._id).toBe('string');
  });
});
