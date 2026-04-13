import { lazy, Suspense } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { ChevronRight } from 'lucide-react';
import { PageLoading } from '@/shared/components/LoadingSpinner';
import { useApiClient } from '@/lib/useApiClient';
import { useResolveMultiLang } from '@/hooks/useResolveMultiLang';
import type { ApiResponse, IForm } from '@payslips-maker/shared';

const FormContainer = lazy(() =>
  import('@/domains/forms/components/FormContainer').then((m) => ({ default: m.FormContainer }))
);

export function FormDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { t } = useTranslation();
  const { get } = useApiClient();
  const resolve = useResolveMultiLang();

  // Load form metadata for breadcrumb + to resolve formType/employeeId
  const { data: form, isLoading } = useQuery({
    queryKey: ['form', id, 'detail'],
    queryFn: () => get<ApiResponse<IForm>>(`/api/forms/${id}`),
    enabled: !!id,
    select: (res) => res.data,
  });

  if (isLoading) return <PageLoading />;
  if (!form) return <p className="text-center text-muted-foreground">טופס לא נמצא</p>;

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-muted-foreground">
        <Link to="/dashboard" className="hover:text-foreground">{t('nav.dashboard')}</Link>
        <ChevronRight className="h-4 w-4" />
        <span className="text-foreground">
          {resolve(form.employeeInfo.fullName)} — {form.period.month}/{form.period.year}
        </span>
      </nav>

      <h1 className="text-3xl font-bold">{t('payslip.editTitle')}</h1>

      <Suspense fallback={<PageLoading />}>
        <FormContainer
          formType={form.formType}
          employeeId={form.employeeId}
          formId={id}
        />
      </Suspense>
    </div>
  );
}
