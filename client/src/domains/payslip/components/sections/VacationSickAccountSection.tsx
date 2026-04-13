import { useFormContext, useWatch } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { PayslipFormValues } from '../../payslip.schema';

function AccountFields({ prefix, labels }: {
  prefix: 'vacationAccount' | 'sickAccount';
  labels: { previousBalance: string; accrued: string; used: string; remaining: string };
}) {
  const { register } = useFormContext<PayslipFormValues>();

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <div className="flex flex-col gap-2">
        <Label htmlFor={`${prefix}.previousBalance`}>{labels.previousBalance}</Label>
        <Input
          id={`${prefix}.previousBalance`}
          type="number"
          min={0}
          step={0.01}
          {...register(`${prefix}.previousBalance` as any, { valueAsNumber: true })}
        />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor={`${prefix}.accrued`}>{labels.accrued}</Label>
        <Input
          id={`${prefix}.accrued`}
          type="number"
          min={0}
          step={0.01}
          {...register(`${prefix}.accrued` as any, { valueAsNumber: true })}
        />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor={`${prefix}.used`}>{labels.used}</Label>
        <Input
          id={`${prefix}.used`}
          type="number"
          min={0}
          step={0.01}
          {...register(`${prefix}.used` as any, { valueAsNumber: true })}
        />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor={`${prefix}.remaining`}>{labels.remaining}</Label>
        <Input
          id={`${prefix}.remaining`}
          type="number"
          min={0}
          step={0.01}
          {...register(`${prefix}.remaining` as any, { valueAsNumber: true })}
        />
      </div>
    </div>
  );
}

export function VacationSickAccountSection() {
  const { t } = useTranslation();
  const { setValue } = useFormContext<PayslipFormValues>();

  const vacationAccount = useWatch({ name: 'vacationAccount' });
  const sickAccount = useWatch({ name: 'sickAccount' });

  const vacationEnabled = vacationAccount != null;
  const sickEnabled = sickAccount != null;

  function toggleVacation(enabled: boolean) {
    setValue(
      'vacationAccount',
      enabled ? { previousBalance: 0, accrued: 0, used: 0, remaining: 0 } : null,
      { shouldDirty: true }
    );
  }

  function toggleSick(enabled: boolean) {
    setValue(
      'sickAccount',
      enabled ? { previousBalance: 0, accrued: 0, used: 0, remaining: 0 } : null,
      { shouldDirty: true }
    );
  }

  return (
    <div className="space-y-6">
      {/* Vacation Account */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            id="vacation-account-toggle"
            checked={vacationEnabled}
            onChange={(e) => toggleVacation(e.target.checked)}
            className="h-4 w-4 cursor-pointer"
          />
          <Label htmlFor="vacation-account-toggle" className="font-medium cursor-pointer">
            {t('payslip.vacationAccount.title')}
          </Label>
        </div>
        {vacationEnabled && (
          <AccountFields
            prefix="vacationAccount"
            labels={{
              previousBalance: t('payslip.vacationAccount.previousBalance'),
              accrued: t('payslip.vacationAccount.accrued'),
              used: t('payslip.vacationAccount.used'),
              remaining: t('payslip.vacationAccount.remaining'),
            }}
          />
        )}
      </div>

      {/* Sick Account */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            id="sick-account-toggle"
            checked={sickEnabled}
            onChange={(e) => toggleSick(e.target.checked)}
            className="h-4 w-4 cursor-pointer"
          />
          <Label htmlFor="sick-account-toggle" className="font-medium cursor-pointer">
            {t('payslip.sickAccount.title')}
          </Label>
        </div>
        {sickEnabled && (
          <AccountFields
            prefix="sickAccount"
            labels={{
              previousBalance: t('payslip.sickAccount.previousBalance'),
              accrued: t('payslip.sickAccount.accrued'),
              used: t('payslip.sickAccount.used'),
              remaining: t('payslip.sickAccount.remaining'),
            }}
          />
        )}
      </div>
    </div>
  );
}
