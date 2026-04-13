import { Font } from '@react-pdf/renderer';
import type { SupportedLanguage } from '@payslips-maker/shared';

let fontsRegistered = false;

export function registerPDFFonts(): void {
  if (fontsRegistered) return;
  fontsRegistered = true;

  const base = import.meta.env.BASE_URL.replace(/\/$/, '');

  // Heebo — covers Hebrew, Latin, Arabic
  Font.register({
    family: 'Heebo',
    fonts: [
      { src: `${base}/fonts/Heebo-Regular.ttf`, fontWeight: 400 },
      { src: `${base}/fonts/Heebo-Medium.ttf`, fontWeight: 500 },
      { src: `${base}/fonts/Heebo-Bold.ttf`, fontWeight: 700 },
    ],
  });

  // Noto fonts for non-Latin scripts
  Font.register({ family: 'NotoThai', src: `${base}/fonts/NotoSansThai-Regular.ttf` });
  Font.register({ family: 'NotoEthiopic', src: `${base}/fonts/NotoSansEthiopic-Regular.ttf` });
  Font.register({ family: 'NotoDevanagari', src: `${base}/fonts/NotoSansDevanagari-Regular.ttf` });
}

export function getFontForLanguage(lang: SupportedLanguage): string {
  switch (lang) {
    case 'th': return 'NotoThai';
    case 'am': return 'NotoEthiopic';
    case 'hi': return 'NotoDevanagari';
    default: return 'Heebo'; // he, en, fil, ar
  }
}

export function isRTL(lang: SupportedLanguage): boolean {
  return lang === 'he' || lang === 'ar';
}
