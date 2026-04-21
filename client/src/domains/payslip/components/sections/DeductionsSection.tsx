import { useFormContext } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { PayslipFormValues } from '../../payslip.schema';

function DisabledField({ label, value, bold }: { label: string; value: number; bold?: boolean }) {
  return (
    <div className="flex flex-col gap-2">
      <Label className={bold ? 'font-bold' : ''}>{label}</Label>
      <Input value={value.toFixed(2)} disabled className={`bg-muted ${bold ? 'font-bold' : ''}`} />
    </div>
  );
}

export function DeductionsSection() {
  const { watch } = useFormContext<PayslipFormValues>();
  const d = watch('deductions');
  const grossSalary = watch('payCalculation.grossSalary');

  const deductionPct = grossSalary > 0
    ? ((d.totalPermittedDeductions / grossSalary) * 100).toFixed(1)
    : '0.0';

  return (
    <div className="space-y-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <DisabledField label="ניכוי ביטוח רפואי" value={d.medicalInsuranceDeduction} />
        <DisabledField label="ניכוי מגורים" value={d.accommodationDeduction} />
        <DisabledField label="הוצאות נלוות" value={d.utilitiesDeduction} />
        <DisabledField label="ניכוי כלכלה" value={d.foodDeduction} />
        <DisabledField label="מס הכנסה" value={d.incomeTax} />
        <DisabledField label='סה"כ ניכויים' value={d.totalPermittedDeductions} bold />
      </div>
      <p className="text-sm text-muted-foreground">
        ניכויים מהווים {deductionPct}% מהברוטו
      </p>
    </div>
  );
}
