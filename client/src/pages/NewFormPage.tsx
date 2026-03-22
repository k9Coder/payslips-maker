import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ChevronRight } from 'lucide-react';
import { PayslipForm } from '@/domains/payslip/components/PayslipForm';

export function NewFormPage() {
  const { t } = useTranslation();

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-muted-foreground">
        <Link to="/dashboard" className="hover:text-foreground">{t('nav.dashboard')}</Link>
        <ChevronRight className="h-4 w-4" />
        <span className="text-foreground">{t('payslip.newTitle')}</span>
      </nav>

      <h1 className="text-3xl font-bold">{t('payslip.newTitle')}</h1>

      <PayslipForm />
    </div>
  );
}
