import { useMemo } from 'react';
import { ChevronRight, ChevronLeft } from 'lucide-react';
import type { WorkLogMonthSummary, IWorkLogEntry } from '@payslips-maker/shared';
import { DayCell } from './DayCell';

const HEBREW_MONTHS = [
  'ינואר','פברואר','מרץ','אפריל','מאי','יוני',
  'יולי','אוגוסט','ספטמבר','אוקטובר','נובמבר','דצמבר',
];
const HEBREW_DAYS = ['א׳','ב׳','ג׳','ד׳','ה׳','ו׳','ש׳'];

interface WorkLogCalendarProps {
  year: number;
  month: number; // 1–12
  summary?: WorkLogMonthSummary;
  onPrev: () => void;
  onNext: () => void;
  onDayClick: (date: string) => void;
}

export function WorkLogCalendar({ year, month, summary, onPrev, onNext, onDayClick }: WorkLogCalendarProps) {
  // Group entries by date — multiple entries per date allowed
  const entriesMap = useMemo(() => {
    const map: Record<string, IWorkLogEntry[]> = {};
    summary?.entries.forEach((e) => {
      if (!map[e.date]) map[e.date] = [];
      map[e.date].push(e);
    });
    return map;
  }, [summary]);

  const { daysInMonth, startDow } = useMemo(() => ({
    daysInMonth: new Date(year, month, 0).getDate(),
    startDow: new Date(year, month - 1, 1).getDay(),
  }), [year, month]);

  const cells = useMemo(() => {
    const result: { date: string; day: number; dow: number }[] = [];
    for (let d = 1; d <= daysInMonth; d++) {
      const date = `${year}-${String(month).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const dow = (startDow + d - 1) % 7;
      result.push({ date, day: d, dow });
    }
    return result;
  }, [year, month, daysInMonth, startDow]);

  return (
    <div>
      {/* Month navigation */}
      <div className="flex items-center justify-between mb-4">
        <button onClick={onPrev} className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
          <ChevronRight className="h-5 w-5 text-gray-600" />
        </button>
        <h2 className="text-lg font-bold text-[#1B2A4A]">
          {HEBREW_MONTHS[month - 1]} {year}
        </h2>
        <button onClick={onNext} className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
          <ChevronLeft className="h-5 w-5 text-gray-600" />
        </button>
      </div>

      {/* Day-of-week headers */}
      <div className="grid grid-cols-7 gap-1 mb-1">
        {HEBREW_DAYS.map((d) => (
          <div key={d} className="text-center text-[11px] text-gray-400 font-medium py-1">{d}</div>
        ))}
      </div>

      {/* Day cells */}
      <div className="grid grid-cols-7 gap-1">
        {Array.from({ length: startDow }).map((_, i) => (
          <div key={`empty-${i}`} />
        ))}
        {cells.map((cell) => (
          <DayCell
            key={cell.date}
            date={cell.date}
            dayNumber={cell.day}
            entries={entriesMap[cell.date] ?? []}
            isCurrentMonth={true}
            isWeekend={cell.dow === 5 || cell.dow === 6}
            onDayClick={onDayClick}
          />
        ))}
      </div>

      {/* Monthly summary */}
      {summary && (
        <div className="mt-4 grid grid-cols-4 gap-2">
          <SumBadge
            color="bg-teal-500"
            label="עבודה"
            value={`${summary.workDays}י${summary.totalWorkHours > 0 ? ` / ${summary.totalWorkHours}ש` : ''}`}
          />
          <SumBadge color="bg-amber-400" label="חופשה" value={`${summary.vacationDays}י`} />
          <SumBadge color="bg-blue-400" label="מחלה" value={`${summary.sickDays}י`} />
          <SumBadge color="bg-purple-500" label="נוספות" value={`${summary.overtimeHours}ש`} />
        </div>
      )}
    </div>
  );
}

function SumBadge({ color, label, value }: { color: string; label: string; value: string }) {
  return (
    <div className="rounded-lg bg-gray-50 p-2 text-center">
      <div className={`h-2 w-2 rounded-full ${color} mx-auto mb-1`} />
      <p className="text-sm font-bold text-[#1B2A4A]">{value}</p>
      <p className="text-[10px] text-gray-500">{label}</p>
    </div>
  );
}
