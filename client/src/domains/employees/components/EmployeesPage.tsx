import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, Users, Mail, Pencil, Trash2, Lock, ChevronDown, ChevronUp, FileText, Building2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { PageLoading } from '@/shared/components/LoadingSpinner';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { useResolveMultiLang } from '@/hooks/useResolveMultiLang';
import { useEmployees, useDeleteEmployee } from '../hooks/useEmployees';
import { useCompanies } from '@/domains/companies/hooks/useCompanies';
import type { ICompany, IEmployee } from '@payslips-maker/shared';

const NATIONALITY_LABELS: Record<string, string> = {
  philippines: 'פיליפינים',
  thailand: 'תאילנד',
  india: 'הודו',
  nigeria: 'ניגריה',
  'sri lanka': 'סרי לנקה',
  moldova: 'מולדובה',
  ukraine: 'אוקראינה',
};

function nationalityLabel(nat: string) {
  return NATIONALITY_LABELS[nat.toLowerCase()] ?? nat;
}

function CompanySection({
  company,
  employees,
  defaultOpen,
  openFormMenu,
  setOpenFormMenu,
  setDeleteTarget,
}: {
  company: ICompany;
  employees: IEmployee[];
  defaultOpen: boolean;
  openFormMenu: string | null;
  setOpenFormMenu: (id: string | null) => void;
  setDeleteTarget: (emp: IEmployee | null) => void;
}) {
  const navigate = useNavigate();
  const resolve = useResolveMultiLang();
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="space-y-2">
      {/* Company header */}
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
          <span className="font-bold text-lg">{resolve(company.name)}</span>
        </div>
        <span className="text-sm text-muted-foreground">
          {employees.length} {employees.length === 1 ? 'עובד' : 'עובדים'}
        </span>
      </div>

      {/* Employees under this company */}
      {open && (
        <div className="ms-4 border-s ps-4 space-y-3 pb-2">
          {employees.length === 0 ? (
            <p className="py-3 text-sm text-muted-foreground">אין עובדים בחברה זו</p>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {employees.map((emp) => (
                <Card key={emp._id} className="transition-shadow hover:shadow-md">
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <h3 className="text-lg font-semibold">{resolve(emp.fullName)}</h3>
                        <Badge variant="secondary" className="text-xs">
                          {nationalityLabel(emp.nationality)}
                        </Badge>
                      </div>
                    </div>

                    <div className="mt-3 space-y-1 text-sm text-muted-foreground">
                      <p>דרכון: {emp.passportNumber}</p>
                      <p>התחלה: {new Date(emp.startDate).toLocaleDateString('he-IL')}</p>
                      {emp.email && (
                        <p className="flex items-center gap-1">
                          <Mail className="h-3.5 w-3.5" />
                          {emp.email}
                        </p>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="mt-4 flex items-center justify-end gap-2 border-t pt-3">
                      {/* Create form dropdown */}
                      <div className="relative">
                        <Button
                          variant="default"
                          size="sm"
                          className="gap-1"
                          onClick={() => setOpenFormMenu(openFormMenu === emp._id ? null : emp._id)}
                        >
                          <FileText className="h-4 w-4" />
                          צור טופס
                          <ChevronDown className="h-3.5 w-3.5" />
                        </Button>
                        {openFormMenu === emp._id && (
                          <div className="absolute end-0 top-full z-10 mt-1 w-44 rounded-lg border bg-background shadow-md">
                            <button
                              className="w-full px-4 py-2.5 text-right text-sm hover:bg-muted"
                              onClick={() => {
                                setOpenFormMenu(null);
                                navigate(`/forms/new?employeeId=${emp._id}&formType=payslip`);
                              }}
                            >
                              תלוש שכר
                            </button>
                            <button
                              className="w-full px-4 py-2.5 text-right text-sm hover:bg-muted"
                              onClick={() => {
                                setOpenFormMenu(null);
                                navigate(`/forms/new?employeeId=${emp._id}&formType=final_settlement`);
                              }}
                            >
                              גמר חשבון
                            </button>
                          </div>
                        )}
                      </div>

                      <Button variant="ghost" size="sm" asChild>
                        <Link to={`/employees/${emp._id}/edit`}>
                          <Pencil className="h-4 w-4" />
                        </Link>
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive hover:text-destructive"
                        onClick={() => setDeleteTarget(emp)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export function EmployeesPage() {
  const { data: currentUser } = useCurrentUser();
  const { data: employees, isLoading: empLoading } = useEmployees();
  const { data: companies, isLoading: compLoading } = useCompanies();
  const deleteEmployee = useDeleteEmployee();
  const resolve = useResolveMultiLang();
  const [deleteTarget, setDeleteTarget] = useState<IEmployee | null>(null);
  const [openFormMenu, setOpenFormMenu] = useState<string | null>(null);

  const atLimit = !currentUser?.hasSubscription && (employees?.length ?? 0) >= 1;

  const grouped = useMemo(() => {
    if (!companies || !employees) return [];
    return companies.map((company) => ({
      company,
      employees: employees.filter((e) => e.companyId === company._id),
    }));
  }, [companies, employees]);

  if (empLoading || compLoading) return <PageLoading />;

  const allEmployees = employees ?? [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users className="h-6 w-6 text-primary" />
          <h1 className="text-3xl font-bold">העובדים שלי</h1>
        </div>
        <Button
          size="lg"
          asChild={!atLimit}
          disabled={atLimit}
          title={atLimit ? 'שדרג מנוי כדי להוסיף עובדים נוספים' : undefined}
        >
          {atLimit ? (
            <span className="flex items-center gap-2">
              <Plus className="h-5 w-5" />
              הוסף עובד
            </span>
          ) : (
            <Link to="/employees/new" className="flex items-center gap-2">
              <Plus className="h-5 w-5" />
              הוסף עובד
            </Link>
          )}
        </Button>
      </div>

      {/* Limit warning */}
      {atLimit && (
        <div className="flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 p-4 text-amber-800">
          <Lock className="mt-0.5 h-5 w-5 shrink-0" />
          <div>
            <p className="font-medium">הגעת למגבלת העובדים (1).</p>
            <p className="text-sm">שדרג מנוי כדי להוסיף עובדים נוספים.</p>
          </div>
        </div>
      )}

      {/* No companies prompt */}
      {(companies ?? []).length === 0 && (
        <div className="flex min-h-[200px] flex-col items-center justify-center gap-4 rounded-lg border-2 border-dashed p-8 text-center">
          <Building2 className="h-12 w-12 text-muted-foreground" />
          <div>
            <h3 className="text-xl font-medium">אין חברות עדיין</h3>
            <p className="mt-1 text-muted-foreground">הוסף חברה לפני שתוסיף עובדים</p>
          </div>
          <Button asChild>
            <Link to="/companies/new">הוסף חברה</Link>
          </Button>
        </div>
      )}

      {/* Grouped by company - collapsible */}
      <div className="space-y-4">
        {grouped.map(({ company, employees: companyEmployees }, index) => (
          <CompanySection
            key={company._id}
            company={company}
            employees={companyEmployees}
            defaultOpen={index === 0}
            openFormMenu={openFormMenu}
            setOpenFormMenu={setOpenFormMenu}
            setDeleteTarget={setDeleteTarget}
          />
        ))}
      </div>

      {/* Empty state when companies exist but no employees at all */}
      {(companies ?? []).length > 0 && allEmployees.length === 0 && (
        <div className="flex min-h-[300px] flex-col items-center justify-center gap-4 rounded-lg border-2 border-dashed p-8 text-center">
          <Users className="h-12 w-12 text-muted-foreground" />
          <div>
            <h3 className="text-xl font-medium">אין עובדים עדיין</h3>
            <p className="mt-1 text-muted-foreground">הוסף את העובד הראשון שלך כדי להתחיל ליצור תלושי שכר</p>
          </div>
          <Button asChild>
            <Link to="/employees/new">הוסף עובד</Link>
          </Button>
        </div>
      )}

      {/* Delete confirmation dialog */}
      <Dialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>מחיקת עובד</DialogTitle>
          </DialogHeader>
          <p className="text-muted-foreground">
            האם למחוק את <span className="font-semibold text-foreground">{resolve(deleteTarget?.fullName)}</span>?{' '}
            הטפסים הקיימים לעובד זה יישמרו.
          </p>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>
              ביטול
            </Button>
            <Button
              variant="destructive"
              disabled={deleteEmployee.isPending}
              onClick={() => {
                if (!deleteTarget) return;
                deleteEmployee.mutate(deleteTarget._id, {
                  onSuccess: () => setDeleteTarget(null),
                });
              }}
            >
              מחק
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
