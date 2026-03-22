import { useTranslation } from 'react-i18next';
import { FormsTable } from '@/domains/admin/components/FormsTable';

export function AdminFormsPage() {
  const { t } = useTranslation();
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">{t('admin.forms.title')}</h1>
      <FormsTable />
    </div>
  );
}
