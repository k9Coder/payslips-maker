import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ChevronRight } from 'lucide-react';
import { lazy, Suspense, useEffect } from 'react';
import { PageLoading } from '@/shared/components/LoadingSpinner';
import type { FormType } from '@payslips-maker/shared';

const FormContainer = lazy(() =>
  import('@/domains/forms/components/FormContainer').then((m) => ({ default: m.FormContainer }))
);

const VALID_FORM_TYPES: FormType[] = ['payslip', 'final_settlement'];

export function NewFormPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const employeeId = searchParams.get('employeeId') ?? '';
  const formTypeParam = searchParams.get('formType') ?? 'payslip';
  const formType = VALID_FORM_TYPES.includes(formTypeParam as FormType)
    ? (formTypeParam as FormType)
    : 'payslip';

  // Redirect to employees page if no employee selected
  useEffect(() => {
    if (!employeeId) {
      navigate('/employees', { replace: true });
    }
  }, [employeeId, navigate]);

  if (!employeeId) return <PageLoading />;

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-muted-foreground">
        <Link to="/employees" className="hover:text-foreground">
          עובדים
        </Link>
        <ChevronRight className="h-4 w-4" />
        <span className="text-foreground">{t('payslip.newTitle')}</span>
      </nav>

      <h1 className="text-3xl font-bold">{t('payslip.newTitle')}</h1>

      <Suspense fallback={<PageLoading />}>
        <FormContainer formType={formType} employeeId={employeeId} />
      </Suspense>
    </div>
  );
}
