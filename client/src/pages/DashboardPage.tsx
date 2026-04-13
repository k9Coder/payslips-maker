import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Plus, FileText, Copy, Loader2, ChevronDown, ChevronUp, Clock, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PageLoading } from '@/shared/components/LoadingSpinner';
import { useApiClient } from '@/lib/useApiClient';
import { formatCurrency, formatDate, formatPeriod } from '@/lib/utils';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { SubscribedDashboard } from '@/domains/archive/components/SubscribedDashboard';
import type { ApiResponse, FormListItem, IForm } from '@payslips-maker/shared';
import { useResolveMultiLang } from '@/hooks/useResolveMultiLang';

export function DashboardPage() {
  const { data: user, isLoading: isUserLoading } = useCurrentUser();
  if (isUserLoading) return <PageLoading />;
  if (user?.hasSubscription) return <SubscribedDashboard />;
  return <BasicDashboard />;
}

function FormTypeBadge({ formType }: { formType: string }) {
  if (formType === 'final_settlement') {
    return (
      <Badge className="text-xs bg-orange-100 text-orange-800 border-orange-200 hover:bg-orange-100">
        גמר חשבון
      </Badge>
    );
  }
  return (
    <Badge className="text-xs bg-teal-100 text-teal-800 border-teal-200 hover:bg-teal-100">
      תלוש שכר
    </Badge>
  );
}

interface EmployeeAccordionProps {
  employeeId: string;
  employeeName: string; // already resolved string
  forms: FormListItem[];
  defaultOpen: boolean;
  atLimit: boolean;
  onDuplicate: (e: React.MouseEvent, formId: string) => void;
  duplicatingId: string | null;
  navigate: ReturnType<typeof useNavigate>;
  p: (path: string) => string;
}

function EmployeeAccordion({
  employeeId,
  employeeName,
  forms,
  defaultOpen,
  atLimit,
  onDuplicate,
  duplicatingId,
  navigate,
  p,
}: EmployeeAccordionProps) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div>
      <div
        role="button"
        tabIndex={0}
        onClick={() => setOpen((v) => !v)}
        onKeyDown={(e) => e.key === 'Enter' && setOpen((v) => !v)}
        className="flex min-h-[52px] cursor-pointer items-center justify-between rounded-lg border bg-card px-4 py-3 transition-colors hover:bg-accent"
      >
        <div className="flex items-center gap-3">
          {open ? (
            <ChevronUp className="h-4 w-4 text-muted-foreground" />
          ) : (
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          )}
          <span className="font-semibold">{employeeName}</span>
          <span className="text-sm text-muted-foreground">
            {forms.length} {forms.length === 1 ? 'טופס' : 'טפסים'}
          </span>
        </div>
        {!atLimit && (
          <Button
            size="sm"
            variant="outline"
            onClick={(e) => {
              e.stopPropagation();
              navigate(`${p('/forms/new')}?employeeId=${employeeId}&formType=payslip`);
            }}
          >
            <Plus className="h-4 w-4 me-1" />
            תלוש חדש
          </Button>
        )}
      </div>

      {open && (
        <div className="ms-4 border-s ps-4 space-y-1 pb-2">
          {forms.map((form) => (
            <div
              key={form._id}
              className="flex min-h-[48px] items-center justify-between rounded-md border bg-background px-3 py-2 text-sm transition-colors hover:bg-muted/50"
            >
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <FormTypeBadge formType={form.formType} />
                <span className="font-medium shrink-0">
                  {formatPeriod(form.period.month, form.period.year)}
                </span>
                <span className="text-muted-foreground hidden sm:inline shrink-0">
                  עודכן {formatDate(form.updatedAt)}
                </span>
              </div>
              <div className="flex items-center gap-3 shrink-0 ms-3">
                <span className="font-semibold text-primary">
                  {formatCurrency(form.netSalary)} נטו
                </span>
                <button
                  onClick={(e) => onDuplicate(e, form._id)}
                  disabled={duplicatingId === form._id}
                  title="שכפל"
                  className="flex h-9 w-9 items-center justify-center rounded-md border text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-50"
                >
                  {duplicatingId === form._id ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </button>
                <Link
                  to={p(`/forms/${form._id}`)}
                  className="flex h-9 w-9 items-center justify-center rounded-md border bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                  title="פתח"
                >
                  <ExternalLink className="h-4 w-4" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function BasicDashboard() {
  const { t } = useTranslation();
  const { get } = useApiClient();
  const resolve = useResolveMultiLang();
  const navigate = useNavigate();
  const { userId } = useParams<{ userId?: string }>();
  const p = (path: string) => (userId ? `/${userId}${path}` : path);
  const [duplicatingId, setDuplicatingId] = useState<string | null>(null);

  const handleDuplicate = async (e: React.MouseEvent, formId: string) => {
    e.preventDefault();
    e.stopPropagation();
    setDuplicatingId(formId);
    try {
      const res = await get<ApiResponse<IForm>>(`/api/forms/${formId}`);
      navigate(`${p('/forms/new')}?employeeId=${res.data.employeeId}&formType=${res.data.formType}`, {
        state: { copyData: res.data },
      });
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

  const recent = useMemo(() => {
    if (!forms || forms.length === 0) return [];
    return [...forms]
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
      .slice(0, 3);
  }, [forms]);

  const grouped = useMemo(() => {
    if (!forms) return [];
    const map = new Map<string, { employeeId: string; employeeName: string; forms: FormListItem[] }>();
    for (const form of forms) {
      if (!map.has(form.employeeId)) {
        map.set(form.employeeId, { employeeId: form.employeeId, employeeName: resolve(form.employeeName), forms: [] });
      }
      map.get(form.employeeId)!.forms.push(form);
    }
    for (const group of map.values()) {
      group.forms.sort((a, b) => b.period.year - a.period.year || b.period.month - a.period.month);
    }
    return Array.from(map.values());
  }, [forms]);

  if (isLoading) return <PageLoading />;

  return (
    <div className="space-y-6">
      {/* Limit warning */}
      {atLimit && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          הגעת למגבלת 10 טפסים. שדרג מנוי לגישה מלאה ולניהול מספר עובדים.
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">{t('dashboard.title')}</h1>
        <div className="flex items-center gap-3">
          {forms && forms.length > 0 && (
            <span className="text-sm text-muted-foreground">{forms.length}/10 טפסים</span>
          )}
          <Button
            size="lg"
            asChild={!atLimit}
            disabled={atLimit}
            title={atLimit ? 'מחק טופס קיים כדי להוסיף חדש (מקסימום 10)' : undefined}
          >
            {atLimit ? (
              <span className="flex items-center gap-2">
                <Plus className="h-5 w-5" />
                {t('dashboard.newForm')}
              </span>
            ) : (
              <Link to={p('/employees')} className="flex items-center gap-2">
                <Plus className="h-5 w-5" />
                {t('dashboard.newForm')}
              </Link>
            )}
          </Button>
        </div>
      </div>

      {/* Empty state */}
      {!forms || forms.length === 0 ? (
        <div className="flex min-h-[300px] flex-col items-center justify-center gap-4 rounded-lg border-2 border-dashed p-8 text-center">
          <FileText className="h-12 w-12 text-muted-foreground" />
          <div>
            <h3 className="text-xl font-medium">{t('dashboard.noForms')}</h3>
            <p className="mt-1 text-muted-foreground">{t('dashboard.noFormsDesc')}</p>
          </div>
          <Button asChild>
            <Link to={p('/employees')}>{t('dashboard.newForm')}</Link>
          </Button>
        </div>
      ) : (
        <>
          {/* Recent activity */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                פעילות אחרונה
              </h2>
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              {recent.map((form) => (
                <Link
                  key={form._id}
                  to={p(`/forms/${form._id}`)}
                  className="flex flex-col gap-2 rounded-lg border bg-card p-4 transition-shadow hover:shadow-md"
                >
                  <div className="flex items-center justify-between">
                    <FormTypeBadge formType={form.formType} />
                    <span className="text-xs text-muted-foreground">{formatDate(form.updatedAt)}</span>
                  </div>
                  <span className="font-semibold">{resolve(form.employeeName)}</span>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      {formatPeriod(form.period.month, form.period.year)}
                    </span>
                    <span className="font-bold text-primary">{formatCurrency(form.netSalary)}</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* All forms grouped by employee */}
          <div className="space-y-3">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              כל הטפסים
            </h2>
            <div className="space-y-2">
              {grouped.map(({ employeeId, employeeName, forms: empForms }, index) => (
                <EmployeeAccordion
                  key={employeeId}
                  employeeId={employeeId}
                  employeeName={employeeName}
                  forms={empForms}
                  defaultOpen={index === 0}
                  atLimit={atLimit}
                  onDuplicate={handleDuplicate}
                  duplicatingId={duplicatingId}
                  navigate={navigate}
                  p={p}
                />
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
