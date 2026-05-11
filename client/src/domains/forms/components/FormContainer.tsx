import { useState, useEffect } from 'react';
import { useNavigate, useBlocker } from 'react-router-dom';
import { FormProvider, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Save, Copy, FileText, Mail } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { PageLoading } from '@/shared/components/LoadingSpinner';
import { useApiClient } from '@/lib/useApiClient';
import { useEmployee } from '@/domains/employees/hooks/useEmployees';
import { getFormConfig } from '../form-registry';
import { PDFDownloadDialog } from './PDFDownloadDialog';
import { SendEmailDialog } from './SendEmailDialog';
import { useEmployeeSubscription, useRecordGenerate } from '@/domains/subscriptions/hooks/useEmployeeSubscription';
import { UpgradePrompt } from '@/domains/subscriptions/components/UpgradePrompt';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { useResolveMultiLang } from '@/hooks/useResolveMultiLang';
import { toast } from '@/hooks/use-toast';
import type { ApiResponse, IForm, FormType, CreateFormDto, WorkLogMonthSummary, IPayslipConstants } from '@payslips-maker/shared';
import { computePayslip } from '@/domains/payslip/payslip.calculations';

const DEMO_MODE = import.meta.env.VITE_DEMO_MODE === 'true';

interface FormContainerProps {
  formType: FormType;
  employeeId: string;
  formId?: string;
  workLogOverride?: WorkLogMonthSummary;
  previousPayslip?: IForm | null;
  constants?: IPayslipConstants;
}

export function FormContainer({ formType, employeeId, formId, workLogOverride, previousPayslip, constants }: FormContainerProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const resolve = useResolveMultiLang();
  const { get, post, put } = useApiClient();
  const queryClient = useQueryClient();
  const [pdfDialogOpen, setPdfDialogOpen] = useState(false);
  const [sendEmailDialogOpen, setSendEmailDialogOpen] = useState(false);
  const [formReady, setFormReady] = useState(false);
  const [upgradeOpen, setUpgradeOpen] = useState(false);
  const [upgradeReason, setUpgradeReason] = useState<'pdf_limit' | 'email' | 'final_settlement' | 'worklog' | 'employee'>('pdf_limit');
  const { data: currentUser } = useCurrentUser();
  const { data: subStatus } = useEmployeeSubscription(employeeId);
  const recordGenerate = useRecordGenerate();

  const config = getFormConfig(formType);

  // Load employee
  const { data: employee, isLoading: isEmployeeLoading } = useEmployee(employeeId);

  // Load existing form when editing
  const { data: existingForm, isLoading: isFormLoading } = useQuery({
    queryKey: ['form', formId],
    queryFn: () => get<ApiResponse<IForm>>(`/api/forms/${formId}`).then((r) => r.data),
    enabled: !!formId,
    staleTime: 0,
  });

  const isLoading = isEmployeeLoading || (!!formId && isFormLoading);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const form = useForm<any>({
    resolver: zodResolver(config.schema),
    defaultValues: {},
    mode: 'onChange',
  });

  // Initialize / reset form values once data arrives
  useEffect(() => {
    if (!employee) return;
    if (formId && existingForm) {
      form.reset(config.fromApiForm(existingForm));
      setFormReady(true);
    } else if (!formId) {
      if (
        workLogOverride &&
        formType === 'payslip' &&
        constants &&
        currentUser
      ) {
        const employerProfile = {
          employerName: currentUser.employerName ?? {},
          employerTaxId: currentUser.employerTaxId ?? '',
          employerAddress: currentUser.employerAddress,
          employerCity: currentUser.employerCity,
          employerZip: currentUser.employerZip,
        };
        const computed = computePayslip({
          employee,
          employerProfile,
          worklogSummary: workLogOverride,
          previousPayslip: previousPayslip ?? null,
          constants,
          period: { year: workLogOverride.year, month: workLogOverride.month },
        });
        form.reset(computed);
        setFormReady(true);
      } else {
        const defaults = config.defaultValues(employee);
        if (formType === 'payslip' && currentUser && 'employeeInfo' in defaults) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const ei = (defaults as any).employeeInfo;
          ei.employerName = currentUser.employerName ?? {};
          ei.employerTaxId = currentUser.employerTaxId ?? '';
          ei.employerAddress = currentUser.employerAddress;
          ei.employerCity = currentUser.employerCity;
          ei.employerZip = currentUser.employerZip;
        }
        form.reset(defaults);
        setFormReady(true);
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [employee, existingForm, formId, workLogOverride, previousPayslip, constants, currentUser]);

  const createMutation = useMutation({
    mutationFn: (dto: CreateFormDto) =>
      post<ApiResponse<IForm>>('/api/forms', dto),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['forms'] });
      toast({ title: 'נשמר בהצלחה' });
      navigate(`/forms/${res.data._id}`);
    },
    onError: (error: unknown) => {
      const isLimit = error instanceof Error && error.message === 'FORM_LIMIT_REACHED';
      toast({
        title: isLimit ? 'הגעת למגבלת הטפסים' : 'שגיאה בשמירה',
        description: isLimit ? 'שדרג מנוי כדי להוסיף טפסים נוספים' : undefined,
        variant: 'destructive',
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: (dto: CreateFormDto) =>
      put<ApiResponse<IForm>>(`/api/forms/${formId}`, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['forms'] });
      queryClient.invalidateQueries({ queryKey: ['form', formId] });
      toast({ title: 'נשמר בהצלחה' });
    },
    onError: () => {
      toast({ title: 'שגיאה בשמירה', variant: 'destructive' });
    },
  });

  const isSaving = createMutation.isPending || updateMutation.isPending;
  const isDirty = form.formState.isDirty;

  const blocker = useBlocker(isDirty && !isSaving);

  // Warn on tab close
  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (form.formState.isDirty) e.preventDefault();
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [form.formState.isDirty]);

  const onSubmit = form.handleSubmit(
    (data) => {
      if (DEMO_MODE) {
        toast({ title: 'מצב הדגמה', description: 'שינויים לא נשמרים במצב הדגמה' });
        return;
      }
      const baseDto = config.toApiPayload
        ? config.toApiPayload(data, { formType, employeeId })
        : { ...data, formType, employeeId };
      const dto: CreateFormDto = { ...baseDto } as CreateFormDto;
      if (formId) {
        updateMutation.mutate(dto);
      } else {
        createMutation.mutate(dto);
      }
    },
    (errors) => {
      console.error('Form validation errors:', errors);
      toast({ title: 'שגיאת אימות', description: 'נא לבדוק את שדות הטופס', variant: 'destructive' });
    }
  );

  const handleDuplicate = () => {
    const values = form.getValues();
    form.reset(values);
    navigate('/forms/new', {
      state: { copyData: config.fromApiForm({ ...values, formType, employeeId } as IForm) },
    });
  };

  if (isLoading || !formReady) return <PageLoading />;
  if (!employee) return <p className="text-center text-muted-foreground">עובד לא נמצא</p>;

  return (
    <FormProvider {...form}>
      <form onSubmit={onSubmit} noValidate>
        <div className="space-y-6">
          {/* Header with PDF button (only when viewing a saved form) */}
          {formId && (
            <div className="flex items-center justify-between">
              <span className="text-lg font-semibold text-muted-foreground">
                {resolve(employee.fullName)} — {config.labelHe}
              </span>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={async () => {
                    if (!formId) return;
                    try {
                      const result = await recordGenerate.mutateAsync(formId);
                      if (!result.allowed) {
                        setUpgradeReason('pdf_limit');
                        setUpgradeOpen(true);
                      } else {
                        setPdfDialogOpen(true);
                      }
                    } catch {
                      setUpgradeReason('pdf_limit');
                      setUpgradeOpen(true);
                    }
                  }}
                  className="flex items-center gap-2"
                  disabled={!existingForm || recordGenerate.isPending}
                >
                  <FileText className="h-4 w-4" />
                  {t('payslip.generatePdf')}
                </Button>
                {formId && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setSendEmailDialogOpen(true)}
                    className="flex items-center gap-2"
                    disabled={!existingForm || !subStatus?.features.sendEmail}
                    title={!subStatus?.features.sendEmail ? t('email.subscriptionRequired') : undefined}
                  >
                    <Mail className="h-4 w-4" />
                    {t('email.sendButton')}
                  </Button>
                )}
              </div>
            </div>
          )}

          <config.FormSections />

          {/* Action buttons */}
          <div className="sticky bottom-0 z-10 flex gap-3 border-t bg-background/95 p-4 backdrop-blur sm:relative sm:border-0 sm:bg-transparent sm:p-0 sm:backdrop-blur-none">
            <Button type="submit" disabled={isSaving} size="lg" className="flex-1 sm:flex-none">
              <Save className="h-5 w-5 ms-2" />
              {isSaving ? t('payslip.saving') : t('payslip.save')}
            </Button>

            {formId && (
              <Button
                type="button"
                variant="outline"
                size="lg"
                onClick={handleDuplicate}
                className="flex-1 sm:flex-none"
              >
                <Copy className="h-5 w-5 ms-2" />
                {t('payslip.duplicate')}
              </Button>
            )}
          </div>
        </div>
      </form>

      {/* PDF download dialog */}
      {existingForm && (
        <PDFDownloadDialog
          open={pdfDialogOpen}
          onClose={() => setPdfDialogOpen(false)}
          defaultLanguage={employee.preferredLanguage}
          form={existingForm}
          PDFDocument={config.PDFDocument}
          fileName={`${config.labelHe}-${resolve(employee.fullName)}`}
        />
      )}

      {/* Send email dialog */}
      {existingForm && subStatus?.features.sendEmail && (
        <SendEmailDialog
          open={sendEmailDialogOpen}
          onClose={() => setSendEmailDialogOpen(false)}
          form={existingForm}
          employee={employee}
          PDFDocument={config.PDFDocument}
        />
      )}

      <UpgradePrompt
        open={upgradeOpen}
        onClose={() => setUpgradeOpen(false)}
        reason={upgradeReason}
      />

      {/* Unsaved changes guard */}
      <Dialog
        open={blocker.state === 'blocked'}
        onOpenChange={(open) => !open && blocker.state === 'blocked' && blocker.reset?.()}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('payslip.unsavedChanges.title')}</DialogTitle>
            <DialogDescription>{t('payslip.unsavedChanges.message')}</DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" onClick={() => blocker.reset?.()}>
              {t('payslip.unsavedChanges.stay')}
            </Button>
            <Button variant="destructive" onClick={() => blocker.proceed?.()}>
              {t('payslip.unsavedChanges.leave')}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </FormProvider>
  );
}
