import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Users, FileText } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAdminUsers } from '@/domains/admin/hooks/useAdminUsers';
import { useAdminForms } from '@/domains/admin/hooks/useAdminForms';

export function AdminDashboardPage() {
  const { t } = useTranslation();
  const { data: usersData } = useAdminUsers(1, 1);
  const { data: formsData } = useAdminForms({ limit: 1 });

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">{t('admin.title')}</h1>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row-reverse items-center justify-between pb-2">
            <Users className="h-6 w-6 text-muted-foreground" />
            <CardTitle className="text-lg">{t('admin.users.title')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold">{usersData?.total ?? '...'}</div>
            <p className="mt-1 text-muted-foreground">משתמשים רשומים</p>
            <Button className="mt-4 w-full" asChild>
              <Link to="/admin/users">{t('admin.users.title')}</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row-reverse items-center justify-between pb-2">
            <FileText className="h-6 w-6 text-muted-foreground" />
            <CardTitle className="text-lg">{t('admin.forms.title')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold">{formsData?.total ?? '...'}</div>
            <p className="mt-1 text-muted-foreground">תלושי שכר</p>
            <Button className="mt-4 w-full" variant="outline" asChild>
              <Link to="/admin/forms">{t('admin.forms.title')}</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
