import type { SupportedLanguage } from '@payslips-maker/shared';
import type { PDFTranslations } from './pdf-translation.types';
import { heTranslations } from './he';
import { enTranslations } from './en';
import { filTranslations } from './fil';
import { thTranslations } from './th';
import { amTranslations } from './am';
import { hiTranslations } from './hi';
import { arTranslations } from './ar';

const translationsMap: Record<SupportedLanguage, PDFTranslations> = {
  he: heTranslations,
  en: enTranslations,
  fil: filTranslations,
  th: thTranslations,
  am: amTranslations,
  hi: hiTranslations,
  ar: arTranslations,
};

export function getPDFTranslations(lang: SupportedLanguage): PDFTranslations {
  return translationsMap[lang] ?? translationsMap.he;
}

export type { PDFTranslations, PayslipPDFTranslation, FinalSettlementPDFTranslation } from './pdf-translation.types';
export { registerPDFFonts, getFontForLanguage, isRTL } from './pdf-fonts';
