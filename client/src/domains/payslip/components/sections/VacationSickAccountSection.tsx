import { useFormContext } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { PayslipFormValues } from '../../payslip.schema';

function AccountFields({ prefix, labels }: {
  prefix: 'vacationAccount' | 'sickAccount';
  labels: { previousBalance: string; accrued: string; used: string; remaining: string };
}) {
  const { watch } = useFormContext<PayslipFormValues>();
  const account = watch(prefix);
  if (!account) return null;

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <div className="flex flex-col gap-2">
        <Label>{labels.previousBalance}</Label>
        <Input value={account.previousBalance.toFixed(2)} disabled className="bg-muted" />
      </div>
      <div className="flex flex-col gap-2">
        <Label>{labels.accrued}</Label>
        <Input value={account.accrued.toFixed(2)} disabled className="bg-muted" />
      </div>
      <div className="flex flex-col gap-2">
        <Label>{labels.used}</Label>
        <Input value={account.used.toFixed(2)} disabled className="bg-muted" />
      </div>
      <div className="flex flex-col gap-2">
        <Label>{labels.remaining}</Label>
        <Input value={account.remaining.toFixed(2)} disabled className="bg-muted" />
      </div>
    </div>
  );
}

export function VacationSickAccountSection() {
  const { watch } = useFormContext<PayslipFormValues>();

  const vacationAccount = watch('vacationAccount');
  const sickAccount = watch('sickAccount');

  return (
    <div className="space-y-6">
      {vacationAccount != null && (
        <div className="space-y-3">
          <p className="text-sm font-medium">חשבון חופשה</p>
          <AccountFields
            prefix="vacationAccount"
            labels={{
              previousBalance: 'יתרה קודמת',
              accrued: 'נצברו',
              used: 'נוצלו',
              remaining: 'יתרה',
            }}
          />
        </div>
      )}

      {sickAccount != null && (
        <div className="space-y-3">
          <p className="text-sm font-medium">חשבון מחלה</p>
          <AccountFields
            prefix="sickAccount"
            labels={{
              previousBalance: 'יתרה קודמת',
              accrued: 'נצברו',
              used: 'נוצלו',
              remaining: 'יתרה',
            }}
          />
        </div>
      )}
    </div>
  );
}
