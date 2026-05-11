import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useApiClient } from '@/lib/useApiClient';
import type { ApiResponse, EmployeeSubscriptionStatus, CreateSubscriptionDto, ISubscription } from '@payslips-maker/shared';

export function useEmployeeSubscription(employeeId: string | undefined) {
  const { get } = useApiClient();

  return useQuery({
    queryKey: ['subscription', 'employee', employeeId],
    queryFn: () =>
      get<ApiResponse<EmployeeSubscriptionStatus>>(`/api/subscriptions/employee/${employeeId}`)
        .then((r) => r.data),
    enabled: !!employeeId,
    staleTime: 30_000,
  });
}

export function useSubscriptions() {
  const { get } = useApiClient();
  return useQuery({
    queryKey: ['subscriptions'],
    queryFn: () =>
      get<ApiResponse<ISubscription[]>>('/api/subscriptions').then((r) => r.data),
  });
}

export function useCreateSubscription() {
  const { post } = useApiClient();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: CreateSubscriptionDto) =>
      post<ApiResponse<ISubscription>>('/api/subscriptions', dto).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['subscriptions'] });
      qc.invalidateQueries({ queryKey: ['subscription'] });
    },
  });
}

export function useCancelSubscription() {
  const { del } = useApiClient();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => del<ApiResponse<null>>(`/api/subscriptions/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['subscriptions'] });
      qc.invalidateQueries({ queryKey: ['subscription'] });
    },
  });
}

export function useRecordGenerate() {
  const { post } = useApiClient();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (formId: string) =>
      post<ApiResponse<{ allowed: boolean; remaining: number | null }>>(
        `/api/forms/${formId}/generate`,
        {}
      ).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['subscription'] });
    },
  });
}
