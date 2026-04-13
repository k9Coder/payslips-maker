import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate, useLocation, useBlocker } from 'react-router-dom';
import { payslipFormSchema, type PayslipFormValues } from '../payslip.schema';
import { useApiClient } from '@/lib/useApiClient';
import { toast } from '@/hooks/use-toast';
import type { ApiResponse, IForm } from '@payslips-maker/shared';

const currentYear = new Date().getFullYear();
const currentMonth = new Date().getMonth() + 1;

const defaultValues: PayslipFormValues = {
  period: { month: currentMonth, year: currentYear },
  employeeInfo: {
    fullName: {},
    idNumber: '',
    nationality: '',
    employerName: {},
    employerTaxId: '',
  },
  workDetails: {
    standardDays: 22,
    workedDays: 22,
    vacationDays: 0,
    sickDays: 0,
    holidayDays: 0,
    overtime100h: 0,
    overtime125h: 0,
    overtime150h: 0,
  },
  payCalculation: {
    dailyRate: 0,
    baseSalary: 0,
    overtimePay: 0,
    vacationPay: 0,
    grossSalary: 0,
  },
  deductions: {
    incomeTax: 0,
    nationalInsurance: 0,
    healthInsurance: 0,
    otherDeductions: 0,
  },
  employerContributions: {
    nationalInsurance: 0,
    pension: 0,
    pensionEmployeeRate: 0,
    pensionEmployerRate: 0,
    severanceFund: 0,
    educationFund: 0,
    educationFundEmployee: 0,
  },
  netSalary: 0,
  paymentInfo: {
    paymentMethod: 'bank',
    bankName: '',
    accountNumber: '',
    branchNumber: '',
  },
  customPayItems: [],
  vacationAccount: null,
  sickAccount: null,
};

export function toFormValues(form: IForm): PayslipFormValues {
  return {
    period: form.period,
    employeeInfo: form.employeeInfo,
    workDetails: form.workDetails,
    payCalculation: form.payCalculation,
    deductions: form.deductions,
    employerContributions: {
      nationalInsurance: form.employerContributions.nationalInsurance,
      pension: form.employerContributions.pension,
      pensionFund: form.employerContributions.pensionFund,
      pensionEmployeeRate: form.employerContributions.pensionEmployeeRate ?? 0,
      pensionEmployerRate: form.employerContributions.pensionEmployerRate ?? 0,
      severanceFund: form.employerContributions.severanceFund ?? 0,
      educationFund: form.employerContributions.educationFund ?? 0,
      educationFundEmployee: form.employerContributions.educationFundEmployee ?? 0,
    },
    netSalary: form.netSalary,
    paymentInfo: form.paymentInfo,
    customPayItems: form.customPayItems ?? [],
    vacationAccount: form.vacationAccount ?? null,
    sickAccount: form.sickAccount ?? null,
  };
}

export function usePayslipForm(formId?: string) {
  const { get, post, put } = useApiClient();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const location = useLocation();

  const copyData = !formId ? (location.state as { copyData?: PayslipFormValues } | null)?.copyData : undefined;

  const form = useForm<PayslipFormValues>({
    resolver: zodResolver(payslipFormSchema),
    defaultValues: copyData ?? defaultValues,
    mode: 'onChange',
  });

  // Load existing form data if editing
  const { data: existingForm, isLoading } = useQuery({
    queryKey: ['form', formId],
    queryFn: () => get<ApiResponse<IForm>>(`/api/forms/${formId}`).then((r) => r.data),
    enabled: !!formId,
    staleTime: 0,
  });

  useEffect(() => {
    if (!existingForm) return;
    form.reset(toFormValues(existingForm));
  }, [existingForm]);

  const createMutation = useMutation({
    mutationFn: (data: PayslipFormValues) =>
      post<ApiResponse<IForm>>('/api/forms', data),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['forms'] });
      toast({ title: 'נשמר בהצלחה' });
      navigate(`/forms/${res.data._id}`);
    },
    onError: (error: unknown) => {
      const isLimit = error instanceof Error && error.message === 'FORM_LIMIT_REACHED';
      toast({
        title: isLimit ? 'הגעת למגבלת הטפסים' : 'שגיאה בשמירה',
        description: isLimit ? 'מחק טופס קיים כדי להוסיף חדש (מקסימום 10)' : undefined,
        variant: 'destructive',
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: PayslipFormValues) =>
      put<ApiResponse<IForm>>(`/api/forms/${formId}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['forms'] });
      queryClient.invalidateQueries({ queryKey: ['form', formId] });
      toast({ title: 'נשמר בהצלחה' });
    },
    onError: () => {
      toast({ title: 'שגיאה בשמירה', variant: 'destructive' });
    },
  });

  const onSubmit = form.handleSubmit((data: PayslipFormValues) => {
    if (import.meta.env.VITE_DEMO_MODE === 'true') {
      toast({ title: 'מצב הדגמה', description: 'שינויים לא נשמרים במצב הדגמה' });
      return;
    }
    if (formId) {
      updateMutation.mutate(data);
    } else {
      createMutation.mutate(data);
    }
  });

  const isSaving = createMutation.isPending || updateMutation.isPending;
  const isDirty = form.formState.isDirty;

  // Block in-app navigation when there are unsaved changes
  const blocker = useBlocker(isDirty && !isSaving);

  // Block tab close / external navigation when there are unsaved changes
  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (form.formState.isDirty) e.preventDefault();
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [form.formState.isDirty]);

  const handleDuplicate = () => {
    const values = form.getValues();
    // Reset dirty state so the blocker doesn't fire on this intentional navigation
    form.reset(values);
    navigate('/forms/new', { state: { copyData: values } });
  };

  return {
    form,
    isLoading: !!formId && isLoading,
    isSaving,
    onSubmit,
    handleDuplicate,
    blocker,
  };
}
