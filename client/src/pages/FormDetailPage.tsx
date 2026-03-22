import { useState, lazy, Suspense } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { ChevronRight, FileText, Pencil } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PageLoading } from '@/shared/components/LoadingSpinner';
import { useApiClient } from '@/lib/useApiClient';
import type { ApiResponse, IForm } from '@payslips-maker/shared';

const PayslipForm = lazy(() =>
  import('@/domains/payslip/components/PayslipForm').then((m) => ({ default: m.PayslipForm }))
);
const PayslipPreview = lazy(() =>
  import('@/domains/payslip/components/PayslipPreview').then((m) => ({ default: m.PayslipPreview }))
);

export function FormDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { t } = useTranslation();
  const { get } = useApiClient();
  const [showPdf, setShowPdf] = useState(false);

  const { data: form, isLoading } = useQuery({
    queryKey: ['form', id, 'detail'],
    queryFn: () => get<ApiResponse<IForm>>(`/api/forms/${id}`),
    enabled: !!id,
    select: (res) => res.data,
  });

  if (isLoading) return <PageLoading />;

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-muted-foreground">
        <Link to="/dashboard" className="hover:text-foreground">{t('nav.dashboard')}</Link>
        <ChevronRight className="h-4 w-4" />
        <span className="text-foreground">
          {form ? `${form.employeeInfo.fullName} - ${form.period.month}/${form.period.year}` : '...'}
        </span>
      </nav>

      {/* Header with toggle */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">{t('payslip.editTitle')}</h1>
        <Button
          variant={showPdf ? 'outline' : 'default'}
          onClick={() => setShowPdf((v) => !v)}
          className="flex items-center gap-2"
        >
          {showPdf ? (
            <>
              <Pencil className="h-4 w-4" />
              {t('dashboard.edit')}
            </>
          ) : (
            <>
              <FileText className="h-4 w-4" />
              {t('payslip.generatePdf')}
            </>
          )}
        </Button>
      </div>

      {/* Form or PDF view */}
      <Suspense fallback={<PageLoading />}>
        {showPdf && form ? (
          <PayslipPreview form={form} />
        ) : (
          <PayslipForm
            formId={id}
            onPdfRequested={() => setShowPdf(true)}
          />
        )}
      </Suspense>
    </div>
  );
}
