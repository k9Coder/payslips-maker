import { describe, it, expect } from 'vitest';
import { calculatePayFromWorkDetails } from './usePayslipCalculations';

describe('calculatePayFromWorkDetails', () => {
  it('computes base salary from worked days × daily rate', () => {
    const result = calculatePayFromWorkDetails({ workedDays: 22 }, 300);
    expect(result.baseSalary).toBe(6600);
    expect(result.overtimePay).toBe(0);
    expect(result.grossSalary).toBe(6600);
  });

  it('returns all zeros when daily rate is 0', () => {
    const result = calculatePayFromWorkDetails({ workedDays: 22 }, 0);
    expect(result.baseSalary).toBe(0);
    expect(result.overtimePay).toBe(0);
    expect(result.grossSalary).toBe(0);
  });

  it('returns all zeros when no worked days', () => {
    const result = calculatePayFromWorkDetails({ workedDays: 0 }, 300);
    expect(result.baseSalary).toBe(0);
    expect(result.overtimePay).toBe(0);
    expect(result.grossSalary).toBe(0);
  });

  it('calculates overtime at 100% (same as regular hourly)', () => {
    // hourlyRate = 240 / 8 = 30; 4h × 30 × 1.0 = 120
    const result = calculatePayFromWorkDetails({ workedDays: 0, overtime100h: 4 }, 240);
    expect(result.overtimePay).toBe(120);
  });

  it('calculates overtime at 125%', () => {
    // hourlyRate = 240 / 8 = 30; 4h × 30 × 1.25 = 150
    const result = calculatePayFromWorkDetails({ workedDays: 0, overtime125h: 4 }, 240);
    expect(result.overtimePay).toBe(150);
  });

  it('calculates overtime at 150%', () => {
    // hourlyRate = 240 / 8 = 30; 4h × 30 × 1.5 = 180
    const result = calculatePayFromWorkDetails({ workedDays: 0, overtime150h: 4 }, 240);
    expect(result.overtimePay).toBe(180);
  });

  it('sums all three overtime types', () => {
    // hourlyRate = 160 / 8 = 20
    // 100%: 2 × 20 × 1.0 = 40
    // 125%: 2 × 20 × 1.25 = 50
    // 150%: 2 × 20 × 1.5 = 60
    // total = 150
    const result = calculatePayFromWorkDetails(
      { workedDays: 0, overtime100h: 2, overtime125h: 2, overtime150h: 2 },
      160
    );
    expect(result.overtimePay).toBe(150);
  });

  it('includes overtime in gross salary', () => {
    // baseSalary = 22 × 300 = 6600; overtime = 4 × (300/8) × 1.25 = 187.5; gross = 6787.5
    const result = calculatePayFromWorkDetails({ workedDays: 22, overtime125h: 4 }, 300);
    expect(result.baseSalary).toBe(6600);
    expect(result.overtimePay).toBe(187.5);
    expect(result.grossSalary).toBe(6787.5);
  });

  it('rounds results to 2 decimal places', () => {
    // hourlyRate = 100 / 8 = 12.5; 3h × 12.5 × 1.25 = 46.875 → 46.88
    const result = calculatePayFromWorkDetails({ workedDays: 0, overtime125h: 3 }, 100);
    expect(result.overtimePay).toBe(46.88);
  });

  it('treats missing workDetails fields as zero', () => {
    const result = calculatePayFromWorkDetails({}, 300);
    expect(result.baseSalary).toBe(0);
    expect(result.overtimePay).toBe(0);
  });
});
