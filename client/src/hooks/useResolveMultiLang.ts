import { useTranslation } from 'react-i18next';
import { resolveMultiLangString } from '@payslips-maker/shared';
import type { MultiLangString, SupportedLanguage } from '@payslips-maker/shared';

export function useResolveMultiLang() {
  const { i18n } = useTranslation();
  return (value: MultiLangString | string | undefined | null) =>
    resolveMultiLangString(value, i18n.language as SupportedLanguage);
}
