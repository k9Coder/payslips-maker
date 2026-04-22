import type { MultiLangString, SupportedLanguage } from '@payslips-maker/shared';

export function resolveMultiLangString(
  value: MultiLangString | string | undefined | null,
  lang: SupportedLanguage,
): string {
  if (!value) return '';
  if (typeof value === 'string') return value;
  return value[lang] || Object.values(value).find((v) => v?.trim()) || '';
}
