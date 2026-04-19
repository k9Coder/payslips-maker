import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { IWorkLogEntry, WorkLogEntryType } from '@payslips-maker/shared';

const TYPE_OPTIONS: { type: WorkLogEntryType; label: string; bg: string; text: string }[] = [
  { type: 'work', label: 'עבודה', bg: 'bg-teal-500', text: 'text-white' },
  { type: 'vacation', label: 'חופשה', bg: 'bg-amber-400', text: 'text-white' },
  { type: 'sick', label: 'מחלה', bg: 'bg-blue-400', text: 'text-white' },
  { type: 'holiday', label: 'חג', bg: 'bg-gray-400', text: 'text-white' },
  { type: 'overtime', label: 'שעות נוספות', bg: 'bg-purple-500', text: 'text-white' },
];

interface DayEntryDialogProps {
  open: boolean;
  date: string; // YYYY-MM-DD
  existingEntry?: IWorkLogEntry;
  onSave: (type: WorkLogEntryType, hours: number | undefined, notes: string | undefined) => void;
  onClear: () => void;
  onClose: () => void;
}

export function DayEntryDialog({ open, date, existingEntry, onSave, onClear, onClose }: DayEntryDialogProps) {
  const [selectedType, setSelectedType] = useState<WorkLogEntryType | null>(existingEntry?.type ?? null);
  const [hours, setHours] = useState<string>(existingEntry?.hours != null ? String(existingEntry.hours) : '');
  const [notes, setNotes] = useState<string>(existingEntry?.notes ?? '');

  useEffect(() => {
    if (open) {
      setSelectedType(existingEntry?.type ?? null);
      setHours(existingEntry?.hours != null ? String(existingEntry.hours) : '');
      setNotes(existingEntry?.notes ?? '');
    }
  }, [open, existingEntry]);

  const parts = date.split('-');
  const displayDate = parts.length === 3 ? `${parts[2]}/${parts[1]}/${parts[0]}` : date;

  function handleSave() {
    if (!selectedType) return;
    const parsedHours = hours.trim() !== '' ? Number(hours) : undefined;
    onSave(selectedType, parsedHours, notes.trim() || undefined);
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-sm" dir="rtl">
        <DialogHeader>
          <DialogTitle className="text-[#1B2A4A]">עדכון יום {displayDate}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Type selector */}
          <div>
            <Label className="text-sm font-medium text-gray-700 mb-2 block">סוג יום</Label>
            <div className="flex flex-wrap gap-2">
              {TYPE_OPTIONS.map(({ type, label, bg, text }) => (
                <button
                  key={type}
                  onClick={() => setSelectedType(type)}
                  className={[
                    'px-3 py-1.5 rounded-full text-sm font-medium transition-all border-2',
                    selectedType === type
                      ? `${bg} ${text} border-transparent shadow-md scale-105`
                      : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400',
                  ].join(' ')}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Hours input */}
          <div>
            <Label htmlFor="day-hours" className="text-sm font-medium text-gray-700 mb-1 block">
              שעות ({selectedType === 'overtime' ? 'נוספות' : 'עבודה'})
            </Label>
            <Input
              id="day-hours"
              type="number"
              min={0}
              max={24}
              step={0.5}
              placeholder="0"
              value={hours}
              onChange={(e) => setHours(e.target.value)}
              className="w-full"
            />
          </div>

          {/* Notes textarea */}
          <div>
            <Label htmlFor="day-notes" className="text-sm font-medium text-gray-700 mb-1 block">הערות</Label>
            <textarea
              id="day-notes"
              rows={2}
              maxLength={500}
              placeholder="הערה אופציונלית..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-2 justify-end pt-1">
            {existingEntry && (
              <Button variant="destructive" size="sm" onClick={onClear}>
                מחק
              </Button>
            )}
            <Button variant="outline" size="sm" onClick={onClose}>ביטול</Button>
            <Button
              size="sm"
              disabled={!selectedType}
              onClick={handleSave}
              className="bg-[#1B2A4A] hover:bg-[#243659] text-white"
            >
              שמור
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
