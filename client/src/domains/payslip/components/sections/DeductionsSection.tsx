import { useFormContext, useWatch } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '@/lib/utils';
import { usePayslipCalculations } from '../../hooks/usePayslipCalculations';
import type { PayslipFormValues } from '../../payslip.schema';
import type { IDeductions } from '@payslips-maker/shared';

interface DeductionRowProps {
  field: keyof IDeductions;
  label: string;
  calculated: number;
  isOverridden: boolean;
}

function DeductionRow({ field, label, calculated, isOverridden }: DeductionRowProps) {
  const { t } = useTranslation();
  const { register } = useFormContext<PayslipFormValues>();

  return (
    <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
      {/* Label */}
      <div>
        <Label className="text-base">{label}</Label>
        <p className="text-sm text-muted-foreground">
          {t('payslip.deductions.overrideHint')}
        </p>
      </div>

      {/* Calculated value */}
      <div className="flex flex-col items-center gap-1">
        <span className="text-xs text-muted-foreground">{t('payslip.pay.calculated')}</span>
        <span className="rounded bg-muted px-2 py-1 text-sm font-medium">
          {formatCurrency(calculated)}
        </span>
      </div>

      {/* Override input */}
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">{t('payslip.pay.override')}</span>
          {isOverridden && (
            <Badge variant="outline" className="text-xs text-amber-600 border-amber-400">
              ידני
            </Badge>
          )}
        </div>
        <Input
          type="number"
          min={0}
          step={0.01}
          placeholder={String(calculated)}
          {...register(`deductions.${field}`, { valueAsNumber: true })}
          className={isOverridden ? 'border-amber-400 bg-amber-50' : ''}
        />
      </div>
    </div>
  );
}

export function DeductionsSection() {
  const { t } = useTranslation();
  const { setValue } = useFormContext<PayslipFormValues>();

  const grossSalary = useWatch({ name: 'payCalculation.grossSalary' }) as number;
  const currentDeductions = (useWatch({ name: 'deductions' }) ?? {}) as PayslipFormValues['deductions'];
  const netSalary = useWatch({ name: 'netSalary' }) as number;

  // Detect manual overrides (non-zero values that differ from calculated)
  const { calculated, effective } = usePayslipCalculations({
    grossSalary: grossSalary || 0,
    overrides: currentDeductions,
  });

  // Auto-fill deductions when grossSalary changes (if not manually overridden)
  useEffect(() => {
    if (!grossSalary || grossSalary <= 0) return;
    // Only auto-fill fields that are still 0 (not manually entered)
    if (currentDeductions.incomeTax === 0) setValue('deductions.incomeTax', calculated.incomeTax, { shouldValidate: false });
    if (currentDeductions.nationalInsurance === 0) setValue('deductions.nationalInsurance', calculated.nationalInsurance, { shouldValidate: false });
    if (currentDeductions.healthInsurance === 0) setValue('deductions.healthInsurance', calculated.healthInsurance, { shouldValidate: false });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [grossSalary]);

  // Update netSalary whenever effective deductions change
  useEffect(() => {
    const total = effective.incomeTax + effective.nationalInsurance + effective.healthInsurance + effective.otherDeductions;
    const net = Math.max(0, (grossSalary || 0) - total);
    setValue('netSalary', Math.round(net * 100) / 100, { shouldValidate: false });
  }, [effective, grossSalary, setValue]);

  const isOverridden = (field: keyof IDeductions) =>
    currentDeductions[field] !== 0 && currentDeductions[field] !== calculated[field];

  const totalDeductions = effective.incomeTax + effective.nationalInsurance + effective.healthInsurance + effective.otherDeductions;

  return (
    <div className="space-y-6">
      <div className="space-y-5">
        <DeductionRow
          field="incomeTax"
          label={t('payslip.deductions.incomeTax')}
          calculated={calculated.incomeTax}
          isOverridden={isOverridden('incomeTax')}
        />
        <DeductionRow
          field="nationalInsurance"
          label={t('payslip.deductions.nationalInsurance')}
          calculated={calculated.nationalInsurance}
          isOverridden={isOverridden('nationalInsurance')}
        />
        <DeductionRow
          field="healthInsurance"
          label={t('payslip.deductions.healthInsurance')}
          calculated={calculated.healthInsurance}
          isOverridden={isOverridden('healthInsurance')}
        />
        <DeductionRow
          field="otherDeductions"
          label={t('payslip.deductions.otherDeductions')}
          calculated={0}
          isOverridden={currentDeductions.otherDeductions > 0}
        />
      </div>

      {/* Summary */}
      <div className="rounded-lg border-2 border-primary/20 bg-primary/5 p-4 space-y-2">
        <div className="flex justify-between text-base">
          <span>{t('payslip.deductions.total')}</span>
          <span className="font-semibold text-destructive">-{formatCurrency(totalDeductions)}</span>
        </div>
        <div className="border-t pt-2 flex justify-between text-lg font-bold">
          <span>{t('payslip.summary.netSalary')}</span>
          <span className="text-primary">{formatCurrency(netSalary || 0)}</span>
        </div>
      </div>
    </div>
  );
}
