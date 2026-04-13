import { useFormContext, useWatch } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { usePayslipCalculations } from '../../hooks/usePayslipCalculations';
import type { PayslipFormValues } from '../../payslip.schema';

export function EmployerContributionsSection() {
  const { t } = useTranslation();
  const { register, setValue } = useFormContext<PayslipFormValues>();

  const grossSalary = useWatch({ name: 'payCalculation.grossSalary' }) as number;
  const deductions = useWatch({ name: 'deductions' }) as PayslipFormValues['deductions'];

  const { employerNationalInsurance, employerPension } = usePayslipCalculations({
    grossSalary: grossSalary || 0,
    overrides: deductions,
  });

  // Auto-fill employer contributions
  useEffect(() => {
    setValue('employerContributions.nationalInsurance', employerNationalInsurance, { shouldValidate: false });
    setValue('employerContributions.pension', employerPension, { shouldValidate: false });
  }, [employerNationalInsurance, employerPension, setValue]);

  return (
    <div className="space-y-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <Label htmlFor="employerContributions.nationalInsurance">
              {t('payslip.employerContributions.nationalInsurance')}
            </Label>
            <Badge variant="secondary" className="text-xs">{t('payslip.pay.calculated')}</Badge>
          </div>
          <Input
            id="employerContributions.nationalInsurance"
            type="number"
            min={0}
            step={0.01}
            {...register('employerContributions.nationalInsurance', { valueAsNumber: true })}
          />
        </div>

        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <Label htmlFor="employerContributions.pension">
              {t('payslip.employerContributions.pension')}
            </Label>
            <Badge variant="secondary" className="text-xs">{t('payslip.pay.calculated')}</Badge>
          </div>
          <Input
            id="employerContributions.pension"
            type="number"
            min={0}
            step={0.01}
            {...register('employerContributions.pension', { valueAsNumber: true })}
          />
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        <div className="flex flex-col gap-2">
          <Label htmlFor="employerContributions.pensionFund">
            {t('payslip.employerContributions.pensionFund')}
          </Label>
          <Input
            id="employerContributions.pensionFund"
            {...register('employerContributions.pensionFund')}
          />
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="employerContributions.pensionEmployeeRate">
            {t('payslip.employerContributions.pensionEmployeeRate')}
          </Label>
          <Input
            id="employerContributions.pensionEmployeeRate"
            type="number"
            min={0}
            step={0.01}
            {...register('employerContributions.pensionEmployeeRate', { valueAsNumber: true })}
          />
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="employerContributions.pensionEmployerRate">
            {t('payslip.employerContributions.pensionEmployerRate')}
          </Label>
          <Input
            id="employerContributions.pensionEmployerRate"
            type="number"
            min={0}
            step={0.01}
            {...register('employerContributions.pensionEmployerRate', { valueAsNumber: true })}
          />
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="employerContributions.severanceFund">
            {t('payslip.employerContributions.severanceFund')}
          </Label>
          <Input
            id="employerContributions.severanceFund"
            type="number"
            min={0}
            step={0.01}
            {...register('employerContributions.severanceFund', { valueAsNumber: true })}
          />
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="employerContributions.educationFund">
            {t('payslip.employerContributions.educationFund')}
          </Label>
          <Input
            id="employerContributions.educationFund"
            type="number"
            min={0}
            step={0.01}
            {...register('employerContributions.educationFund', { valueAsNumber: true })}
          />
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="employerContributions.educationFundEmployee">
            {t('payslip.employerContributions.educationFundEmployee')}
          </Label>
          <Input
            id="employerContributions.educationFundEmployee"
            type="number"
            min={0}
            step={0.01}
            {...register('employerContributions.educationFundEmployee', { valueAsNumber: true })}
          />
        </div>
      </div>
    </div>
  );
}
