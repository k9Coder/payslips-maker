import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { PayslipFormValues } from '../../payslip.schema';

export function EmployeeSection() {
  const { t } = useTranslation();
  const {
    register,
    formState: { errors },
  } = useFormContext<PayslipFormValues>();

  const fields = [
    { key: 'employeeInfo.fullName' as const, label: t('payslip.employee.fullName') },
    { key: 'employeeInfo.idNumber' as const, label: t('payslip.employee.idNumber') },
    { key: 'employeeInfo.nationality' as const, label: t('payslip.employee.nationality') },
    { key: 'employeeInfo.employerName' as const, label: t('payslip.employee.employerName') },
    { key: 'employeeInfo.employerTaxId' as const, label: t('payslip.employee.employerTaxId') },
  ];

  return (
    <div className="grid gap-5 sm:grid-cols-2">
      {fields.map(({ key, label }) => {
        const fieldKey = key.split('.')[1] as keyof PayslipFormValues['employeeInfo'];
        const error = errors.employeeInfo?.[fieldKey];
        return (
          <div key={key} className="flex flex-col gap-2">
            <Label htmlFor={key}>{label}</Label>
            <Input
              id={key}
              {...register(key)}
              aria-invalid={!!error}
              className={error ? 'border-destructive' : ''}
            />
            {error && (
              <p className="text-sm text-destructive">{error.message}</p>
            )}
          </div>
        );
      })}
    </div>
  );
}
