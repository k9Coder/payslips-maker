/**
 * Single source of truth for brand identity.
 * Import from here — never hardcode brand strings elsewhere.
 */

export const BRAND_NAME = 'Care+' as const;

export const BRAND_COMPANY = 'Liat Holding' as const;

export const BRAND_WEBSITE = 'liatholding.com' as const;

export const BRAND_SUPPORT_EMAIL = 'support@liatholding.com' as const;

export const BRAND_TAGLINE = 'מערכת מקצועית ליצירת תלושי שכר לעובדים זרים בישראל.' as const;

export const BRAND_LEGAL_NOTE =
  'המערכת מחושבת לפי חוקי העבודה הישראלים, לרבות פקודת מס הכנסה, חוק הביטוח הלאומי וחוק פנסיית חובה (2008). החישובים מיועדים לצרכי מידע בלבד — יש להתייעץ עם רואה חשבון לצרכי אישור.' as const;

/** HSL values for the CSS custom property (no hsl() wrapper) */
export const BRAND_COLORS = {
  primary: '224 71% 33%',       // #1e3a8a — navy
  primaryHex: '#1e3a8a',
  accent: '#3b82f6',            // sky blue
  accentLight: '#93c5fd',       // icon tints on dark bg
  accentLighter: '#bfdbfe',     // nav link text
  backgroundTint: '#f0f4ff',    // hero / card bg
  dark: '#0f172a',              // footer bg
} as const;
