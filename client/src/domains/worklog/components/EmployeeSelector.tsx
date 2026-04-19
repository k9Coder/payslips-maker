import type { IEmployee } from '@payslips-maker/shared';
import { resolveMultiLangString, SupportedLanguage } from '@payslips-maker/shared';
import { useTranslation } from 'react-i18next';

interface EmployeeSelectorProps {
  employees: IEmployee[];
  selectedId: string;
  onChange: (id: string) => void;
}

export function EmployeeSelector({ employees, selectedId, onChange }: EmployeeSelectorProps) {
  const { i18n } = useTranslation();
  return (
    <div className="flex gap-2 flex-wrap">
      {employees.map((emp) => (
        <button
          key={emp._id}
          onClick={() => onChange(emp._id)}
          className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
            selectedId === emp._id
              ? 'bg-[#1B2A4A] text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          {resolveMultiLangString(emp.fullName, i18n.language as SupportedLanguage)}
        </button>
      ))}
    </div>
  );
}
