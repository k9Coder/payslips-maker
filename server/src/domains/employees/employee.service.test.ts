import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock the Employee model before importing the service
vi.mock('./employee.model', () => ({
  Employee: {
    countDocuments: vi.fn(),
    find: vi.fn(),
    findOne: vi.fn(),
    findOneAndUpdate: vi.fn(),
    findOneAndDelete: vi.fn(),
    prototype: { save: vi.fn() },
  },
}));

import {
  getEmployeesByUser,
  getEmployeeById,
  createEmployee,
  updateEmployee,
  deleteEmployee,
  countEmployeesByUser,
} from './employee.service';
import { Employee } from './employee.model';

const mockEmployee = Employee as unknown as Record<string, ReturnType<typeof vi.fn>>;

const USER_ID = '507f1f77bcf86cd799439011';
const EMPLOYEE_ID = '507f1f77bcf86cd799439022';

const DTO = {
  fullName: { en: 'Ana Ramirez' },
  passportNumber: 'AA1234567',
  nationality: 'Philippines',
  startDate: '2023-01-15',
  preferredLanguage: 'fil',
};

beforeEach(() => vi.clearAllMocks());

// ─── getEmployeesByUser ───────────────────────────────────────────────────────

describe('getEmployeesByUser', () => {
  it('returns employees for the given userId', async () => {
    const fakeEmployees = [{ _id: EMPLOYEE_ID, userId: USER_ID, ...DTO }];
    mockEmployee.find.mockReturnValue({ lean: () => Promise.resolve(fakeEmployees) });

    const result = await getEmployeesByUser(USER_ID);
    expect(result).toEqual(fakeEmployees);
    expect(mockEmployee.find).toHaveBeenCalledOnce();
  });
});

// ─── getEmployeeById ──────────────────────────────────────────────────────────

describe('getEmployeeById', () => {
  it('returns null when employee not found', async () => {
    mockEmployee.findOne.mockReturnValue({ lean: () => Promise.resolve(null) });
    await expect(getEmployeeById(EMPLOYEE_ID, USER_ID)).resolves.toBeNull();
  });

  it('returns employee when found with correct userId', async () => {
    const doc = { _id: EMPLOYEE_ID, userId: USER_ID, ...DTO };
    mockEmployee.findOne.mockReturnValue({ lean: () => Promise.resolve(doc) });

    const result = await getEmployeeById(EMPLOYEE_ID, USER_ID);
    expect(result).not.toBeNull();
    expect(result).toEqual(doc);
  });
});

// ─── countEmployeesByUser ─────────────────────────────────────────────────────

describe('countEmployeesByUser', () => {
  it('returns document count for the given userId', async () => {
    mockEmployee.countDocuments.mockResolvedValue(3);
    const count = await countEmployeesByUser(USER_ID);
    expect(count).toBe(3);
    expect(mockEmployee.countDocuments).toHaveBeenCalledOnce();
  });
});
