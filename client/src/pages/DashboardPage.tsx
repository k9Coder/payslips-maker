import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Plus, FileText, ChevronLeft, Copy, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PageLoading } from '@/shared/components/LoadingSpinner';
import { useApiClient } from '@/lib/useApiClient';
import { formatCurrency, formatDate, formatPeriod } from '@/lib/utils';
import { toFormValues } from '@/domains/payslip/hooks/usePayslipForm';
import type { ApiResponse, FormListItem, IForm } from '@payslips-maker/shared';

export function DashboardPage() {
  const { t } = useTranslation();
  const { get } = useApiClient();
  const navigate = useNavigate();
  const [duplicatingId, setDuplicatingId] = useState<string | null>(null);

  const handleDuplicate = async (e: React.MouseEvent, formId: string) => {
    e.preventDefault();
    e.stopPropagation();
    setDuplicatingId(formId);
    try {
      const res = await get<ApiResponse<IForm>>(`/api/forms/${formId}`);
      navigate('/forms/new', { state: { copyData: toFormValues(res.data) } });
    } finally {
      setDuplicatingId(null);
    }
  };

  const { data: forms, isLoading } = useQuery({
    queryKey: ['forms'],
    queryFn: () => get<ApiResponse<FormListItem[]>>('/api/forms'),
    select: (res) => res.data,
  });

  const atLimit = (forms?.length ?? 0) >= 10;

  if (isLoading) return <PageLoading />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">{t('dashboard.title')}</h1>
        <div className="flex items-center gap-3">
          {forms && forms.length > 0 && (
            <span className="text-sm text-muted-foreground">{forms.length}/10 טפסים</span>
          )}
          <Button size="lg" asChild={!atLimit} disabled={atLimit} title={atLimit ? 'מחק טופס קיים כדי להוסיף חדש (מקסימום 10)' : undefined}>
            {atLimit ? (
              <span className="flex items-center gap-2">
                <Plus className="h-5 w-5" />
                {t('dashboard.newForm')}
              </span>
            ) : (
              <Link to="/forms/new" className="flex items-center gap-2">
                <Plus className="h-5 w-5" />
                {t('dashboard.newForm')}
              </Link>
            )}
          </Button>
        </div>
      </div>

      {/* Forms list */}
      {!forms || forms.length === 0 ? (
        <div className="flex min-h-[300px] flex-col items-center justify-center gap-4 rounded-lg border-2 border-dashed p-8 text-center">
          <FileText className="h-12 w-12 text-muted-foreground" />
          <div>
            <h3 className="text-xl font-medium">{t('dashboard.noForms')}</h3>
            <p className="mt-1 text-muted-foreground">{t('dashboard.noFormsDesc')}</p>
          </div>
          <Button asChild>
            <Link to="/forms/new">{t('dashboard.newForm')}</Link>
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {forms.map((form) => (
            <Card key={form._id} className="transition-shadow hover:shadow-md">
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <Badge variant="secondary" className="text-sm">
                      {formatPeriod(form.period.month, form.period.year)}
                    </Badge>
                    <h3 className="mt-2 text-lg font-semibold">{form.employeeName}</h3>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={(e) => handleDuplicate(e, form._id)}
                      disabled={duplicatingId === form._id}
                      title={t('payslip.duplicate')}
                      className="flex h-10 w-10 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-50"
                    >
                      {duplicatingId === form._id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </button>
                    <Link
                      to={`/forms/${form._id}`}
                      className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary transition-colors hover:bg-primary/20"
                    >
                      <ChevronLeft className="h-5 w-5" />
                    </Link>
                  </div>
                </div>

                <div className="mt-4 space-y-2 border-t pt-4">
                  <div className="flex justify-between text-base">
                    <span className="text-muted-foreground">{t('dashboard.gross')}</span>
                    <span className="font-medium">{formatCurrency(form.grossSalary)}</span>
                  </div>
                  <div className="flex justify-between text-base">
                    <span className="text-muted-foreground">{t('dashboard.net')}</span>
                    <span className="text-lg font-bold text-primary">{formatCurrency(form.netSalary)}</span>
                  </div>
                </div>

                <p className="mt-3 text-sm text-muted-foreground">
                  {t('dashboard.lastUpdated')}: {formatDate(form.updatedAt)}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
