import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ChevronRight, Mail, Phone, Crown, ChevronDown, ChevronUp, ExternalLink, Building2, UserCog } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { PageLoading } from '@/shared/components/LoadingSpinner';
import { useApiClient } from '@/lib/useApiClient';
import { formatCurrency, formatDate, formatPeriod } from '@/lib/utils';
import type { IUser, ICompany, IEmployee, FormListItem, ApiResponse } from '@payslips-maker/shared';
import { useResolveMultiLang } from '@/hooks/useResolveMultiLang';
import { useToggleSubscription } from '../hooks/useToggleSubscription';
import { useAdminCompanyEmployees, useAdminEmployeeArchive } from '@/domains/archive/hooks/useEmployeeArchive';

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

function AdminEmployeeSection({
  companyId,
  employee,
  defaultOpen,
  userId,
}: {
  companyId: string;
  employee: IEmployee;
  defaultOpen: boolean;
  userId: string;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const resolve = useResolveMultiLang();
  const { data: forms, isLoading } = useAdminEmployeeArchive(open ? companyId : '', open ? employee._id : '');

  return (
    <>
      <div
        role="button"
        tabIndex={0}
        onClick={() => setOpen((v) => !v)}
        onKeyDown={(e) => e.key === 'Enter' && setOpen((v) => !v)}
        className="flex min-h-[52px] cursor-pointer items-center justify-between rounded-lg border bg-card px-4 py-3 transition-colors hover:bg-accent"
      >
        <div className="flex items-center gap-3">
          {open ? (
            <ChevronUp className="h-5 w-5 text-muted-foreground" />
          ) : (
            <ChevronDown className="h-5 w-5 text-muted-foreground" />
          )}
          <span className="font-semibold">{resolve(employee.fullName)}</span>
          <span className="text-sm text-muted-foreground">({employee.nationality})</span>
        </div>
        {forms && (
          <span className="text-sm text-muted-foreground">
            {forms.length} {forms.length === 1 ? 'טופס' : 'טפסים'}
          </span>
        )}
      </div>

      {open && (
        <div className="ms-4 border-s ps-4 space-y-1 pb-2">
          {isLoading ? (
            <p className="py-3 text-sm text-muted-foreground">טוען...</p>
          ) : !forms || forms.length === 0 ? (
            <p className="py-3 text-sm text-muted-foreground">אין טפסים</p>
          ) : (
            forms.map((form: FormListItem) => (
              <div
                key={form._id}
                className="flex min-h-[48px] items-center justify-between rounded-md border bg-background px-3 py-2 text-sm"
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <FormTypeBadge formType={form.formType} />
                  <span className="font-medium shrink-0">
                    {formatPeriod(form.period.month, form.period.year)}
                  </span>
                  <span className="text-muted-foreground hidden sm:inline shrink-0">
                    {formatDate(form.updatedAt)}
                  </span>
                </div>
                <div className="flex items-center gap-3 shrink-0 ms-3">
                  <span className="font-semibold text-primary">
                    {formatCurrency(form.netSalary)} נטו
                  </span>
                  <Link
                    to={`/forms/${form._id}`}
                    className="flex h-9 w-9 items-center justify-center rounded-md border bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                    title="פתח"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </>
  );
}

function AdminCompanySection({
  company,
  defaultOpen,
  userId,
}: {
  company: ICompany;
  defaultOpen: boolean;
  userId: string;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const resolve = useResolveMultiLang();
  const { data: employees, isLoading } = useAdminCompanyEmployees(open ? company._id : '');

  return (
    <div className="space-y-2">
      <div
        role="button"
        tabIndex={0}
        onClick={() => setOpen((v) => !v)}
        onKeyDown={(e) => e.key === 'Enter' && setOpen((v) => !v)}
        className="flex min-h-[52px] cursor-pointer items-center justify-between rounded-lg border-2 bg-muted/30 px-4 py-3 transition-colors hover:bg-muted/50"
      >
        <div className="flex items-center gap-3">
          {open ? (
            <ChevronUp className="h-5 w-5 text-muted-foreground" />
          ) : (
            <ChevronDown className="h-5 w-5 text-muted-foreground" />
          )}
          <Building2 className="h-5 w-5 text-primary" />
          <span className="font-bold">{resolve(company.name)}</span>
          {company.ein && (
            <span className="text-sm text-muted-foreground">({company.ein})</span>
          )}
        </div>
        {employees && (
          <span className="text-sm text-muted-foreground">
            {employees.length} {employees.length === 1 ? 'עובד' : 'עובדים'}
          </span>
        )}
      </div>

      {open && (
        <div className="ms-4 border-s ps-4 space-y-2 pb-2">
          {isLoading ? (
            <p className="py-3 text-sm text-muted-foreground">טוען...</p>
          ) : !employees || employees.length === 0 ? (
            <p className="py-3 text-sm text-muted-foreground">אין עובדים בחברה זו</p>
          ) : (
            employees.map((employee, index) => (
              <AdminEmployeeSection
                key={employee._id}
                companyId={company._id}
                employee={employee}
                defaultOpen={index === 0 && defaultOpen}
                userId={userId}
              />
            ))
          )}
        </div>
      )}
    </div>
  );
}

export function UserDetail() {
  const { id } = useParams<{ id: string }>();
  const { t } = useTranslation();
  const { get } = useApiClient();

  const toggleSubscription = useToggleSubscription(id!);

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'user', id],
    queryFn: () =>
      get<{ success: boolean; data: { user: IUser; forms: FormListItem[] } }>(`/api/admin/users/${id}`),
    enabled: !!id,
    select: (res) => res.data,
  });

  const { data: companies } = useQuery({
    queryKey: ['admin', 'users', id, 'companies'],
    queryFn: () =>
      get<ApiResponse<ICompany[]>>(`/api/admin/users/${id}/companies`).then((r) => r.data),
    enabled: !!id,
  });

  if (isLoading) return <PageLoading />;
  if (!data) return <p className="text-center text-muted-foreground">משתמש לא נמצא</p>;

  const { user } = data;

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-muted-foreground">
        <Link to="/admin/users" className="hover:text-foreground">{t('admin.users.title')}</Link>
        <ChevronRight className="h-4 w-4" />
        <span className="text-foreground">{user.fullName}</span>
      </nav>

      {/* User card */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <CardTitle className="text-2xl">{user.fullName}</CardTitle>
            <div className="flex items-center gap-2">
              {user.isAdmin && <Badge variant="secondary">מנהל</Badge>}
              {user.hasSubscription && <Badge variant="default">מנוי פעיל</Badge>}
              <Button variant="outline" size="sm" className="gap-1" asChild>
                <Link to={`/${user._id}/dashboard`}>
                  <UserCog className="h-4 w-4" />
                  נהל עבור משתמש
                </Link>
              </Button>
              <Button
                variant={user.hasSubscription ? 'default' : 'outline'}
                size="sm"
                className="gap-1"
                disabled={toggleSubscription.isPending}
                onClick={() => toggleSubscription.mutate(!user.hasSubscription)}
              >
                <Crown className="h-4 w-4" />
                {user.hasSubscription ? 'בטל מנוי' : 'הפעל מנוי'}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex items-center gap-2 text-base">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <span>{user.email}</span>
            </div>
            {user.phone && (
              <div className="flex items-center gap-2 text-base">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span>{user.phone}</span>
              </div>
            )}
            <div className="text-base text-muted-foreground">
              הצטרף: {formatDate(user.createdAt)}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Company → Employee → Form hierarchy */}
      <div className="space-y-3">
        <h2 className="text-xl font-semibold">
          חברות
          {companies && <span className="ms-2 text-base font-normal text-muted-foreground">({companies.length} חברות)</span>}
        </h2>

        {!companies || companies.length === 0 ? (
          <p className="text-muted-foreground">אין חברות</p>
        ) : (
          companies.map((company, index) => (
            <AdminCompanySection
              key={company._id}
              company={company}
              defaultOpen={index === 0}
              userId={id!}
            />
          ))
        )}
      </div>

      <Button variant="outline" asChild>
        <Link to="/admin/users">חזרה לרשימת המשתמשים</Link>
      </Button>
    </div>
  );
}
