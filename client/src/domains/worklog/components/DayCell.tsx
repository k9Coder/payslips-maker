import type { IWorkLogEntry, WorkLogEntryType } from '@payslips-maker/shared';
import { cn } from '@/lib/utils';

const TYPE_CONFIG: Record<WorkLogEntryType, { dot: string; label: string }> = {
  work: { dot: 'bg-teal-500', label: 'עבודה' },
  vacation: { dot: 'bg-amber-400', label: 'חופשה' },
  sick: { dot: 'bg-blue-400', label: 'מחלה' },
  holiday: { dot: 'bg-gray-400', label: 'חג' },
  rest_day: { dot: 'bg-orange-500', label: 'יום מנוחה' },
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
  const hasEntries = entries.length > 0;
  const totalHours = entries.reduce((s, e) => s + (e.hours ?? 0), 0);

  const title = hasEntries
    ? entries.map((e) => {
        const label = TYPE_CONFIG[e.type].label;
        const time = e.startTime && e.endTime ? ` ${e.startTime}–${e.endTime}` : '';
        const hrs = e.hours ? ` (${e.hours}ש)` : '';
        return label + time + hrs;
      }).join(' | ')
    : undefined;

  // Show a dot per entry (up to 4), then "+N"
  const visibleEntries = entries.slice(0, 4);
  const extra = entries.length - 4;

  return (
    <button
      onClick={() => isCurrentMonth && onDayClick(date)}
      disabled={!isCurrentMonth}
      title={title}
      className={cn(
        'relative h-12 w-full rounded-lg border flex flex-col items-center justify-center gap-0.5',
        'text-xs font-medium transition-all select-none',
        isCurrentMonth ? 'cursor-pointer hover:scale-105 active:scale-95' : 'opacity-20 cursor-default',
        isWeekend && !hasEntries && 'bg-gray-50 border-gray-100',
        hasEntries ? 'bg-white border-gray-300 shadow-sm' : 'bg-white border-gray-100 text-gray-700',
      )}
    >
      {/* Entry count badge — top-left corner */}
      {entries.length > 1 && (
        <span className="absolute top-0.5 start-0.5 text-[9px] font-bold text-gray-400 leading-none">
          ×{entries.length}
        </span>
      )}

      <span className={cn('leading-none text-xs', hasEntries ? 'text-gray-800 font-semibold' : 'text-gray-600')}>
        {dayNumber}
      </span>

      {/* Dot per entry */}
      {hasEntries && (
        <div className="flex gap-0.5 items-center">
          {visibleEntries.map((e, i) => (
            <span key={i} className={cn('h-1.5 w-1.5 rounded-full', TYPE_CONFIG[e.type].dot)} />
          ))}
          {extra > 0 && (
            <span className="text-[8px] text-gray-400 leading-none">+{extra}</span>
          )}
        </div>
      )}

      {/* Total hours */}
      {totalHours > 0 && (
        <span className="text-[8px] text-gray-400 leading-none">{totalHours}ש</span>
      )}
    </button>
  );
}
