import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { PayslipFormValues } from '../../payslip.schema';

export function PeriodSection() {
  const { t } = useTranslation();
  const { setValue, watch } = useFormContext<PayslipFormValues>();

  const currentMonth = watch('period.month');
  const currentYear = watch('period.year');

  const months = Array.from({ length: 12 }, (_, i) => ({
    value: i + 1,
    label: t(`payslip.period.months.${i + 1}`),
  }));

  const years = Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - 2 + i);

  return (
    <div className="grid gap-5 sm:grid-cols-2">
      <div className="flex flex-col gap-2">
        <Label>{t('payslip.period.month')}</Label>
        <Select
          value={String(currentMonth)}
          onValueChange={(v) => setValue('period.month', Number(v))}
        >
          <SelectTrigger>
            <SelectValue placeholder={t('payslip.period.month')} />
          </SelectTrigger>
          <SelectContent>
            {months.map((m) => (
              <SelectItem key={m.value} value={String(m.value)}>
                {m.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col gap-2">
        <Label>{t('payslip.period.year')}</Label>
        <Select
          value={String(currentYear)}
          onValueChange={(v) => setValue('period.year', Number(v))}
        >
          <SelectTrigger>
            <SelectValue placeholder={t('payslip.period.year')} />
          </SelectTrigger>
          <SelectContent>
            {years.map((y) => (
              <SelectItem key={y} value={String(y)}>
                {y}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
