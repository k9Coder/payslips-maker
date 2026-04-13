import { useEffect } from 'react';
import { useFormContext, useWatch, Controller } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { formatCurrency } from '@/lib/utils';
import { calculateFinalSettlement } from '../final-settlement.calculations';
import type { FinalSettlementFormValues } from '../final-settlement.schema';

function FormSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle className="text-xl">{title}</CardTitle>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}

function ReadOnlyField({ label, value, currency = false }: { label: string; value: string | number; currency?: boolean }) {
  return (
    <div className="space-y-1">
      <Label className="text-sm text-muted-foreground">{label}</Label>
      <div className="rounded-md border border-dashed bg-muted/30 px-3 py-2 text-sm font-medium">
        {currency && typeof value === 'number' ? formatCurrency(value) : value}
      </div>
    </div>
  );
}

/** Recalculates all derived fields whenever user inputs change */
function RecalculateEffect() {
  const { watch, setValue } = useFormContext<FinalSettlementFormValues>();

  const [
    employmentStartDate,
    employmentEndDate,
    terminationReason,
    lastMonthlySalary,
    vacationDaysUsed,
    recuperationDaysAlreadyPaid,
    noticeActuallyGiven,
    unpaidWages,
    otherAdditions,
    deductionsOther,
  ] = watch([
    'employmentStartDate',
    'employmentEndDate',
    'terminationReason',
    'lastMonthlySalary',
    'vacationDaysUsed',
    'recuperationDaysAlreadyPaid',
    'noticeActuallyGiven',
    'unpaidWages',
    'otherAdditions',
    'deductions.otherDeductions',
  ]);

  useEffect(() => {
    if (!employmentStartDate || !employmentEndDate || !terminationReason) return;

    const result = calculateFinalSettlement({
      employmentStartDate,
      employmentEndDate,
      terminationReason: terminationReason as 'dismissal' | 'resignation' | 'mutual',
      lastMonthlySalary: lastMonthlySalary || 0,
      vacationDaysUsed: vacationDaysUsed || 0,
      recuperationDaysAlreadyPaid: recuperationDaysAlreadyPaid || 0,
      noticeActuallyGiven: noticeActuallyGiven || false,
      unpaidWages: unpaidWages || 0,
      otherAdditions: otherAdditions || 0,
      deductions: {
        incomeTax: 0,
        nationalInsurance: 0,
        healthInsurance: 0,
        otherDeductions: deductionsOther || 0,
      },
    });

    setValue('totalMonths', result.totalMonths, { shouldValidate: false });
    setValue('dailyRate', result.dailyRate, { shouldValidate: false });
    setValue('severanceEligible', result.severanceEligible, { shouldValidate: false });
    setValue('severancePay', result.severancePay, { shouldValidate: false });
    setValue('vacationDaysAccrued', result.vacationDaysAccrued, { shouldValidate: false });
    setValue('unusedVacationDays', result.unusedVacationDays, { shouldValidate: false });
    setValue('vacationPayout', result.vacationPayout, { shouldValidate: false });
    setValue('recuperationDaysEntitled', result.recuperationDaysEntitled, { shouldValidate: false });
    setValue('recuperationPayout', result.recuperationPayout, { shouldValidate: false });
    setValue('noticePeriodDays', result.noticePeriodDays, { shouldValidate: false });
    setValue('noticePeriodPay', result.noticePeriodPay, { shouldValidate: false });
    setValue('totalGross', result.totalGross, { shouldValidate: false });
    setValue('deductions.incomeTax', result.deductions.incomeTax, { shouldValidate: false });
    setValue('deductions.nationalInsurance', result.deductions.nationalInsurance, { shouldValidate: false });
    setValue('deductions.healthInsurance', result.deductions.healthInsurance, { shouldValidate: false });
    setValue('netTotal', result.netTotal, { shouldValidate: false });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    employmentStartDate, employmentEndDate, terminationReason,
    lastMonthlySalary, vacationDaysUsed, recuperationDaysAlreadyPaid,
    noticeActuallyGiven, unpaidWages, otherAdditions, deductionsOther,
  ]);

  return null;
}

export function FinalSettlementFormSections() {
  const { t } = useTranslation();
  const { register, control } = useFormContext<FinalSettlementFormValues>();

  const totalMonths = useWatch({ name: 'totalMonths' }) as number;
  const dailyRate = useWatch({ name: 'dailyRate' }) as number;
  const severanceEligible = useWatch({ name: 'severanceEligible' }) as boolean;
  const severancePay = useWatch({ name: 'severancePay' }) as number;
  const vacationDaysAccrued = useWatch({ name: 'vacationDaysAccrued' }) as number;
  const unusedVacationDays = useWatch({ name: 'unusedVacationDays' }) as number;
  const vacationPayout = useWatch({ name: 'vacationPayout' }) as number;
  const recuperationDaysEntitled = useWatch({ name: 'recuperationDaysEntitled' }) as number;
  const recuperationPayout = useWatch({ name: 'recuperationPayout' }) as number;
  const noticePeriodDays = useWatch({ name: 'noticePeriodDays' }) as number;
  const noticeActuallyGiven = useWatch({ name: 'noticeActuallyGiven' }) as boolean;
  const noticePeriodPay = useWatch({ name: 'noticePeriodPay' }) as number;
  const totalGross = useWatch({ name: 'totalGross' }) as number;
  const deductions = useWatch({ name: 'deductions' }) as FinalSettlementFormValues['deductions'];
  const netTotal = useWatch({ name: 'netTotal' }) as number;

  return (
    <div className="space-y-6">
      <RecalculateEffect />

      {/* Employment Period */}
      <FormSection title={t('finalSettlement.sections.employmentPeriod')}>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-1">
            <Label>{t('finalSettlement.fields.employmentStartDate')}</Label>
            <Input type="date" {...register('employmentStartDate')} />
          </div>
          <div className="space-y-1">
            <Label>{t('finalSettlement.fields.employmentEndDate')}</Label>
            <Input type="date" {...register('employmentEndDate')} />
          </div>
          <div className="space-y-1">
            <Label>{t('finalSettlement.fields.terminationReason')}</Label>
            <Controller
              name="terminationReason"
              control={control}
              render={({ field }) => (
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="dismissal">{t('finalSettlement.fields.dismissal')}</SelectItem>
                    <SelectItem value="resignation">{t('finalSettlement.fields.resignation')}</SelectItem>
                    <SelectItem value="mutual">{t('finalSettlement.fields.mutual')}</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
          </div>
          <ReadOnlyField label="חודשי העסקה" value={`${totalMonths || 0} חודשים`} />
        </div>
      </FormSection>

      {/* Last Salary */}
      <FormSection title={t('finalSettlement.sections.lastSalary')}>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-1">
            <Label>{t('finalSettlement.fields.lastMonthlySalary')}</Label>
            <Input
              type="number"
              min={0}
              step={0.01}
              {...register('lastMonthlySalary', { valueAsNumber: true })}
            />
          </div>
          <ReadOnlyField label="תעריף יומי" value={dailyRate || 0} currency />
        </div>
      </FormSection>

      {/* Severance */}
      <FormSection title={t('finalSettlement.sections.severance')}>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-1">
            <Label>{t('finalSettlement.fields.severanceEligible')}</Label>
            <div className="pt-1">
              <Badge variant={severanceEligible ? 'default' : 'secondary'}>
                {severanceEligible ? 'זכאי' : 'לא זכאי'}
              </Badge>
            </div>
          </div>
          <ReadOnlyField label={t('finalSettlement.fields.severancePay')} value={severancePay || 0} currency />
        </div>
      </FormSection>

      {/* Vacation */}
      <FormSection title={t('finalSettlement.sections.vacation')}>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <ReadOnlyField label={t('finalSettlement.fields.vacationDaysAccrued')} value={`${vacationDaysAccrued || 0} ימים`} />
          <div className="space-y-1">
            <Label>{t('finalSettlement.fields.vacationDaysUsed')}</Label>
            <Input
              type="number"
              min={0}
              step={0.5}
              {...register('vacationDaysUsed', { valueAsNumber: true })}
            />
          </div>
          <ReadOnlyField label={t('finalSettlement.fields.unusedVacationDays')} value={`${unusedVacationDays || 0} ימים`} />
          <ReadOnlyField label={t('finalSettlement.fields.vacationPayout')} value={vacationPayout || 0} currency />
        </div>
      </FormSection>

      {/* Recuperation */}
      <FormSection title={t('finalSettlement.sections.recuperation')}>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <ReadOnlyField label={t('finalSettlement.fields.recuperationDaysEntitled')} value={`${recuperationDaysEntitled || 0} ימים`} />
          <div className="space-y-1">
            <Label>{t('finalSettlement.fields.recuperationDaysAlreadyPaid')}</Label>
            <Input
              type="number"
              min={0}
              step={1}
              {...register('recuperationDaysAlreadyPaid', { valueAsNumber: true })}
            />
          </div>
          <ReadOnlyField label={t('finalSettlement.fields.recuperationPayout')} value={recuperationPayout || 0} currency />
        </div>
      </FormSection>

      {/* Notice Period */}
      <FormSection title={t('finalSettlement.sections.notice')}>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <ReadOnlyField label={t('finalSettlement.fields.noticePeriodDays')} value={`${noticePeriodDays || 0} ימים`} />
          <div className="space-y-1">
            <Label className="mb-2 block">{t('finalSettlement.fields.noticeActuallyGiven')}</Label>
            <Controller
              name="noticeActuallyGiven"
              control={control}
              render={({ field }) => (
                <div className="flex items-center gap-2">
                  <input
                    id="noticeActuallyGiven"
                    type="checkbox"
                    checked={field.value}
                    onChange={(e) => field.onChange(e.target.checked)}
                    className="h-4 w-4 cursor-pointer"
                  />
                  <label htmlFor="noticeActuallyGiven" className="text-sm cursor-pointer">
                    ניתנה הודעה מוקדמת בפועל
                  </label>
                </div>
              )}
            />
          </div>
          <ReadOnlyField
            label={t('finalSettlement.fields.noticePeriodPay')}
            value={noticeActuallyGiven ? '—' : noticePeriodPay || 0}
            currency={!noticeActuallyGiven}
          />
        </div>
      </FormSection>

      {/* Extras */}
      <FormSection title={t('finalSettlement.sections.extras')}>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-1">
            <Label>{t('finalSettlement.fields.unpaidWages')}</Label>
            <Input
              type="number"
              min={0}
              step={0.01}
              {...register('unpaidWages', { valueAsNumber: true })}
            />
          </div>
          <div className="space-y-1">
            <Label>{t('finalSettlement.fields.otherAdditions')}</Label>
            <Input
              type="number"
              min={0}
              step={0.01}
              {...register('otherAdditions', { valueAsNumber: true })}
            />
          </div>
        </div>
      </FormSection>

      {/* Deductions */}
      <FormSection title={t('finalSettlement.sections.deductions')}>
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <ReadOnlyField label={t('payslip.deductions.incomeTax')} value={deductions?.incomeTax || 0} currency />
            <ReadOnlyField label={t('payslip.deductions.nationalInsurance')} value={deductions?.nationalInsurance || 0} currency />
            <ReadOnlyField label={t('payslip.deductions.healthInsurance')} value={deductions?.healthInsurance || 0} currency />
            <div className="space-y-1">
              <Label>{t('payslip.deductions.otherDeductions')}</Label>
              <Input
                type="number"
                min={0}
                step={0.01}
                {...register('deductions.otherDeductions', { valueAsNumber: true })}
              />
            </div>
          </div>
        </div>
      </FormSection>

      {/* Net Total Summary */}
      <Card className="border-2 border-primary/30 bg-primary/5">
        <CardContent className="pt-6">
          <div className="space-y-3">
            <div className="flex justify-between text-base">
              <span>{t('finalSettlement.fields.totalGross')}</span>
              <span className="font-semibold">{formatCurrency(totalGross || 0)}</span>
            </div>
            <div className="flex justify-between text-base text-destructive">
              <span>{t('payslip.deductions.title')}</span>
              <span>
                -{formatCurrency(
                  (deductions?.incomeTax || 0) +
                  (deductions?.nationalInsurance || 0) +
                  (deductions?.healthInsurance || 0) +
                  (deductions?.otherDeductions || 0)
                )}
              </span>
            </div>
            <div className="border-t pt-3 flex justify-between text-xl font-bold">
              <span>{t('finalSettlement.fields.netTotal')}</span>
              <span className="text-primary">{formatCurrency(netTotal || 0)}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
