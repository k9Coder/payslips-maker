import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock the model before importing the service
vi.mock('./worklog.model', () => ({
  WorkLog: {
    find: vi.fn(),
    create: vi.fn(),
    findOneAndUpdate: vi.fn(),
    findOneAndDelete: vi.fn(),
  },
}));

import { getMonthSummary } from './worklog.service';
import { WorkLog } from './worklog.model';

const USER_ID = '507f1f77bcf86cd799439011';
const EMP_ID = '507f1f77bcf86cd799439012';

function mockFind(entries: object[]) {
  (WorkLog.find as ReturnType<typeof vi.fn>).mockReturnValue({
    sort: vi.fn().mockReturnValue({
      lean: vi.fn().mockResolvedValue(entries),
    }),
  });
}

describe('getMonthSummary — multi-entry per day', () => {
  beforeEach(() => vi.clearAllMocks());

  it('counts 1 work day when same date has work + overtime entries', async () => {
    mockFind([
      { date: '2024-01-15', type: 'work', hours: 9 },
      { date: '2024-01-15', type: 'overtime', hours: 3 },
    ]);
    const s = await getMonthSummary(USER_ID, EMP_ID, 2024, 1);
    expect(s.workDays).toBe(1);
    expect(s.totalWorkHours).toBe(9);
    expect(s.overtimeHours).toBe(3);
  });

  it('sums work hours across multiple work entries on different days', async () => {
    mockFind([
      { date: '2024-01-10', type: 'work', hours: 8 },
      { date: '2024-01-11', type: 'work', hours: 6 },
    ]);
    const s = await getMonthSummary(USER_ID, EMP_ID, 2024, 1);
    expect(s.workDays).toBe(2);
    expect(s.totalWorkHours).toBe(14);
  });

  it('counts 1 vacation day when same date has vacation + work entries', async () => {
    mockFind([
      { date: '2024-01-20', type: 'vacation', hours: 4 },
      { date: '2024-01-20', type: 'work', hours: 4 },
    ]);
    const s = await getMonthSummary(USER_ID, EMP_ID, 2024, 1);
    expect(s.vacationDays).toBe(1);
    expect(s.workDays).toBe(1);
    expect(s.totalWorkHours).toBe(4);
  });

  it('handles a month with no entries', async () => {
    mockFind([]);
    const s = await getMonthSummary(USER_ID, EMP_ID, 2024, 1);
    expect(s.workDays).toBe(0);
    expect(s.vacationDays).toBe(0);
    expect(s.sickDays).toBe(0);
    expect(s.holidayDays).toBe(0);
    expect(s.totalWorkHours).toBe(0);
    expect(s.overtimeHours).toBe(0);
    expect(s.entries).toHaveLength(0);
  });

  it('does not double-count a date that has two work entries', async () => {
    mockFind([
      { date: '2024-01-05', type: 'work', hours: 5 },
      { date: '2024-01-05', type: 'work', hours: 3 },
    ]);
    const s = await getMonthSummary(USER_ID, EMP_ID, 2024, 1);
    expect(s.workDays).toBe(1);
    expect(s.totalWorkHours).toBe(8);
  });
});
