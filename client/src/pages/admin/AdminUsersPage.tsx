import { useTranslation } from 'react-i18next';
import { UsersTable } from '@/domains/admin/components/UsersTable';

export function AdminUsersPage() {
  const { t } = useTranslation();
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">{t('admin.users.title')}</h1>
      <UsersTable />
    </div>
  );
}
