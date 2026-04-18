import { useNavigate } from 'react-router-dom';
import { Users, FileText, CalendarDays, Plus } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { resolveMultiLangString, type SupportedLanguage } from '@payslips-maker/shared';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { useDashboardStats, useFormsSummary } from '../domains/employees/hooks/useEmployeeStats';

export function DashboardPage() {
  const navigate = useNavigate();
  const { i18n } = useTranslation();
  const { employeeCount, employees, isLoading } = useDashboardStats();
  const { data: formsSummary } = useFormsSummary();

  if (isLoading) {
    return <div className="flex items-center justify-center h-32 text-gray-400">טוען...</div>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-[#1B2A4A]">ראשי</h1>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          icon={<Users className="h-6 w-6 text-teal-600" />}
          label="עובדים פעילים"
          value={employeeCount}
        />
        <StatCard
          icon={<FileText className="h-6 w-6 text-[#1B2A4A]" />}
          label="תלושים החודש"
          value={formsSummary?.thisMonth ?? 0}
        />
        <StatCard
          icon={<FileText className="h-6 w-6 text-gray-400" />}
          label="סה״כ תלושים"
          value={formsSummary?.count ?? 0}
        />
      </div>

      {/* Quick actions */}
      <div className="flex flex-wrap gap-3">
        <Button onClick={() => navigate('/forms/new')}>
          <Plus className="h-4 w-4 ms-2" />
          תלוש חדש
        </Button>
        <Button variant="outline" onClick={() => navigate('/worklog')}>
          <CalendarDays className="h-4 w-4 ms-2" />
          יומן עבודה
        </Button>
        <Button variant="outline" onClick={() => navigate('/employees/new')}>
          <Plus className="h-4 w-4 ms-2" />
          עובד חדש
        </Button>
      </div>

      {/* Per-employee summary */}
      {employees.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-[#1B2A4A] mb-3">סיכום לפי עובד</h2>
          <div className="space-y-3">
            {employees.map((emp) => (
              <Card
                key={emp._id}
                className="cursor-pointer hover:shadow-sm transition-shadow"
                onClick={() => navigate(`/employees/${emp._id}`)}
              >
                <CardContent className="flex items-center justify-between py-4 px-5">
                  <span className="font-medium text-[#1B2A4A]">
                    {resolveMultiLangString(emp.fullName, i18n.language as SupportedLanguage)}
                  </span>
                  <div className="flex gap-4 text-sm text-gray-400">
                    <button
                      className="hover:text-[#1B2A4A] transition-colors"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/worklog?employeeId=${emp._id}`);
                      }}
                    >
                      יומן
                    </button>
                    <button
                      className="hover:text-[#1B2A4A] transition-colors"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/forms/new?employeeId=${emp._id}`);
                      }}
                    >
                      תלוש
                    </button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {employees.length === 0 && (
        <div className="text-center py-12 text-gray-400">
          <p className="mb-3">אין עובדים עדיין.</p>
          <Button onClick={() => navigate('/employees/new')}>הוסף עובד</Button>
        </div>
      )}
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
}) {
  return (
    <Card>
      <CardContent className="flex items-center gap-4 py-5 px-5">
        {icon}
        <div>
          <p className="text-2xl font-bold text-[#1B2A4A]">{value}</p>
          <p className="text-xs text-gray-500">{label}</p>
        </div>
      </CardContent>
    </Card>
  );
}
