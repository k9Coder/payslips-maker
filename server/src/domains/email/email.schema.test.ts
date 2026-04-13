import { describe, it, expect } from 'vitest';
import { sendEmailSchema } from './email.schema';

const VALID = {
  pdfBase64: 'dGVzdA==',
};

describe('sendEmailSchema', () => {
  it('accepts a minimal valid payload (pdfBase64 only)', () => {
    expect(sendEmailSchema.safeParse(VALID).success).toBe(true);
  });

  it('defaults language to "he" when omitted', () => {
    const result = sendEmailSchema.safeParse(VALID);
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.language).toBe('he');
  });

  it('accepts all 7 supported language codes', () => {
    const langs = ['he', 'en', 'fil', 'th', 'am', 'hi', 'ar'];
    langs.forEach((language) => {
      expect(sendEmailSchema.safeParse({ ...VALID, language }).success).toBe(true);
    });
  });

  it('rejects a language not in the enum', () => {
    expect(sendEmailSchema.safeParse({ ...VALID, language: 'fr' }).success).toBe(false);
  });

  it('rejects an empty pdfBase64', () => {
    expect(sendEmailSchema.safeParse({ ...VALID, pdfBase64: '' }).success).toBe(false);
  });

  it('rejects a missing pdfBase64', () => {
    expect(sendEmailSchema.safeParse({}).success).toBe(false);
  });

  it('accepts a valid toEmail override', () => {
    expect(sendEmailSchema.safeParse({ ...VALID, toEmail: 'ana@example.com' }).success).toBe(true);
  });

  it('rejects an invalid toEmail format', () => {
    expect(sendEmailSchema.safeParse({ ...VALID, toEmail: 'not-an-email' }).success).toBe(false);
  });

  it('accepts a missing toEmail (optional)', () => {
    expect(sendEmailSchema.safeParse(VALID).success).toBe(true);
  });
});
