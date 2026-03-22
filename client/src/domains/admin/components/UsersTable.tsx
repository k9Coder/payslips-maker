import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ChevronLeft, Users } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PageLoading } from '@/shared/components/LoadingSpinner';
import { useAdminUsers } from '../hooks/useAdminUsers';
import { formatDate } from '@/lib/utils';

export function UsersTable() {
  const { t } = useTranslation();
  const [page, setPage] = useState(1);
  const { data, isLoading } = useAdminUsers(page);

  if (isLoading) return <PageLoading />;

  const users = data?.data ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.ceil(total / (data?.limit ?? 20));

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-muted-foreground">
        <Users className="h-5 w-5" />
        <span>{total} משתמשים</span>
      </div>

      {users.length === 0 ? (
        <p className="text-center text-muted-foreground py-8">{t('admin.users.noUsers')}</p>
      ) : (
        <>
          <div className="rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('admin.users.fullName')}</TableHead>
                  <TableHead>{t('admin.users.email')}</TableHead>
                  <TableHead className="hidden sm:table-cell">{t('admin.users.phone')}</TableHead>
                  <TableHead>{t('admin.users.formCount')}</TableHead>
                  <TableHead className="hidden md:table-cell">{t('admin.users.joinedAt')}</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user._id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        {user.fullName}
                        {user.isAdmin && (
                          <Badge variant="secondary" className="text-xs">מנהל</Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{user.email}</TableCell>
                    <TableCell className="hidden sm:table-cell text-muted-foreground">
                      {user.phone ?? '-'}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{user.formCount}</Badge>
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-muted-foreground">
                      {formatDate(user.createdAt)}
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm" asChild>
                        <Link to={`/admin/users/${user._id}`} className="flex items-center gap-1">
                          {t('admin.users.viewForms')}
                          <ChevronLeft className="h-4 w-4" />
                        </Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-3">
              <Button
                variant="outline"
                disabled={page === 1}
                onClick={() => setPage((p) => p - 1)}
              >
                הקודם
              </Button>
              <span className="text-sm text-muted-foreground">
                {t('common.page')} {page} {t('common.of')} {totalPages}
              </span>
              <Button
                variant="outline"
                disabled={page === totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                הבא
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
