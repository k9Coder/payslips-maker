import { useState, useEffect } from 'react';
import { Trash2, Pencil, X } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { IWorkLogEntry, WorkLogEntryType, UpdateWorkLogEntryDto } from '@payslips-maker/shared';
import type { CreateWorkLogEntryDto } from '@payslips-maker/shared';

const TYPE_OPTIONS: { type: WorkLogEntryType; label: string; bg: string; dot: string }[] = [
  { type: 'work', label: 'עבודה', bg: 'bg-teal-500', dot: 'bg-teal-500' },
  { type: 'vacation', label: 'חופשה', bg: 'bg-amber-400', dot: 'bg-amber-400' },
  { type: 'sick', label: 'מחלה', bg: 'bg-blue-400', dot: 'bg-blue-400' },
  { type: 'holiday', label: 'חג', bg: 'bg-gray-400', dot: 'bg-gray-400' },
  { type: 'overtime', label: 'שעות נוספות', bg: 'bg-purple-500', dot: 'bg-purple-500' },
];

interface DayEntryDialogProps {
  open: boolean;
  date: string; // YYYY-MM-DD
  entries: IWorkLogEntry[];
  onCreate: (dto: Omit<CreateWorkLogEntryDto, 'employeeId' | 'date'>) => Promise<void>;
  onUpdate: (entryId: string, dto: UpdateWorkLogEntryDto) => Promise<void>;
  onDelete: (entryId: string) => Promise<void>;
  onClose: () => void;
}

interface FormState {
  type: WorkLogEntryType | null;
  hours: string;
  notes: string;
}

const EMPTY_FORM: FormState = { type: null, hours: '', notes: '' };

export function DayEntryDialog({ open, date, entries, onCreate, onUpdate, onDelete, onClose }: DayEntryDialogProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setEditingId(null);
      setForm(EMPTY_FORM);
    }
  }, [open]);

  const parts = date.split('-');
  const displayDate = parts.length === 3 ? `${parts[2]}/${parts[1]}/${parts[0]}` : date;

  function startEdit(entry: IWorkLogEntry) {
    setEditingId(entry._id);
    setForm({
      type: entry.type,
      hours: entry.hours != null ? String(entry.hours) : '',
      notes: entry.notes ?? '',
    });
  }

  function cancelEdit() {
    setEditingId(null);
    setForm(EMPTY_FORM);
  }

  async function handleSave() {
    if (!form.type) return;
    setSaving(true);
    const hours = form.hours.trim() !== '' ? Number(form.hours) : undefined;
    const notes = form.notes.trim() || undefined;
    try {
      if (editingId) {
        await onUpdate(editingId, { type: form.type, hours, notes });
      } else {
        await onCreate({ type: form.type, hours, notes });
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
                    <span className="text-sm font-medium text-gray-700 flex-1">{opt?.label}</span>
                    {entry.hours != null && (
                      <span className="text-xs text-gray-500">{entry.hours}ש</span>
                    )}
                    {entry.notes && (
                      <span className="text-xs text-gray-400 truncate max-w-[60px]">{entry.notes}</span>
                    )}
                    <button
                      onClick={() => startEdit(entry)}
                      className="p-1 text-gray-400 hover:text-[#1B2A4A] transition-colors"
                      aria-label="ערוך"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(entry._id)}
                      disabled={saving}
                      className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                      aria-label="מחק"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          {/* Divider */}
          {entries.length > 0 && (
            <div className="border-t border-gray-100" />
          )}

          {/* Add / Edit form */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">
                {editingId ? 'עריכת רשומה' : 'רשומה חדשה'}
              </p>
              {editingId && (
                <button onClick={cancelEdit} className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600">
                  <X className="h-3 w-3" /> ביטול עריכה
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

            {/* Hours */}
            <div className="flex gap-3 mb-3">
              <div className="flex-1">
                <Label htmlFor="entry-hours" className="text-xs text-gray-600 mb-1 block">שעות</Label>
                <Input
                  id="entry-hours"
                  type="number"
                  min={0}
                  max={24}
                  step={0.5}
                  placeholder="0"
                  value={form.hours}
                  onChange={(e) => setForm((f) => ({ ...f, hours: e.target.value }))}
                />
              </div>
            </div>

            {/* Notes */}
            <div className="mb-3">
              <Label htmlFor="entry-notes" className="text-xs text-gray-600 mb-1 block">הערות</Label>
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

            {/* Save button */}
            <Button
              size="sm"
              disabled={!form.type || saving}
              onClick={handleSave}
              className="w-full bg-[#1B2A4A] hover:bg-[#243659] text-white"
            >
              {editingId ? 'עדכן' : 'הוסף'}
            </Button>
          </div>

          {/* Close */}
          <Button variant="outline" size="sm" onClick={onClose} className="w-full">
            סגור
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
