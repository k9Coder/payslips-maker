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

export function PaySection() {
  const { watch } = useFormContext<PayslipFormValues>();
  const pc = watch('payCalculation');

  return (
    <div className="grid gap-5 sm:grid-cols-2">
      <DisabledField label="שכר מינימום" value={pc.minimumWage} />
      <DisabledField label="שכר יומי" value={pc.dailyRate} />
      <DisabledField label="שכר יסוד" value={pc.baseSalary} />
      <DisabledField label="גמול יום מנוחה" value={pc.restDayPremium} />
      <DisabledField label="התאמת מחלה" value={pc.sickPayAdjustment} />
      <DisabledField label="דמי הבראה" value={pc.recoveryPay} />
      <DisabledField label="דמי כיס (מקדמה)" value={pc.pocketMoneyPaid} />
      <DisabledField label='סה"כ ברוטו' value={pc.grossSalary} bold />
    </div>
  );
}
