import { describe, it, expect, vi } from 'vitest';

// Mock @react-pdf/renderer so pdf-fonts.ts can be imported in a node environment
vi.mock('@react-pdf/renderer', () => ({
  Font: { register: vi.fn() },
}));

import { getPDFTranslations, getFontForLanguage, isRTL } from './index';
import type { SupportedLanguage } from '@payslips-maker/shared';

const ALL_LANGUAGES: SupportedLanguage[] = ['he', 'en', 'fil', 'th', 'am', 'hi', 'ar'];

// ─── getPDFTranslations ───────────────────────────────────────────────────────

describe('getPDFTranslations', () => {
  it.each(ALL_LANGUAGES)('returns a non-empty translation object for "%s"', (lang) => {
    const t = getPDFTranslations(lang);
    expect(t).toBeDefined();
    expect(t.payslip).toBeDefined();
    expect(t.finalSettlement).toBeDefined();
  });

  it.each(ALL_LANGUAGES)('payslip.title is a non-empty string for "%s"', (lang) => {
    const { payslip } = getPDFTranslations(lang);
    expect(typeof payslip.title).toBe('string');
    expect(payslip.title.length).toBeGreaterThan(0);
  });

  it.each(ALL_LANGUAGES)('payslip.months has all 12 entries for "%s"', (lang) => {
    const { payslip } = getPDFTranslations(lang);
    for (let m = 1; m <= 12; m++) {
      expect(typeof payslip.months[m]).toBe('string');
      expect(payslip.months[m].length).toBeGreaterThan(0);
    }
  });

  it.each(ALL_LANGUAGES)('finalSettlement.title is a non-empty string for "%s"', (lang) => {
    const { finalSettlement } = getPDFTranslations(lang);
    expect(typeof finalSettlement.title).toBe('string');
    expect(finalSettlement.title.length).toBeGreaterThan(0);
  });

  it('Hebrew payslip title is "מחליף תלוש שכר"', () => {
    expect(getPDFTranslations('he').payslip.title).toBe('מחליף תלוש שכר');
  });

  it('English payslip title is "Payslip"', () => {
    expect(getPDFTranslations('en').payslip.title).toBe('Payslip');
  });
});

// ─── isRTL ────────────────────────────────────────────────────────────────────

describe('isRTL', () => {
  it('Hebrew is RTL', () => expect(isRTL('he')).toBe(true));
  it('Arabic is RTL', () => expect(isRTL('ar')).toBe(true));
  it('English is LTR', () => expect(isRTL('en')).toBe(false));
  it('Filipino is LTR', () => expect(isRTL('fil')).toBe(false));
  it('Thai is LTR', () => expect(isRTL('th')).toBe(false));
  it('Amharic is LTR', () => expect(isRTL('am')).toBe(false));
  it('Hindi is LTR', () => expect(isRTL('hi')).toBe(false));
});

// ─── getFontForLanguage ───────────────────────────────────────────────────────

describe('getFontForLanguage', () => {
  it('Thai uses NotoThai', () => expect(getFontForLanguage('th')).toBe('NotoThai'));
  it('Amharic uses NotoEthiopic', () => expect(getFontForLanguage('am')).toBe('NotoEthiopic'));
  it('Hindi uses NotoDevanagari', () => expect(getFontForLanguage('hi')).toBe('NotoDevanagari'));
  it('Hebrew uses Heebo', () => expect(getFontForLanguage('he')).toBe('Heebo'));
  it('English uses Heebo', () => expect(getFontForLanguage('en')).toBe('Heebo'));
  it('Filipino uses Heebo', () => expect(getFontForLanguage('fil')).toBe('Heebo'));
  it('Arabic uses Heebo', () => expect(getFontForLanguage('ar')).toBe('Heebo'));
});
