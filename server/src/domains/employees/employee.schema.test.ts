import { describe, it, expect } from 'vitest';
import { createEmployeeSchema, updateEmployeeSchema } from './employee.schema';

const VALID = {
  fullName: 'Ana Ramirez',
  passportNumber: 'AA1234567',
  nationality: 'Philippines',
  startDate: '2023-01-15',
  preferredLanguage: 'fil' as const,
};

// ─── createEmployeeSchema ─────────────────────────────────────────────────────

describe('createEmployeeSchema', () => {
  it('accepts a fully valid payload', () => {
    expect(createEmployeeSchema.safeParse(VALID).success).toBe(true);
  });

  // fullName
  it('rejects fullName shorter than 2 chars', () => {
    expect(createEmployeeSchema.safeParse({ ...VALID, fullName: 'A' }).success).toBe(false);
  });

  it('accepts fullName of exactly 2 chars', () => {
    expect(createEmployeeSchema.safeParse({ ...VALID, fullName: 'Li' }).success).toBe(true);
  });

  // passportNumber
  it('rejects passportNumber shorter than 5 chars', () => {
    expect(createEmployeeSchema.safeParse({ ...VALID, passportNumber: 'AB12' }).success).toBe(false);
  });

  it('accepts passportNumber of exactly 5 chars', () => {
    expect(createEmployeeSchema.safeParse({ ...VALID, passportNumber: 'AB123' }).success).toBe(true);
  });

  // nationality
  it('rejects nationality shorter than 2 chars', () => {
    expect(createEmployeeSchema.safeParse({ ...VALID, nationality: 'X' }).success).toBe(false);
  });

  // startDate
  it('rejects startDate not matching YYYY-MM-DD', () => {
    const bad = ['15/01/2023', '2023-1-5', '20230115', 'not-a-date'];
    bad.forEach((startDate) => {
      expect(createEmployeeSchema.safeParse({ ...VALID, startDate }).success).toBe(false);
    });
  });

  it('accepts startDate in YYYY-MM-DD format', () => {
    expect(createEmployeeSchema.safeParse({ ...VALID, startDate: '2023-01-15' }).success).toBe(true);
  });

  // email
  it('rejects an invalid email format', () => {
    expect(createEmployeeSchema.safeParse({ ...VALID, email: 'not-an-email' }).success).toBe(false);
  });

  it('accepts a valid email', () => {
    expect(createEmployeeSchema.safeParse({ ...VALID, email: 'ana@example.com' }).success).toBe(true);
  });

  it('accepts an empty string for email', () => {
    expect(createEmployeeSchema.safeParse({ ...VALID, email: '' }).success).toBe(true);
  });

  it('accepts a missing email (optional)', () => {
    const { email: _email, ...noEmail } = { ...VALID, email: undefined };
    expect(createEmployeeSchema.safeParse(noEmail).success).toBe(true);
  });

  // preferredLanguage
  it('defaults preferredLanguage to "he" when omitted', () => {
    const { preferredLanguage: _lang, ...noLang } = VALID;
    const result = createEmployeeSchema.safeParse(noLang);
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.preferredLanguage).toBe('he');
  });

  it('rejects a preferredLanguage not in the enum', () => {
    expect(createEmployeeSchema.safeParse({ ...VALID, preferredLanguage: 'fr' }).success).toBe(false);
  });

  it('accepts all supported language codes', () => {
    const langs = ['he', 'en', 'fil', 'th', 'am', 'hi', 'ar'];
    langs.forEach((preferredLanguage) => {
      expect(createEmployeeSchema.safeParse({ ...VALID, preferredLanguage }).success).toBe(true);
    });
  });

  // phone
  it('accepts a missing phone (optional)', () => {
    expect(createEmployeeSchema.safeParse(VALID).success).toBe(true); // phone absent
  });
});

// ─── updateEmployeeSchema ─────────────────────────────────────────────────────

describe('updateEmployeeSchema', () => {
  it('accepts an empty object (all fields optional)', () => {
    expect(updateEmployeeSchema.safeParse({}).success).toBe(true);
  });

  it('accepts a partial update with only fullName', () => {
    expect(updateEmployeeSchema.safeParse({ fullName: 'New Name' }).success).toBe(true);
  });

  it('still validates fullName min length when provided', () => {
    expect(updateEmployeeSchema.safeParse({ fullName: 'X' }).success).toBe(false);
  });

  it('still validates startDate format when provided', () => {
    expect(updateEmployeeSchema.safeParse({ startDate: '01/01/2023' }).success).toBe(false);
  });
});
