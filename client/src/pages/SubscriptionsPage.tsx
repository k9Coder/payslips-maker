import { CreditCard, CheckCircle, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PageLoading } from '@/shared/components/LoadingSpinner';
import { useSubscriptions, useCreateSubscription, useCancelSubscription } from '@/domains/subscriptions/hooks/useEmployeeSubscription';
import { useEmployees } from '@/domains/employees/hooks/useEmployees';
import { useResolveMultiLang } from '@/hooks/useResolveMultiLang';
import type { ISubscription } from '@payslips-maker/shared';

export function SubscriptionsPage() {
  const { data: subscriptions, isLoading: subLoading } = useSubscriptions();
  const { data: employees,     isLoading: empLoading } = useEmployees();
  const createSub  = useCreateSubscription();
  const cancelSub  = useCancelSubscription();
  const resolve    = useResolveMultiLang();

  if (subLoading || empLoading) return <PageLoading />;

  const hasFullPlan = subscriptions?.some((s) => s.plan === 'full' && s.status === 'active');

  function getEmployeeSubscription(employeeId: string): ISubscription | undefined {
    return subscriptions?.find(
      (s) => s.plan === 'per_employee' && s.employeeId === employeeId && s.status === 'active'
    );
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center gap-3">
        <CreditCard className="h-6 w-6 text-[#1B2A4A]" />
        <h1 className="text-2xl font-bold text-[#1B2A4A]">מנויים</h1>
      </div>

      {/* Full plan */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>מנוי מלא — 85 ₪ / חודש</span>
            {hasFullPlan ? (
              <Badge variant="default">פעיל</Badge>
            ) : (
              <Badge variant="outline">לא פעיל</Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <p className="text-sm text-muted-foreground">פותח את כל התכונות לכל העובדים: PDF ללא הגבלה, שליחת מייל, גמר חשבון, יומן עבודה.</p>
          {hasFullPlan ? (
            <Button
              variant="destructive"
              size="sm"
              onClick={() => {
                const sub = subscriptions!.find((s) => s.plan === 'full');
                if (sub) cancelSub.mutate(sub._id);
              }}
              disabled={cancelSub.isPending}
            >
              בטל מנוי
            </Button>
          ) : (
            <Button
              size="sm"
              onClick={() => createSub.mutate({ plan: 'full' })}
              disabled={createSub.isPending}
            >
              הירשם — 85 ₪ / חודש
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Per-employee subscriptions */}
      <div className="space-y-3">
        <h2 className="font-semibold text-lg">מנוי לפי עובד — 40 ₪ / חודש לעובד</h2>
        {employees?.map((emp) => {
          const sub = getEmployeeSubscription(emp._id);
          return (
            <Card key={emp._id}>
              <CardContent className="flex items-center justify-between py-4">
                <div className="flex items-center gap-2">
                  {sub ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : (
                    <XCircle className="h-4 w-4 text-muted-foreground" />
                  )}
                  <span className="font-medium">{resolve(emp.fullName)}</span>
                </div>
                <div className="flex items-center gap-2">
                  {sub ? (
                    <>
                      <Badge variant="default">פעיל</Badge>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => cancelSub.mutate(sub._id)}
                        disabled={cancelSub.isPending}
                      >
                        בטל
                      </Button>
                    </>
                  ) : (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => createSub.mutate({ plan: 'per_employee', employeeId: emp._id })}
                      disabled={createSub.isPending || !!hasFullPlan}
                    >
                      הירשם — 40 ₪ / חודש
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
        {employees?.length === 0 && (
          <p className="text-muted-foreground text-sm">אין עובדים עדיין.</p>
        )}
      </div>
    </div>
  );
}
