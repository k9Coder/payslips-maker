import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { CalendarDays, User } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { resolveMultiLangString, type SupportedLanguage } from '@payslips-maker/shared';
import type { UpdateWorkLogEntryDto, CreateWorkLogEntryDto } from '@payslips-maker/shared';
import { useEmployees } from '../employees/hooks/useEmployees';
import {
  useWorkLogMonth,
  useCreateWorkLogEntry,
  useUpdateWorkLogEntry,
  useDeleteWorkLogEntry,
} from './hooks/useWorkLog';
import { WorkLogCalendar } from './components/WorkLogCalendar';
import { EmployeeSelector } from './components/EmployeeSelector';
import { DayEntryDialog } from './components/DayEntryDialog';

export function WorkLogPage() {
  const [searchParams] = useSearchParams();
  const { i18n } = useTranslation();
  const { data: employees, isLoading: loadingEmp } = useEmployees();

  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState('');
  const [dialogDate, setDialogDate] = useState<string | null>(null);

  useEffect(() => {
    if (!employees?.length) return;
    const paramId = searchParams.get('employeeId');
    const valid = employees.find((e) => e._id === paramId);
    setSelectedEmployeeId(valid ? paramId! : employees[0]._id);
  }, [employees, searchParams]);

  const selectedEmployee = employees?.find((e) => e._id === selectedEmployeeId);
  const selectedName = selectedEmployee
    ? resolveMultiLangString(selectedEmployee.fullName, i18n.language as SupportedLanguage)
    : '';

  const { data: summary, isLoading: loadingSummary } = useWorkLogMonth(
    selectedEmployeeId,
    year,
    month
  );

  const create = useCreateWorkLogEntry();
  const update = useUpdateWorkLogEntry();
  const remove = useDeleteWorkLogEntry();

  function prevMonth() {
    if (month === 1) { setMonth(12); setYear((y) => y - 1); }
    else setMonth((m) => m - 1);
  }
  function nextMonth() {
    if (month === 12) { setMonth(1); setYear((y) => y + 1); }
    else setMonth((m) => m + 1);
  }

  async function handleCreate(dto: Omit<CreateWorkLogEntryDto, 'employeeId' | 'date'>) {
    if (!dialogDate || !selectedEmployeeId) return;
    await create.mutateAsync({ employeeId: selectedEmployeeId, date: dialogDate, ...dto });
  }

  async function handleUpdate(entryId: string, dto: UpdateWorkLogEntryDto) {
    await update.mutateAsync({ entryId, dto });
  }

  async function handleDelete(entryId: string) {
    await remove.mutateAsync(entryId);
  }

  const dialogEntries = dialogDate
    ? (summary?.entries.filter((e) => e.date === dialogDate) ?? [])
    : [];

  if (loadingEmp) return <div className="flex items-center justify-center h-32 text-gray-400">טוען...</div>;

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2">
          <CalendarDays className="h-6 w-6 text-[#1B2A4A]" />
          <h1 className="text-2xl font-bold text-[#1B2A4A]">יומן עבודה</h1>
        </div>
        {/* Always show which employee's worklog this is */}
        {selectedName && (
          <div className="flex items-center gap-1.5 bg-[#1B2A4A]/8 rounded-lg px-3 py-1.5">
            <User className="h-4 w-4 text-[#1B2A4A]" />
            <span className="text-sm font-semibold text-[#1B2A4A]">{selectedName}</span>
          </div>
        )}
      </div>

      {/* Employee selector — always shown when more than one employee */}
      {employees && employees.length > 1 && (
        <div className="space-y-1">
          <p className="text-xs text-gray-400 font-medium">בחר עובד</p>
          <EmployeeSelector
            employees={employees}
            selectedId={selectedEmployeeId}
            onChange={setSelectedEmployeeId}
          />
        </div>
      )}

      {loadingSummary ? (
        <div className="flex items-center justify-center h-32 text-gray-400">טוען...</div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-3 sm:p-5">
          <WorkLogCalendar
            year={year}
            month={month}
            summary={summary}
            onPrev={prevMonth}
            onNext={nextMonth}
            onDayClick={setDialogDate}
          />
        </div>
      )}

      {/* Legend */}
      <div className="flex flex-wrap gap-3 text-xs text-gray-400">
        {[
          { color: 'bg-teal-500', label: 'עבודה' },
          { color: 'bg-amber-400', label: 'חופשה' },
          { color: 'bg-blue-400', label: 'מחלה' },
          { color: 'bg-gray-400', label: 'חג' },
          { color: 'bg-purple-500', label: 'שעות נוספות' },
        ].map(({ color, label }) => (
          <div key={label} className="flex items-center gap-1">
            <div className={`h-3 w-3 rounded-sm ${color}`} />
            {label}
          </div>
        ))}
        <span className="ms-2">• לחץ על יום לפתיחת פרטים</span>
      </div>

      <DayEntryDialog
        open={dialogDate !== null}
        date={dialogDate ?? ''}
        entries={dialogEntries}
        onCreate={handleCreate}
        onUpdate={handleUpdate}
        onDelete={handleDelete}
        onClose={() => setDialogDate(null)}
      />
    </div>
  );
}
