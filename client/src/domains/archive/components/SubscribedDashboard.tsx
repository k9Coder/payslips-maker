import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ChevronDown, ChevronUp, Plus, FileText, Trash2, ExternalLink, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { PageLoading } from '@/shared/components/LoadingSpinner';
import { formatCurrency, formatDate, formatPeriod } from '@/lib/utils';
import { useEmployees } from '@/domains/employees/hooks/useEmployees';
import { useEmployeeArchive, useDeleteForm } from '../hooks/useEmployeeArchive';
import { toast } from '@/hooks/use-toast';
import type { IEmployee, FormListItem } from '@payslips-maker/shared';
import { useResolveMultiLang } from '@/hooks/useResolveMultiLang';

const DEMO_MODE = import.meta.env.VITE_DEMO_MODE === 'true';

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

function EmployeeSection({
  employee,
  defaultOpen,
}: {
  employee: IEmployee;
  defaultOpen: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const [deleteTarget, setDeleteTarget] = useState<FormListItem | null>(null);
  const resolve = useResolveMultiLang();
  const navigate = useNavigate();
  const { userId } = useParams<{ userId?: string }>();
  const p = (path: string) => userId ? `/${userId}${path}` : path;

  const { data: forms, isLoading } = useEmployeeArchive(open ? employee._id : '');
  const deleteMutation = useDeleteForm();

  const handleDelete = async () => {
    if (!deleteTarget) return;
    await deleteMutation.mutateAsync(deleteTarget._id);
    toast({ title: 'הטופס נמחק' });
    setDeleteTarget(null);
  };

  return (
    <>
      {/* Employee header row */}
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
          <Link
            to={p(`/employees/${employee._id}/edit`)}
            onClick={(e) => e.stopPropagation()}
            className="font-semibold hover:underline"
          >
            {resolve(employee.fullName)}
          </Link>
          <span className="text-sm text-muted-foreground">({employee.nationality})</span>
        </div>
        <div className="flex items-center gap-2">
          {forms && (
            <span className="text-sm text-muted-foreground">
              {forms.length} {forms.length === 1 ? 'טופס' : 'טפסים'}
            </span>
          )}
          <Button
            size="sm"
            variant="outline"
            onClick={(e) => {
              e.stopPropagation();
              navigate(`${p('/forms/new')}?employeeId=${employee._id}&formType=payslip`);
            }}
          >
            <Plus className="h-4 w-4 me-1" />
            תלוש חדש
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={(e) => {
              e.stopPropagation();
              navigate(`${p('/forms/new')}?employeeId=${employee._id}&formType=final_settlement`);
            }}
          >
            גמר חשבון
          </Button>
        </div>
      </div>

      {/* Forms list */}
      {open && (
        <div className="ms-4 border-s ps-4 space-y-1 pb-2">
          {isLoading ? (
            <p className="py-3 text-sm text-muted-foreground">טוען...</p>
          ) : !forms || forms.length === 0 ? (
            <p className="py-3 text-sm text-muted-foreground">אין טפסים עדיין</p>
          ) : (
            forms.map((form) => (
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
                  <Link
                    to={p(`/forms/${form._id}`)}
                    className="flex h-9 w-9 items-center justify-center rounded-md border bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                    title="פתח"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </Link>
                  {!DEMO_MODE && (
                    <button
                      onClick={() => setDeleteTarget(form)}
                      className="flex h-9 w-9 items-center justify-center rounded-md border text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
                      title="מחק"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Delete confirmation dialog */}
      <Dialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>מחיקת טופס</DialogTitle>
            <DialogDescription>
              האם אתה בטוח שברצונך למחוק את הטופס הזה? לא ניתן לשחזר פעולה זו.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>ביטול</Button>
            <Button
              variant="destructive"
              disabled={deleteMutation.isPending}
              onClick={handleDelete}
            >
              {deleteMutation.isPending ? 'מוחק...' : 'מחק'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

export function SubscribedDashboard() {
  const { data: employees, isLoading: employeesLoading } = useEmployees();
  const { userId } = useParams<{ userId?: string }>();
  const p = (path: string) => userId ? `/${userId}${path}` : path;

  if (employeesLoading) return <PageLoading />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">ארכיון טפסים</h1>
        <Button asChild>
          <Link to={p('/employees/new')}>
            <Users className="h-5 w-5 me-2" />
            הוסף עובד
          </Link>
        </Button>
      </div>

      {!employees || employees.length === 0 ? (
        <div className="flex min-h-[300px] flex-col items-center justify-center gap-4 rounded-lg border-2 border-dashed p-8 text-center">
          <FileText className="h-12 w-12 text-muted-foreground" />
          <div>
            <h3 className="text-xl font-medium">אין עובדים עדיין</h3>
            <p className="mt-1 text-muted-foreground">הוסף עובד כדי להתחיל ליצור תלושי שכר</p>
          </div>
          <Button asChild>
            <Link to={p('/employees/new')}>הוסף עובד ראשון</Link>
          </Button>
        </div>
      ) : (
        <div className="space-y-2">
          {employees.map((employee, index) => (
            <EmployeeSection
              key={employee._id}
              employee={employee}
              defaultOpen={index === 0}
            />
          ))}
        </div>
      )}
    </div>
  );
}
