import { useFormContext } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { PayslipFormValues } from '../../payslip.schema';

function DisabledField({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex flex-col gap-2">
      <Label>{label}</Label>
      <Input value={value} type="number" disabled className="bg-muted" />
    </div>
  );
}

export function WorkDetailsSection() {
  const { watch } = useFormContext<PayslipFormValues>();
  const wd = watch('workDetails');

  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      <DisabledField label="ימים שעבד" value={wd.workedDays} />
      <DisabledField label="ימי מנוחה שעבד" value={wd.restDaysWorked} />
      <DisabledField label="ימי חופשה" value={wd.vacationDays} />
      <DisabledField label="ימי מחלה" value={wd.sickDays} />
      <DisabledField label="ימי חג" value={wd.holidayDays} />
    </div>
  );
}
