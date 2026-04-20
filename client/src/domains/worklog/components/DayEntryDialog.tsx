import { useState, useEffect } from 'react';
import { Trash2, Pencil, X, Clock } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { IWorkLogEntry, WorkLogEntryType, UpdateWorkLogEntryDto, CreateWorkLogEntryDto } from '@payslips-maker/shared';

const TYPE_OPTIONS: { type: WorkLogEntryType; label: string; bg: string; dot: string }[] = [
  { type: 'work', label: 'עבודה', bg: 'bg-teal-500', dot: 'bg-teal-500' },
  { type: 'vacation', label: 'חופשה', bg: 'bg-amber-400', dot: 'bg-amber-400' },
  { type: 'sick', label: 'מחלה', bg: 'bg-blue-400', dot: 'bg-blue-400' },
  { type: 'holiday', label: 'חג', bg: 'bg-gray-400', dot: 'bg-gray-400' },
  { type: 'overtime', label: 'שעות נוספות', bg: 'bg-purple-500', dot: 'bg-purple-500' },
];

interface DayEntryDialogProps {
  open: boolean;
  date: string;
  entries: IWorkLogEntry[];
  onCreate: (dto: Omit<CreateWorkLogEntryDto, 'employeeId' | 'date'>) => Promise<void>;
  onUpdate: (entryId: string, dto: UpdateWorkLogEntryDto) => Promise<void>;
  onDelete: (entryId: string) => Promise<void>;
  onClose: () => void;
}

interface FormState {
  type: WorkLogEntryType | null;
  startTime: string;
  endTime: string;
  hours: string;
  notes: string;
}

const EMPTY_FORM: FormState = { type: null, startTime: '', endTime: '', hours: '', notes: '' };

function timeToMinutes(t: string): number {
  const [h, m] = t.split(':').map(Number);
  return h * 60 + m;
}

function minutesToHours(mins: number): string {
  return mins > 0 ? String(Math.round(mins / 60 * 100) / 100) : '';
}

export function DayEntryDialog({ open, date, entries, onCreate, onUpdate, onDelete, onClose }: DayEntryDialogProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) { setEditingId(null); setForm(EMPTY_FORM); }
  }, [open]);

  // Auto-calculate hours from time range
  useEffect(() => {
    if (form.startTime && form.endTime) {
      const mins = timeToMinutes(form.endTime) - timeToMinutes(form.startTime);
      if (mins > 0) setForm((f) => ({ ...f, hours: minutesToHours(mins) }));
    }
  }, [form.startTime, form.endTime]);

  const parts = date.split('-');
  const displayDate = parts.length === 3 ? `${parts[2]}/${parts[1]}/${parts[0]}` : date;
  const hasTimeRange = !!(form.startTime && form.endTime);

  function startEdit(entry: IWorkLogEntry) {
    setEditingId(entry._id);
    setForm({
      type: entry.type,
      startTime: entry.startTime ?? '',
      endTime: entry.endTime ?? '',
      hours: entry.hours != null ? String(entry.hours) : '',
      notes: entry.notes ?? '',
    });
  }

  function cancelEdit() { setEditingId(null); setForm(EMPTY_FORM); }

  async function handleSave() {
    if (!form.type) return;
    setSaving(true);
    const hours = form.hours.trim() !== '' ? Number(form.hours) : undefined;
    const startTime = form.startTime || undefined;
    const endTime = form.endTime || undefined;
    const notes = form.notes.trim() || undefined;
    try {
      if (editingId) {
        await onUpdate(editingId, { type: form.type, hours, startTime, endTime, notes });
      } else {
        await onCreate({ type: form.type, hours, startTime, endTime, notes });
      }
      setEditingId(null);
      setForm(EMPTY_FORM);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(entryId: string) {
    setSaving(true);
    try {
      await onDelete(entryId);
      if (editingId === entryId) cancelEdit();
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-sm" dir="rtl">
        <DialogHeader>
          <DialogTitle className="text-[#1B2A4A]">יום {displayDate}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Existing entries list */}
          {entries.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">רשומות קיימות</p>
              {entries.map((entry) => {
                const opt = TYPE_OPTIONS.find((o) => o.type === entry.type);
                return (
                  <div
                    key={entry._id}
                    className={[
                      'flex items-center gap-2 rounded-lg px-3 py-2 border',
                      editingId === entry._id ? 'border-[#1B2A4A] bg-slate-50' : 'border-gray-100 bg-gray-50',
                    ].join(' ')}
                  >
                    <span className={`h-2.5 w-2.5 rounded-full shrink-0 ${opt?.dot ?? 'bg-gray-300'}`} />
                    <span className="text-sm font-medium text-gray-700">{opt?.label}</span>
                    {entry.startTime && entry.endTime ? (
                      <span className="flex items-center gap-0.5 text-xs text-gray-500">
                        <Clock className="h-3 w-3" />
                        {entry.startTime}–{entry.endTime}
                      </span>
                    ) : entry.hours != null ? (
                      <span className="text-xs text-gray-500">{entry.hours}ש</span>
                    ) : null}
                    {entry.notes && (
                      <span className="text-xs text-gray-400 truncate max-w-[50px] flex-1">{entry.notes}</span>
                    )}
                    <div className="flex gap-0.5 ms-auto">
                      <button onClick={() => startEdit(entry)} className="p-1 text-gray-400 hover:text-[#1B2A4A] transition-colors" aria-label="ערוך">
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      <button onClick={() => handleDelete(entry._id)} disabled={saving} className="p-1 text-gray-400 hover:text-red-500 transition-colors" aria-label="מחק">
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {entries.length > 0 && <div className="border-t border-gray-100" />}

          {/* Add / Edit form */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">
                {editingId ? 'עריכת רשומה' : 'רשומה חדשה'}
              </p>
              {editingId && (
                <button onClick={cancelEdit} className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600">
                  <X className="h-3 w-3" /> ביטול
                </button>
              )}
            </div>

            {/* Type selector */}
            <div className="flex flex-wrap gap-1.5 mb-3">
              {TYPE_OPTIONS.map(({ type, label, bg }) => (
                <button
                  key={type}
                  onClick={() => setForm((f) => ({ ...f, type }))}
                  className={[
                    'px-2.5 py-1 rounded-full text-xs font-medium transition-all border-2',
                    form.type === type
                      ? `${bg} text-white border-transparent shadow-sm scale-105`
                      : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400',
                  ].join(' ')}
                >
                  {label}
                </button>
              ))}
            </div>

            {/* Time range */}
            <div className="flex gap-2 mb-2">
              <div className="flex-1">
                <Label htmlFor="entry-start" className="text-xs text-gray-500 mb-1 block">מ-</Label>
                <Input
                  id="entry-start"
                  type="time"
                  value={form.startTime}
                  onChange={(e) => setForm((f) => ({ ...f, startTime: e.target.value }))}
                />
              </div>
              <div className="flex-1">
                <Label htmlFor="entry-end" className="text-xs text-gray-500 mb-1 block">עד-</Label>
                <Input
                  id="entry-end"
                  type="time"
                  value={form.endTime}
                  onChange={(e) => setForm((f) => ({ ...f, endTime: e.target.value }))}
                />
              </div>
              {(form.startTime || form.endTime) && (
                <button
                  onClick={() => setForm((f) => ({ ...f, startTime: '', endTime: '' }))}
                  className="self-end mb-0.5 p-2 text-gray-300 hover:text-gray-500 transition-colors"
                  aria-label="נקה שעות"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            {/* Hours — auto-filled from time range, editable when no range */}
            <div className="mb-3">
              <Label htmlFor="entry-hours" className="text-xs text-gray-500 mb-1 block">
                שעות {hasTimeRange && <span className="text-teal-500">(חושב אוטומטית)</span>}
              </Label>
              <Input
                id="entry-hours"
                type="number"
                min={0}
                max={24}
                step={0.5}
                placeholder="0"
                value={form.hours}
                readOnly={hasTimeRange}
                onChange={(e) => !hasTimeRange && setForm((f) => ({ ...f, hours: e.target.value }))}
                className={hasTimeRange ? 'bg-gray-50 text-gray-500' : ''}
              />
            </div>

            {/* Notes */}
            <div className="mb-3">
              <Label htmlFor="entry-notes" className="text-xs text-gray-500 mb-1 block">הערות</Label>
              <textarea
                id="entry-notes"
                rows={2}
                maxLength={500}
                placeholder="הערה אופציונלית..."
                value={form.notes}
                onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none"
              />
            </div>

            <Button
              size="sm"
              disabled={!form.type || saving}
              onClick={handleSave}
              className="w-full bg-[#1B2A4A] hover:bg-[#243659] text-white"
            >
              {editingId ? 'עדכן' : 'הוסף'}
            </Button>
          </div>

          <Button variant="outline" size="sm" onClick={onClose} className="w-full">סגור</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
