import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { CalendarDays } from 'lucide-react';
import type { WorkLogEntryType } from '@payslips-maker/shared';
import { useEmployees } from '../employees/hooks/useEmployees';
import { useWorkLogMonth, useUpsertWorkLogEntry, useDeleteWorkLogEntry } from './hooks/useWorkLog';
import { WorkLogCalendar } from './components/WorkLogCalendar';
import { EmployeeSelector } from './components/EmployeeSelector';

export function WorkLogPage() {
  const [searchParams] = useSearchParams();
  const { data: employees, isLoading: loadingEmp } = useEmployees();

  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState('');

  useEffect(() => {
    if (!employees?.length) return;
    const paramId = searchParams.get('employeeId');
    const valid = employees.find((e) => e._id === paramId);
    setSelectedEmployeeId(valid ? paramId! : employees[0]._id);
  }, [employees, searchParams]);

  const { data: summary, isLoading: loadingSummary } = useWorkLogMonth(
    selectedEmployeeId,
    year,
    month
  );

  const upsert = useUpsertWorkLogEntry();
  const deleteEntry = useDeleteWorkLogEntry();

  function prevMonth() {
    if (month === 1) { setMonth(12); setYear((y) => y - 1); }
    else setMonth((m) => m - 1);
  }
  function nextMonth() {
    if (month === 12) { setMonth(1); setYear((y) => y + 1); }
    else setMonth((m) => m + 1);
  }

  async function handleCycleDay(date: string, nextType: WorkLogEntryType | null) {
    if (!selectedEmployeeId) return;
    if (nextType === null) {
      const entry = summary?.entries.find((e) => e.date === date);
      if (entry) await deleteEntry.mutateAsync(entry._id);
    } else {
      await upsert.mutateAsync({ employeeId: selectedEmployeeId, date, type: nextType });
    }
  }

  if (loadingEmp) return <div className="flex items-center justify-center h-32 text-gray-400">טוען...</div>;

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      <div className="flex items-center gap-2">
        <CalendarDays className="h-6 w-6 text-[#1B2A4A]" />
        <h1 className="text-2xl font-bold text-[#1B2A4A]">יומן עבודה</h1>
      </div>

      {employees && employees.length > 1 && (
        <EmployeeSelector
          employees={employees}
          selectedId={selectedEmployeeId}
          onChange={setSelectedEmployeeId}
        />
      )}

      {loadingSummary ? (
        <div className="flex items-center justify-center h-32 text-gray-400">טוען...</div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <WorkLogCalendar
            year={year}
            month={month}
            summary={summary}
            onPrev={prevMonth}
            onNext={nextMonth}
            onCycleDay={handleCycleDay}
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
        <span className="ms-2">• לחץ על יום לשינוי סטטוס</span>
      </div>
    </div>
  );
}
