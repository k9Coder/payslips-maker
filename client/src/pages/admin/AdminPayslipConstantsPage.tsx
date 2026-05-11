import { useState, useEffect } from 'react';
import { Settings2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';
import { useAdminPayslipConstants, useUpdatePayslipConstants } from '@/domains/admin/hooks/usePayslipConstants';
import type { IPayslipConstants } from '@payslips-maker/shared';

const FIELD_LABELS: Record<keyof Omit<IPayslipConstants, '_id' | 'updatedAt'>, string> = {
  minimumMonthlyWage: 'שכר מינימום חודשי (₪)',
  minimumHourlyWage: 'שכר מינימום שעתי (₪)',
  dailyRate: 'שכר יומי (₪)',
  restDayPremium: 'גמול יום מנוחה/חג (₪)',
  medicalDeductionCeiling: 'תקרת ניכוי ביטוח רפואי (₪)',
  utilitiesDeductionCeiling: 'תקרת הוצאות נלוות (₪)',
  recoveryPayDayRate: 'תעריף יום הבראה (₪)',
  niiEmployerRate: 'שיעור ביטוח לאומי מעסיק (0–1)',
  pensionSubstituteRate: 'שיעור חלף פנסיה (0–1)',
  severanceSubstituteRate: 'שיעור חלף פיצויים (0–1)',
  pocketMoneyPerWeekend: 'דמי כיס לסוף שבוע (₪)',
  effectiveFrom: 'בתוקף מתאריך (YYYY-MM-DD)',
};

export function AdminPayslipConstantsPage() {
  const { data: constants, isLoading } = useAdminPayslipConstants();
  const update = useUpdatePayslipConstants();
  const [values, setValues] = useState<Partial<IPayslipConstants>>({});

  useEffect(() => {
    if (constants) setValues(constants);
  }, [constants]);

  if (isLoading) return <div className="p-4 text-gray-400">טוען...</div>;

  function handleChange(field: keyof IPayslipConstants, raw: string) {
    const num = parseFloat(raw);
    setValues((v) => ({ ...v, [field]: isNaN(num) ? raw : num }));
  }

  async function handleSave() {
    const { _id, updatedAt, ...body } = values as IPayslipConstants;
    void _id; void updatedAt;
    await update.mutateAsync(body);
    toast({ title: 'קבועים עודכנו בהצלחה' });
  }

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <div className="flex items-center gap-2">
        <Settings2 className="h-6 w-6 text-[#1B2A4A]" />
        <h1 className="text-2xl font-bold text-[#1B2A4A]">קבועי שכר</h1>
      </div>
      <p className="text-sm text-gray-500">ערכים אלו מתעדכנים מדי שנה (בד"כ ב-1 באפריל). שינויים ישפיעו על כל תלושי השכר שייווצרו מכאן והלאה.</p>

      <div className="space-y-4">
        {(Object.keys(FIELD_LABELS) as Array<keyof typeof FIELD_LABELS>).map((field) => (
          <div key={field} className="space-y-1">
            <Label htmlFor={field}>{FIELD_LABELS[field]}</Label>
            <Input
              id={field}
              value={String(values[field] ?? '')}
              onChange={(e) => handleChange(field, e.target.value)}
              dir="ltr"
            />
          </div>
        ))}
      </div>

      <Button onClick={handleSave} disabled={update.isPending}>
        {update.isPending ? 'שומר...' : 'שמור שינויים'}
      </Button>
    </div>
  );
}
