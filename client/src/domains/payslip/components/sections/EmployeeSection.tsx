import { useFormContext, Controller } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MultiLangInput } from '@/shared/components/MultiLangInput';
import type { PayslipFormValues } from '../../payslip.schema';
import type { MultiLangString } from '@payslips-maker/shared';

export function EmployeeSection() {
  const { t } = useTranslation();
  const {
    register,
    setValue,
    watch,
    control,
    formState: { errors },
  } = useFormContext<PayslipFormValues>();

  const salaryBasis = watch('employeeInfo.salaryBasis') ?? 'monthly';

  const lockedStringFields = [
    { key: 'employeeInfo.idNumber' as const, label: t('payslip.employee.idNumber') },
    { key: 'employeeInfo.nationality' as const, label: t('payslip.employee.nationality') },
    { key: 'employeeInfo.employerTaxId' as const, label: t('payslip.employee.employerTaxId') },
  ];

  const employerOptionalFields = [
    { key: 'employeeInfo.taxFileNumber' as const, label: t('payslip.employee.taxFileNumber') },
    { key: 'employeeInfo.employerRegistrationNumber' as const, label: t('payslip.employee.employerRegistrationNumber') },
    { key: 'employeeInfo.employerAddress' as const, label: t('payslip.employee.employerAddress') },
    { key: 'employeeInfo.employerCity' as const, label: t('payslip.employee.employerCity') },
    { key: 'employeeInfo.employerZip' as const, label: t('payslip.employee.employerZip') },
  ];

  const employeeOptionalStringFields = [
    { key: 'employeeInfo.employeeNumber' as const, label: t('payslip.employee.employeeNumber') },
    { key: 'employeeInfo.familyStatus' as const, label: t('payslip.employee.familyStatus') },
    { key: 'employeeInfo.grade' as const, label: t('payslip.employee.grade') },
    { key: 'employeeInfo.employmentStartDate' as const, label: t('payslip.employee.employmentStartDate') },
    { key: 'employeeInfo.taxCalcType' as const, label: t('payslip.employee.taxCalcType') },
    { key: 'employeeInfo.nationalInsuranceType' as const, label: t('payslip.employee.nationalInsuranceType') },
    { key: 'employeeInfo.employeeAddress' as const, label: t('payslip.employee.employeeAddress') },
    { key: 'employeeInfo.employeeCity' as const, label: t('payslip.employee.employeeCity') },
    { key: 'employeeInfo.employeeZip' as const, label: t('payslip.employee.employeeZip') },
  ];

  return (
    <div className="space-y-6">
      {/* Required fields */}
      <div className="grid gap-5 sm:grid-cols-2">
        {/* fullName — read-only MultiLangString */}
        <div className="flex flex-col gap-2 sm:col-span-2">
          <Label>{t('payslip.employee.fullName')}</Label>
          <Controller
            name="employeeInfo.fullName"
            control={control}
            render={({ field }) => (
              <MultiLangInput
                value={typeof field.value === 'string' ? { he: field.value } : (field.value as MultiLangString ?? {})}
                onChange={field.onChange}
                readOnly
              />
            )}
          />
        </div>

        {/* employerName — read-only MultiLangString */}
        <div className="flex flex-col gap-2 sm:col-span-2">
          <Label>{t('payslip.employee.employerName')}</Label>
          <Controller
            name="employeeInfo.employerName"
            control={control}
            render={({ field }) => (
              <MultiLangInput
                value={typeof field.value === 'string' ? { he: field.value } : (field.value as MultiLangString ?? {})}
                onChange={field.onChange}
                readOnly
              />
            )}
          />
        </div>

        {/* Plain-string locked fields */}
        {lockedStringFields.map(({ key, label }) => {
          const fieldKey = key.split('.')[1] as keyof PayslipFormValues['employeeInfo'];
          const error = errors.employeeInfo?.[fieldKey];
          return (
            <div key={key} className="flex flex-col gap-2">
              <Label htmlFor={key}>{label}</Label>
              <Input
                id={key}
                {...register(key)}
                readOnly
                aria-invalid={!!error}
                className={`bg-muted cursor-not-allowed ${error ? 'border-destructive' : ''}`}
              />
              {error && <p className="text-sm text-destructive">{error.message as string}</p>}
            </div>
          );
        })}
      </div>

      {/* Employer additional details */}
      <div>
        <p className="text-sm font-medium text-muted-foreground mb-3">{t('payslip.employee.employerDetails')}</p>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {employerOptionalFields.map(({ key, label }) => (
            <div key={key} className="flex flex-col gap-2">
              <Label htmlFor={key}>{label}</Label>
              <Input id={key} {...register(key)} />
            </div>
          ))}
        </div>
      </div>

      {/* Employee personal details */}
      <div>
        <p className="text-sm font-medium text-muted-foreground mb-3">{t('payslip.employee.employeeDetails')}</p>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {/* jobTitle — editable MultiLangString */}
          <div className="flex flex-col gap-2">
            <Label>{t('payslip.employee.jobTitle')}</Label>
            <Controller
              name="employeeInfo.jobTitle"
              control={control}
              render={({ field }) => (
                <MultiLangInput
                  value={typeof field.value === 'string' ? { he: field.value } : (field.value as MultiLangString ?? {})}
                  onChange={field.onChange}
                  compact
                />
              )}
            />
          </div>

          {/* department — editable MultiLangString */}
          <div className="flex flex-col gap-2">
            <Label>{t('payslip.employee.department')}</Label>
            <Controller
              name="employeeInfo.department"
              control={control}
              render={({ field }) => (
                <MultiLangInput
                  value={typeof field.value === 'string' ? { he: field.value } : (field.value as MultiLangString ?? {})}
                  onChange={field.onChange}
                  compact
                />
              )}
            />
          </div>

          {employeeOptionalStringFields.map(({ key, label }) => (
            <div key={key} className="flex flex-col gap-2">
              <Label htmlFor={key}>{label}</Label>
              <Input id={key} {...register(key)} />
            </div>
          ))}

          {/* jobFraction */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="employeeInfo.jobFraction">{t('payslip.employee.jobFraction')}</Label>
            <Input
              id="employeeInfo.jobFraction"
              type="number"
              min={0}
              max={1}
              step={0.01}
              {...register('employeeInfo.jobFraction', { valueAsNumber: true })}
            />
          </div>

          {/* salaryBasis */}
          <div className="flex flex-col gap-2">
            <Label>{t('payslip.employee.salaryBasis')}</Label>
            <Select
              value={salaryBasis}
              onValueChange={(val) =>
                setValue('employeeInfo.salaryBasis', val as 'monthly' | 'daily' | 'hourly', { shouldDirty: true })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="monthly">{t('payslip.employee.salaryBasisMonthly')}</SelectItem>
                <SelectItem value="daily">{t('payslip.employee.salaryBasisDaily')}</SelectItem>
                <SelectItem value="hourly">{t('payslip.employee.salaryBasisHourly')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
    </div>
  );
}
