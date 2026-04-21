import { useFormContext } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { PayslipFormValues } from '../../payslip.schema';

function DisabledField({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex flex-col gap-2">
      <Label>{label}</Label>
      <Input value={value.toFixed(2)} disabled className="bg-muted" />
    </div>
  );
}

export function EmployerContributionsSection() {
  const { watch } = useFormContext<PayslipFormValues>();
  const ec = watch('employerContributions');

  return (
    <div className="grid gap-5 sm:grid-cols-2">
      <DisabledField label="ביטוח לאומי מעסיק (3.6%)" value={ec.nii} />
      <DisabledField label="חלף פנסיה (6.5%)" value={ec.pensionSubstitute} />
      <DisabledField label="חלף פיצויים (6%)" value={ec.severanceSubstitute} />
      <DisabledField label="יתרת חלף פנסיה מצטבר" value={ec.cumulativePensionBalance} />
      <DisabledField label="יתרת חלף פיצויים מצטבר" value={ec.cumulativeSeveranceBalance} />
    </div>
  );
}
