export type SupportedLanguage =
  | 'he'  // Hebrew
  | 'en'  // English
  | 'fil' // Filipino / Tagalog
  | 'th'  // Thai
  | 'am'  // Amharic
  | 'hi'  // Hindi
  | 'ar'; // Arabic

export type MultiLangString = Partial<Record<SupportedLanguage, string>>;

export function resolveMultiLangString(
  value: MultiLangString | string | undefined | null,
  lang: SupportedLanguage,
): string {
  if (!value) return '';
  if (typeof value === 'string') return value;
  return value[lang] || Object.values(value).find((v) => v?.trim()) || '';
}

export interface IEmployee {
  _id: string;
  companyId: string;
  fullName: MultiLangString;
  passportNumber: string;
  nationality: string;
  email?: string;
  phone?: string;
  startDate: string; // YYYY-MM-DD
  preferredLanguage: SupportedLanguage;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export type CreateEmployeeDto = Omit<IEmployee, '_id' | 'companyId' | 'createdAt' | 'updatedAt'>;
export type UpdateEmployeeDto = Partial<CreateEmployeeDto>;
