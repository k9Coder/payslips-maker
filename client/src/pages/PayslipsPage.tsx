import { useNavigate } from 'react-router-dom';
import { FileText, Plus, ChevronLeft } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { useApiClient } from '../lib/useApiClient';
import { useEmployees } from '../domains/employees/hooks/useEmployees';
import type { IEmployee, FormListItem, SupportedLanguage } from '@payslips-maker/shared';
import { resolveMultiLangString } from '@payslips-maker/shared';
import { useTranslation } from 'react-i18next';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';

const MONTH_NAMES = [
  '', 'ינואר', 'פברואר', 'מרץ', 'אפריל', 'מאי', 'יוני',
  'יולי', 'אוגוסט', 'ספטמבר', 'אוקטובר', 'נובמבר', 'דצמבר',
];

function useAllForms() {
  const { get } = useApiClient();
  return useQuery({
    queryKey: ['forms', 'all'],
    queryFn: async () => {
      const res = await get<{ data: FormListItem[] }>('/api/forms');
      return res.data;
    },
  });
}

export function PayslipsPage() {
  const navigate = useNavigate();
  const { i18n } = useTranslation();
  const { data: forms, isLoading: loadingForms } = useAllForms();
  const { data: employees, isLoading: loadingEmp } = useEmployees();

  if (loadingForms || loadingEmp) {
    return <div className="flex items-center justify-center h-32 text-gray-400">טוען...</div>;
  }

  // Build employee lookup map
  const empMap = new Map<string, IEmployee>(
    (employees ?? []).map((e) => [e._id, e])
  );

  // Group forms by employeeId
  const grouped = new Map<string, FormListItem[]>();
  (forms ?? []).forEach((f) => {
    if (!grouped.has(f.employeeId)) grouped.set(f.employeeId, []);
    grouped.get(f.employeeId)!.push(f);
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FileText className="h-6 w-6 text-[#1B2A4A]" />
          <h1 className="text-2xl font-bold text-[#1B2A4A]">תלושי שכר</h1>
        </div>
        <Button onClick={() => navigate('/forms/new')}>
          <Plus className="h-4 w-4 ms-2" />
          תלוש חדש
        </Button>
      </div>

      {grouped.size === 0 && (
        <div className="text-center py-16 text-gray-400">
          <FileText className="h-12 w-12 mx-auto mb-4 opacity-30" />
          <p className="mb-4">אין תלושים עדיין</p>
          <Button onClick={() => navigate('/forms/new')}>צור תלוש ראשון</Button>
        </div>
      )}

      {[...grouped.entries()].map(([empId, empForms]) => {
        const emp = empMap.get(empId);
        const empName = emp
          ? resolveMultiLangString(emp.fullName, i18n.language as SupportedLanguage)
          : 'עובד לא ידוע';

        const sorted = [...empForms].sort((a, b) => {
          if (a.period.year !== b.period.year) return b.period.year - a.period.year;
          return b.period.month - a.period.month;
        });

        return (
          <Card key={empId}>
            <CardHeader className="pb-2">
              <CardTitle className="text-base text-[#1B2A4A]">{empName}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-1 pt-0">
              {sorted.map((form) => (
                <div
                  key={form._id}
                  className="flex items-center justify-between py-2.5 px-3 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                  onClick={() => navigate(`/forms/${form._id}`)}
                >
                  <div className="flex items-center gap-3">
                    <div>
                      <span className="font-medium text-sm text-[#1B2A4A]">
                        {MONTH_NAMES[form.period.month]} {form.period.year}
                      </span>
                      <span className="ms-2 text-xs text-gray-400">
                        {form.formType === 'payslip' ? 'מחליף תלוש שכר' : 'גמר חשבון'}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {form.grossSalary != null && (
                      <span className="text-sm font-medium text-teal-700">
                        ₪{form.grossSalary.toLocaleString()}
                      </span>
                    )}
                    <ChevronLeft className="h-4 w-4 text-gray-300" />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
