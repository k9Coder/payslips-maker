import { useFormContext, useWatch } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '@/lib/utils';
import { calculatePayFromWorkDetails } from '../../hooks/usePayslipCalculations';
import type { PayslipFormValues } from '../../payslip.schema';

export function PaySection() {
  const { t } = useTranslation();
  const { register, setValue, formState: { errors } } = useFormContext<PayslipFormValues>();

  const dailyRate = useWatch({ name: 'payCalculation.dailyRate' }) as number;
  const workDetails = useWatch({ name: 'workDetails' }) as PayslipFormValues['workDetails'];

  // Auto-calculate when dailyRate or workDetails changes
  useEffect(() => {
    if (!dailyRate || dailyRate <= 0) return;
    const calculated = calculatePayFromWorkDetails(workDetails, dailyRate);
    if (calculated.baseSalary !== undefined) setValue('payCalculation.baseSalary', calculated.baseSalary, { shouldValidate: false });
    if (calculated.overtimePay !== undefined) setValue('payCalculation.overtimePay', calculated.overtimePay, { shouldValidate: false });
    if (calculated.grossSalary !== undefined) setValue('payCalculation.grossSalary', calculated.grossSalary, { shouldValidate: false });
  }, [dailyRate, workDetails, setValue]);

  const baseSalary = useWatch({ name: 'payCalculation.baseSalary' }) as number;
  const grossSalary = useWatch({ name: 'payCalculation.grossSalary' }) as number;

  return (
    <div className="space-y-5">
      {/* Daily Rate - the primary input */}
      <div className="flex flex-col gap-2">
        <Label htmlFor="payCalculation.dailyRate" className="text-lg font-semibold">
          {t('payslip.pay.dailyRate')}
        </Label>
        <Input
          id="payCalculation.dailyRate"
          type="number"
          min={0}
          step={0.01}
          {...register('payCalculation.dailyRate', { valueAsNumber: true })}
          className={`text-lg ${errors.payCalculation?.dailyRate ? 'border-destructive' : ''}`}
        />
        {errors.payCalculation?.dailyRate && (
          <p className="text-sm text-destructive">{errors.payCalculation.dailyRate.message}</p>
        )}
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        {/* Base Salary - calculated */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <Label htmlFor="payCalculation.baseSalary">{t('payslip.pay.baseSalary')}</Label>
            <Badge variant="secondary" className="text-xs">{t('payslip.pay.calculated')}</Badge>
          </div>
          <div className="rounded-md border border-input bg-muted px-3 py-3 text-base">
            {formatCurrency(baseSalary || 0)}
          </div>
          <input type="hidden" {...register('payCalculation.baseSalary', { valueAsNumber: true })} />
        </div>

        {/* Overtime Pay - calculated, can override */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <Label htmlFor="payCalculation.overtimePay">{t('payslip.pay.overtimePay')}</Label>
            <Badge variant="secondary" className="text-xs">{t('payslip.pay.calculated')}</Badge>
          </div>
          <Input
            id="payCalculation.overtimePay"
            type="number"
            min={0}
            step={0.01}
            {...register('payCalculation.overtimePay', { valueAsNumber: true })}
          />
        </div>

        {/* Vacation Pay - manual */}
        <div className="flex flex-col gap-2">
          <Label htmlFor="payCalculation.vacationPay">{t('payslip.pay.vacationPay')}</Label>
          <Input
            id="payCalculation.vacationPay"
            type="number"
            min={0}
            step={0.01}
            {...register('payCalculation.vacationPay', { valueAsNumber: true })}
          />
        </div>

        {/* Gross Salary - calculated, can override */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <Label htmlFor="payCalculation.grossSalary" className="font-semibold">
              {t('payslip.pay.grossSalary')}
            </Label>
            <Badge variant="secondary" className="text-xs">{t('payslip.pay.calculated')}</Badge>
          </div>
          <Input
            id="payCalculation.grossSalary"
            type="number"
            min={0}
            step={0.01}
            {...register('payCalculation.grossSalary', { valueAsNumber: true })}
            className="border-primary/50 font-semibold text-lg"
          />
        </div>
      </div>

      {/* Gross summary */}
      {grossSalary > 0 && (
        <div className="rounded-lg bg-primary/5 p-4 text-center">
          <p className="text-lg font-bold text-primary">
            {t('payslip.summary.grossSalary')}: {formatCurrency(grossSalary)}
          </p>
        </div>
      )}
    </div>
  );
}
