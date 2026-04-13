import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Building2, Pencil, Trash2, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { PageLoading } from '@/shared/components/LoadingSpinner';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { useResolveMultiLang } from '@/hooks/useResolveMultiLang';
import { useCompanies, useDeleteCompany } from '../hooks/useCompanies';
import type { ICompany } from '@payslips-maker/shared';

export function CompaniesPage() {
  const { data: currentUser } = useCurrentUser();
  const { data: companies, isLoading } = useCompanies();
  const deleteCompany = useDeleteCompany();
  const resolve = useResolveMultiLang();
  const [deleteTarget, setDeleteTarget] = useState<ICompany | null>(null);

  const atLimit = !currentUser?.hasSubscription && (companies?.length ?? 0) >= 1;

  if (isLoading) return <PageLoading />;

  const list = companies ?? [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Building2 className="h-6 w-6 text-primary" />
          <h1 className="text-3xl font-bold">החברות שלי</h1>
        </div>
        <Button
          size="lg"
          asChild={!atLimit}
          disabled={atLimit}
          title={atLimit ? 'שדרג מנוי כדי להוסיף חברות נוספות' : undefined}
        >
          {atLimit ? (
            <span className="flex items-center gap-2">
              <Plus className="h-5 w-5" />
              הוסף חברה
            </span>
          ) : (
            <Link to="/companies/new" className="flex items-center gap-2">
              <Plus className="h-5 w-5" />
              הוסף חברה
            </Link>
          )}
        </Button>
      </div>

      {atLimit && (
        <div className="flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 p-4 text-amber-800">
          <Lock className="mt-0.5 h-5 w-5 shrink-0" />
          <div>
            <p className="font-medium">הגעת למגבלת החברות (1).</p>
            <p className="text-sm">שדרג מנוי כדי להוסיף חברות נוספות.</p>
          </div>
        </div>
      )}

      {list.length === 0 ? (
        <div className="flex min-h-[300px] flex-col items-center justify-center gap-4 rounded-lg border-2 border-dashed p-8 text-center">
          <Building2 className="h-12 w-12 text-muted-foreground" />
          <div>
            <h3 className="text-xl font-medium">אין חברות עדיין</h3>
            <p className="mt-1 text-muted-foreground">הוסף את החברה הראשונה שלך כדי להתחיל לנהל עובדים</p>
          </div>
          <Button asChild>
            <Link to="/companies/new">הוסף חברה</Link>
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {list.map((company) => (
            <Card key={company._id} className="transition-shadow hover:shadow-md">
              <CardContent className="p-5">
                <div className="space-y-1">
                  <h3 className="text-lg font-semibold">{resolve(company.name)}</h3>
                  {company.ein && (
                    <p className="text-sm text-muted-foreground">ח.פ / ע.מ: {company.ein}</p>
                  )}
                </div>

                <div className="mt-3 space-y-1 text-sm text-muted-foreground">
                  {company.address && <p>{company.address}</p>}
                  {company.phone && <p>{company.phone}</p>}
                </div>

                <div className="mt-4 flex items-center justify-end gap-2 border-t pt-3">
                  <Button variant="ghost" size="sm" asChild>
                    <Link to={`/companies/${company._id}/edit`}>
                      <Pencil className="h-4 w-4" />
                    </Link>
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-destructive hover:text-destructive"
                    onClick={() => setDeleteTarget(company)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>הסרת חברה</DialogTitle>
          </DialogHeader>
          <p className="text-muted-foreground">
            האם להסיר את <span className="font-semibold text-foreground">{resolve(deleteTarget?.name)}</span>?{' '}
            העובדים והטפסים הקיימים יישמרו.
          </p>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>
              ביטול
            </Button>
            <Button
              variant="destructive"
              disabled={deleteCompany.isPending}
              onClick={() => {
                if (!deleteTarget) return;
                deleteCompany.mutate(deleteTarget._id, {
                  onSuccess: () => setDeleteTarget(null),
                });
              }}
            >
              הסר
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
