import type { IWorkLogEntry, WorkLogEntryType } from '@payslips-maker/shared';
import { cn } from '@/lib/utils';

const TYPE_CONFIG: Record<WorkLogEntryType, { bg: string; label: string; symbol: string }> = {
  work: { bg: 'bg-teal-500', label: 'עבודה', symbol: '' },
  vacation: { bg: 'bg-amber-400', label: 'חופשה', symbol: '☀' },
  sick: { bg: 'bg-blue-400', label: 'מחלה', symbol: '✚' },
  holiday: { bg: 'bg-gray-400', label: 'חג', symbol: '✡' },
  overtime: { bg: 'bg-purple-500', label: 'שעות נוספות', symbol: '+' },
};

const TYPE_CYCLE: (WorkLogEntryType | null)[] = [
  null, 'work', 'vacation', 'sick', 'holiday', 'overtime',
];

interface DayCellProps {
  date: string; // YYYY-MM-DD
  dayNumber: number;
  entry?: IWorkLogEntry;
  isCurrentMonth: boolean;
  isWeekend: boolean;
  onCycle: (date: string, nextType: WorkLogEntryType | null) => void;
}

export function DayCell({ date, dayNumber, entry, isCurrentMonth, isWeekend, onCycle }: DayCellProps) {
  const currentType = entry?.type ?? null;
  const currentIndex = TYPE_CYCLE.indexOf(currentType);
  const nextType = TYPE_CYCLE[(currentIndex + 1) % TYPE_CYCLE.length];
  const config = currentType ? TYPE_CONFIG[currentType] : null;

  return (
    <button
      onClick={() => isCurrentMonth && onCycle(date, nextType)}
      disabled={!isCurrentMonth}
      title={config?.label}
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
    </button>
  );
}
