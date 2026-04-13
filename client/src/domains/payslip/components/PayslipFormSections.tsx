import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PeriodSection } from './sections/PeriodSection';
import { EmployeeSection } from './sections/EmployeeSection';
import { WorkDetailsSection } from './sections/WorkDetailsSection';
import { PaySection } from './sections/PaySection';
import { DeductionsSection } from './sections/DeductionsSection';
import { EmployerContributionsSection } from './sections/EmployerContributionsSection';
import { PaymentInfoSection } from './sections/PaymentInfoSection';
import { CustomPayItemsSection } from './sections/CustomPayItemsSection';
import { VacationSickAccountSection } from './sections/VacationSickAccountSection';

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

export function PayslipFormSections() {
  const { t } = useTranslation();

  return (
    <div className="space-y-6">
      <FormSection title={t('payslip.sections.period')}>
        <PeriodSection />
      </FormSection>

      <FormSection title={`${t('payslip.sections.employee')} / ${t('payslip.sections.employer')}`}>
        <EmployeeSection />
      </FormSection>

      <FormSection title={t('payslip.sections.workDetails')}>
        <WorkDetailsSection />
      </FormSection>

      <FormSection title={t('payslip.sections.pay')}>
        <PaySection />
      </FormSection>

      <FormSection title={t('payslip.sections.deductions')}>
        <DeductionsSection />
      </FormSection>

      <FormSection title={t('payslip.sections.employerContributions')}>
        <EmployerContributionsSection />
      </FormSection>

      <FormSection title={t('payslip.sections.paymentInfo')}>
        <PaymentInfoSection />
      </FormSection>

      <FormSection title={t('payslip.sections.customPayItems')}>
        <CustomPayItemsSection />
      </FormSection>

      <FormSection title={t('payslip.sections.vacationSickAccount')}>
        <VacationSickAccountSection />
      </FormSection>
    </div>
  );
}
