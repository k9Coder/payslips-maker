import { useNavigate } from 'react-router-dom';
import { User, Calendar, Globe } from 'lucide-react';
import type { IEmployee, SupportedLanguage } from '@payslips-maker/shared';
import { resolveMultiLangString } from '@payslips-maker/shared';
import { useTranslation } from 'react-i18next';
import { Card, CardContent } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';

interface EmployeeCardProps {
  employee: IEmployee;
}

export function EmployeeCard({ employee }: EmployeeCardProps) {
  const navigate = useNavigate();
  const { i18n } = useTranslation();
  const name = resolveMultiLangString(employee.fullName, i18n.language as SupportedLanguage);

  return (
    <Card
      className="cursor-pointer hover:shadow-md transition-shadow border border-gray-200 rounded-xl"
      onClick={() => navigate(`/employees/${employee._id}`)}
    >
      <CardContent className="p-5">
        <div className="flex items-center gap-3 mb-4">
          <div className="h-12 w-12 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
            <User className="h-6 w-6 text-[#1B2A4A]" />
          </div>
          <div className="min-w-0">
            <p className="font-semibold text-[#1B2A4A] text-base truncate">{name}</p>
            <p className="text-xs text-gray-500">{employee.nationality}</p>
          </div>
        </div>

        <div className="space-y-2 text-sm text-gray-600 mb-4">
          <div className="flex items-center gap-2">
            <Globe className="h-4 w-4 text-gray-400 shrink-0" />
            <span className="truncate">{employee.passportNumber}</span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-gray-400 shrink-0" />
            <span>{employee.startDate}</span>
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className="flex-1 text-xs"
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/forms/new?employeeId=${employee._id}`);
            }}
          >
            + תלוש
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="text-xs"
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/employees/${employee._id}/edit`);
            }}
          >
            עריכה
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
