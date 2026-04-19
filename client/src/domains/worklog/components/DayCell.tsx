import type { IWorkLogEntry, WorkLogEntryType } from '@payslips-maker/shared';
import { cn } from '@/lib/utils';

const TYPE_CONFIG: Record<WorkLogEntryType, { dot: string; label: string }> = {
  work: { dot: 'bg-teal-500', label: 'עבודה' },
  vacation: { dot: 'bg-amber-400', label: 'חופשה' },
  sick: { dot: 'bg-blue-400', label: 'מחלה' },
  holiday: { dot: 'bg-gray-400', label: 'חג' },
  overtime: { dot: 'bg-purple-500', label: 'שעות נוספות' },
};

interface DayCellProps {
  date: string;
  dayNumber: number;
  entries: IWorkLogEntry[];
  isCurrentMonth: boolean;
  isWeekend: boolean;
  onDayClick: (date: string) => void;
}

export function DayCell({ date, dayNumber, entries, isCurrentMonth, isWeekend, onDayClick }: DayCellProps) {
  const types = [...new Set(entries.map((e) => e.type))].slice(0, 3);
  const hasEntries = entries.length > 0;
  const totalHours = entries.reduce((s, e) => s + (e.hours ?? 0), 0);
  const title = hasEntries
    ? types.map((t) => TYPE_CONFIG[t].label).join(' + ') + (totalHours > 0 ? ` — ${totalHours}ש` : '')
    : undefined;

  return (
    <button
      onClick={() => isCurrentMonth && onDayClick(date)}
      disabled={!isCurrentMonth}
      title={title}
      className={cn(
        'relative h-10 w-full rounded-lg border border-gray-100 flex flex-col items-center justify-center gap-0.5',
        'text-xs font-medium transition-all select-none',
        isCurrentMonth ? 'cursor-pointer hover:scale-105 active:scale-95' : 'opacity-20 cursor-default',
        isWeekend && !hasEntries && 'bg-gray-50',
        hasEntries ? 'bg-white border-gray-300' : 'bg-white text-gray-700',
      )}
    >
      <span className={cn('leading-none', hasEntries ? 'text-gray-800' : 'text-gray-600')}>
        {dayNumber}
      </span>
      {types.length > 0 && (
        <div className="flex gap-0.5">
          {types.map((t) => (
            <span key={t} className={cn('h-1.5 w-1.5 rounded-full', TYPE_CONFIG[t].dot)} />
          ))}
        </div>
      )}
    </button>
  );
}
