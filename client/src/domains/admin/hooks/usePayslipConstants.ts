import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useApiClient } from '@/lib/useApiClient';
import type { IPayslipConstants } from '@payslips-maker/shared';

interface ApiResponse<T> { data: T }

export function usePayslipConstants() {
  const { get } = useApiClient();
  return useQuery({
    queryKey: ['payslip-constants'],
    queryFn: () => get<ApiResponse<IPayslipConstants>>('/api/payslip-constants').then((r) => r.data),
    staleTime: 5 * 60 * 1000,
  });
}

export function useAdminPayslipConstants() {
  const { get } = useApiClient();
  return useQuery({
    queryKey: ['admin-payslip-constants'],
    queryFn: () => get<ApiResponse<IPayslipConstants>>('/api/payslip-constants/admin').then((r) => r.data),
  });
}

export function useUpdatePayslipConstants() {
  const { patch } = useApiClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: Partial<IPayslipConstants>) =>
      patch<ApiResponse<IPayslipConstants>>('/api/payslip-constants/admin', body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-payslip-constants'] });
      queryClient.invalidateQueries({ queryKey: ['payslip-constants'] });
    },
  });
}
