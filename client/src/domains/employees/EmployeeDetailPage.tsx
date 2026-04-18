import { useParams, useNavigate } from 'react-router-dom';
import { ArrowRight, Edit2, Trash2, FileText, CalendarDays } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { resolveMultiLangString } from '@payslips-maker/shared';
import type { SupportedLanguage } from '@payslips-maker/shared';
import { useEmployee, useDeleteEmployee } from './hooks/useEmployees';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';

export function EmployeeDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { i18n } = useTranslation();
  const { data: employee, isLoading } = useEmployee(id!);
  const deleteEmployee = useDeleteEmployee();

  if (isLoading) return <div className="p-4 text-gray-400">טוען...</div>;
  if (!employee) return <div className="p-4 text-gray-400">עובד לא נמצא</div>;

  const name = resolveMultiLangString(employee.fullName, i18n.language as SupportedLanguage);

  async function handleDelete() {
    if (!confirm(`למחוק את ${name}?`)) return;
    await deleteEmployee.mutateAsync(id!);
    navigate('/employees');
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/employees')}
          className="flex items-center gap-2 text-[#1B2A4A] hover:opacity-70 text-sm"
        >
          <ArrowRight className="h-4 w-4" />
          כל העובדים
        </button>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => navigate(`/employees/${id}/edit`)}>
            <Edit2 className="h-4 w-4 me-1" />
            עריכה
          </Button>
          <Button variant="destructive" size="sm" onClick={handleDelete} disabled={deleteEmployee.isPending}>
            <Trash2 className="h-4 w-4 me-1" />
            מחיקה
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-[#1B2A4A]">{name}</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-4 text-sm">
          <InfoRow label="מס׳ דרכון" value={employee.passportNumber} />
          <InfoRow label="לאום" value={employee.nationality} />
          <InfoRow label="תאריך התחלה" value={employee.startDate} />
          <InfoRow label="שפה מועדפת" value={employee.preferredLanguage} />
          {employee.email && <InfoRow label="אימייל" value={employee.email} />}
          {employee.phone && <InfoRow label="טלפון" value={employee.phone} />}
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 gap-3">
        <Button
          variant="outline"
          className="flex items-center justify-center gap-2 h-12"
          onClick={() => navigate(`/worklog?employeeId=${id}`)}
        >
          <CalendarDays className="h-5 w-5 text-teal-600" />
          יומן עבודה
        </Button>
        <Button
          variant="outline"
          className="flex items-center justify-center gap-2 h-12"
          onClick={() => navigate(`/forms/new?employeeId=${id}`)}
        >
          <FileText className="h-5 w-5 text-[#1B2A4A]" />
          תלוש חדש
        </Button>
      </div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-gray-400 text-xs mb-0.5">{label}</p>
      <p className="text-gray-800 font-medium">{value}</p>
    </div>
  );
}
