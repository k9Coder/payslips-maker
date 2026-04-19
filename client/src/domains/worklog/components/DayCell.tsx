import type { IWorkLogEntry, WorkLogEntryType } from '@payslips-maker/shared';
import { cn } from '@/lib/utils';

const TYPE_CONFIG: Record<WorkLogEntryType, { bg: string; label: string; symbol: string }> = {
  work: { bg: 'bg-teal-500', label: 'עבודה', symbol: '' },
  vacation: { bg: 'bg-amber-400', label: 'חופשה', symbol: '☀' },
  sick: { bg: 'bg-blue-400', label: 'מחלה', symbol: '✚' },
  holiday: { bg: 'bg-gray-400', label: 'חג', symbol: '✡' },
  overtime: { bg: 'bg-purple-500', label: 'שעות נוספות', symbol: '+' },
};

interface DayCellProps {
  date: string;
  dayNumber: number;
  entry?: IWorkLogEntry;
  isCurrentMonth: boolean;
  isWeekend: boolean;
  onDayClick: (date: string) => void;
}

export function DayCell({ date, dayNumber, entry, isCurrentMonth, isWeekend, onDayClick }: DayCellProps) {
  const config = entry?.type ? TYPE_CONFIG[entry.type] : null;

  return (
    <button
      onClick={() => isCurrentMonth && onDayClick(date)}
      disabled={!isCurrentMonth}
      title={config ? `${config.label}${entry?.hours != null ? ` — ${entry.hours}ש` : ''}` : undefined}
      className={cn(
        'relative h-10 w-full rounded-lg border border-gray-100 flex flex-col items-center justify-center gap-0.5',
        'text-xs font-medium transition-all select-none',
        isCurrentMonth ? 'cursor-pointer hover:scale-105 active:scale-95' : 'opacity-20 cursor-default',
        isWeekend && !config && 'bg-gray-50',
        config ? `${config.bg} text-white border-transparent` : 'bg-white text-gray-700',
      )}
    >
      <span className="leading-none">{dayNumber}</span>
      {config?.symbol && <span className="text-[9px] leading-none opacity-90">{config.symbol}</span>}
      {entry?.hours != null && (
        <span className="text-[8px] leading-none opacity-80">{entry.hours}ש</span>
      )}
    </button>
  );
}
