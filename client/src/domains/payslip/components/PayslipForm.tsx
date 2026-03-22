import { FormProvider } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Save, FileText, Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { PageLoading } from '@/shared/components/LoadingSpinner';
import { usePayslipForm } from '../hooks/usePayslipForm';
import { PeriodSection } from './sections/PeriodSection';
import { EmployeeSection } from './sections/EmployeeSection';
import { WorkDetailsSection } from './sections/WorkDetailsSection';
import { PaySection } from './sections/PaySection';
import { DeductionsSection } from './sections/DeductionsSection';
import { EmployerContributionsSection } from './sections/EmployerContributionsSection';
import { PaymentInfoSection } from './sections/PaymentInfoSection';

interface PayslipFormProps {
  formId?: string;
  onPdfRequested?: () => void;
}

interface SectionProps {
  title: string;
  children: React.ReactNode;
}

function FormSection({ title, children }: SectionProps) {
  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle className="text-xl">{title}</CardTitle>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}

export function PayslipForm({ formId, onPdfRequested }: PayslipFormProps) {
  const { t } = useTranslation();
  const { form, isLoading, isSaving, onSubmit, handleDuplicate, blocker } = usePayslipForm(formId);

  if (isLoading) return <PageLoading />;

  return (
    <FormProvider {...form}>
      <form onSubmit={onSubmit} noValidate>
        <div className="space-y-6">
          {/* Period */}
          <FormSection title={t('payslip.sections.period')}>
            <PeriodSection />
          </FormSection>

          {/* Employee + Employer Info */}
          <FormSection title={`${t('payslip.sections.employee')} / ${t('payslip.sections.employer')}`}>
            <EmployeeSection />
          </FormSection>

          {/* Work Details */}
          <FormSection title={t('payslip.sections.workDetails')}>
            <WorkDetailsSection />
          </FormSection>

          {/* Pay Calculation */}
          <FormSection title={t('payslip.sections.pay')}>
            <PaySection />
          </FormSection>

          {/* Deductions */}
          <FormSection title={t('payslip.sections.deductions')}>
            <DeductionsSection />
          </FormSection>

          {/* Employer Contributions */}
          <FormSection title={t('payslip.sections.employerContributions')}>
            <EmployerContributionsSection />
          </FormSection>

          {/* Payment Info */}
          <FormSection title={t('payslip.sections.paymentInfo')}>
            <PaymentInfoSection />
          </FormSection>

          {/* Action Buttons */}
          <div className="sticky bottom-0 z-10 flex gap-3 border-t bg-background/95 p-4 backdrop-blur sm:relative sm:border-0 sm:bg-transparent sm:p-0 sm:backdrop-blur-none">
            <Button
              type="submit"
              disabled={isSaving}
              size="lg"
              className="flex-1 sm:flex-none"
            >
              <Save className="h-5 w-5 ms-2" />
              {isSaving ? t('payslip.saving') : t('payslip.save')}
            </Button>

            {formId && (
              <Button
                type="button"
                variant="outline"
                size="lg"
                onClick={handleDuplicate}
                className="flex-1 sm:flex-none"
              >
                <Copy className="h-5 w-5 ms-2" />
                {t('payslip.duplicate')}
              </Button>
            )}

            {formId && onPdfRequested && (
              <Button
                type="button"
                variant="outline"
                size="lg"
                onClick={onPdfRequested}
                className="flex-1 sm:flex-none"
              >
                <FileText className="h-5 w-5 ms-2" />
                {t('payslip.generatePdf')}
              </Button>
            )}
          </div>
        </div>
      </form>

      {/* Unsaved changes confirmation dialog */}
      <Dialog
        open={blocker.state === 'blocked'}
        onOpenChange={(open) => !open && blocker.state === 'blocked' && blocker.reset?.()}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('payslip.unsavedChanges.title')}</DialogTitle>
            <DialogDescription>{t('payslip.unsavedChanges.message')}</DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" onClick={() => blocker.reset?.()}>
              {t('payslip.unsavedChanges.stay')}
            </Button>
            <Button variant="destructive" onClick={() => blocker.proceed?.()}>
              {t('payslip.unsavedChanges.leave')}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </FormProvider>
  );
}
