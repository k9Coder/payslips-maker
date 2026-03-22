import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { PayslipFormValues } from '../../payslip.schema';

interface NumberFieldProps {
  name: string;
  label: string;
  min?: number;
  step?: number;
}

function NumberField({ name, label, min = 0, step = 1 }: NumberFieldProps) {
  const {
    register,
    formState: { errors },
  } = useFormContext<PayslipFormValues>();

  const keys = name.split('.');
  const sectionErrors = errors as Record<string, Record<string, { message?: string }>>;
  const error = keys.length === 2 ? sectionErrors[keys[0]]?.[keys[1]] : undefined;

  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor={name}>{label}</Label>
      <Input
        id={name}
        type="number"
        min={min}
        step={step}
        {...register(name as Parameters<typeof register>[0], { valueAsNumber: true })}
        aria-invalid={!!error}
        className={error ? 'border-destructive' : ''}
      />
      {error && <p className="text-sm text-destructive">{error.message}</p>}
    </div>
  );
}

export function WorkDetailsSection() {
  const { t } = useTranslation();

  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      <NumberField name="workDetails.standardDays" label={t('payslip.workDetails.standardDays')} min={1} />
      <NumberField name="workDetails.workedDays" label={t('payslip.workDetails.workedDays')} />
      <NumberField name="workDetails.vacationDays" label={t('payslip.workDetails.vacationDays')} />
      <NumberField name="workDetails.sickDays" label={t('payslip.workDetails.sickDays')} />
      <NumberField name="workDetails.holidayDays" label={t('payslip.workDetails.holidayDays')} />
      <NumberField name="workDetails.overtime100h" label={t('payslip.workDetails.overtime100h')} step={0.5} />
      <NumberField name="workDetails.overtime125h" label={t('payslip.workDetails.overtime125h')} step={0.5} />
      <NumberField name="workDetails.overtime150h" label={t('payslip.workDetails.overtime150h')} step={0.5} />
    </div>
  );
}
