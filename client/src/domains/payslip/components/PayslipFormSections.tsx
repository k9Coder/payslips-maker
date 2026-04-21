import { useFormContext } from 'react-hook-form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PeriodSection } from './sections/PeriodSection';
import { EmployeeSection } from './sections/EmployeeSection';
import { WorkDetailsSection } from './sections/WorkDetailsSection';
import { PaySection } from './sections/PaySection';
import { DeductionsSection } from './sections/DeductionsSection';
import { EmployerContributionsSection } from './sections/EmployerContributionsSection';
import { PaymentInfoSection } from './sections/PaymentInfoSection';
import { VacationSickAccountSection } from './sections/VacationSickAccountSection';
import type { PayslipFormValues } from '../payslip.schema';

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

function NetPaySummary() {
  const { watch } = useFormContext<PayslipFormValues>();
  const netSalary = watch('netSalary') ?? 0;
  const pocketMoneyPaid = watch('payCalculation.pocketMoneyPaid') ?? 0;
  const bankTransfer = watch('bankTransfer') ?? 0;

  return (
    <div className="rounded-xl bg-[#1B2A4A] p-4 text-white space-y-2">
      <div className="flex justify-between text-sm opacity-80">
        <span>שכר נטו</span>
        <span>₪{netSalary.toFixed(2)}</span>
      </div>
      <div className="flex justify-between text-sm opacity-80">
        <span>דמי כיס ששולמו</span>
        <span>− ₪{pocketMoneyPaid.toFixed(2)}</span>
      </div>
      <div className="flex justify-between font-bold text-lg border-t border-white/30 pt-2">
        <span>העברה בנקאית</span>
        <span>₪{bankTransfer.toFixed(2)}</span>
      </div>
    </div>
  );
}

export function PayslipFormSections() {
  return (
    <div className="space-y-6">
      <FormSection title="תקופה">
        <PeriodSection />
      </FormSection>

      <FormSection title="עובד / מעסיק">
        <EmployeeSection />
      </FormSection>

      <FormSection title="פירוט ימי עבודה">
        <WorkDetailsSection />
      </FormSection>

      <FormSection title="חישוב שכר">
        <PaySection />
      </FormSection>

      <FormSection title="ניכויים">
        <DeductionsSection />
      </FormSection>

      <NetPaySummary />

      <FormSection title="עלויות מעסיק (לידיעה בלבד)">
        <EmployerContributionsSection />
      </FormSection>

      <FormSection title="אמצעי תשלום">
        <PaymentInfoSection />
      </FormSection>

      <FormSection title="חשבונות חופשה ומחלה">
        <VacationSickAccountSection />
      </FormSection>
    </div>
  );
}
