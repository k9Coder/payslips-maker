import { useQuery } from '@tanstack/react-query';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ChevronRight, Mail, Phone, FileText } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { PageLoading } from '@/shared/components/LoadingSpinner';
import { useApiClient } from '@/lib/useApiClient';
import { formatCurrency, formatDate, formatPeriod } from '@/lib/utils';
import type { IUser, FormListItem } from '@payslips-maker/shared';

export function UserDetail() {
  const { id } = useParams<{ id: string }>();
  const { t } = useTranslation();
  const { get } = useApiClient();

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'user', id],
    queryFn: () =>
      get<{ success: boolean; data: { user: IUser; forms: FormListItem[] } }>(`/api/admin/users/${id}`),
    enabled: !!id,
    select: (res) => res.data,
  });

  if (isLoading) return <PageLoading />;
  if (!data) return <p className="text-center text-muted-foreground">משתמש לא נמצא</p>;

  const { user, forms } = data;

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
            {user.isAdmin && <Badge variant="secondary">מנהל</Badge>}
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
            {user.employerName && (
              <div className="text-base">
                <span className="text-muted-foreground">מעסיק: </span>
                <span>{user.employerName}</span>
              </div>
            )}
            <div className="text-base text-muted-foreground">
              הצטרף: {formatDate(user.createdAt)}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Forms */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-muted-foreground" />
          <h2 className="text-xl font-semibold">תלושי שכר ({forms.length})</h2>
        </div>

        {forms.length === 0 ? (
          <p className="text-muted-foreground">{t('dashboard.noForms')}</p>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {forms.map((form) => (
              <Card key={form._id} className="p-4">
                <Badge variant="secondary" className="mb-2">
                  {formatPeriod(form.period.month, form.period.year)}
                </Badge>
                <p className="font-medium">{form.employeeName}</p>
                <div className="mt-2 flex justify-between text-sm">
                  <span className="text-muted-foreground">ברוטו:</span>
                  <span>{formatCurrency(form.grossSalary)}</span>
                </div>
                <div className="flex justify-between text-sm font-semibold text-primary">
                  <span>נטו:</span>
                  <span>{formatCurrency(form.netSalary)}</span>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">{formatDate(form.updatedAt)}</p>
              </Card>
            ))}
          </div>
        )}
      </div>

      <Button variant="outline" asChild>
        <Link to="/admin/users">חזרה לרשימת המשתמשים</Link>
      </Button>
    </div>
  );
}
