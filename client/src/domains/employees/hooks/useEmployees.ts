import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useApiClient } from '@/lib/useApiClient';
import type { IEmployee, CreateEmployeeDto, UpdateEmployeeDto, ApiResponse } from '@payslips-maker/shared';

export function useEmployees() {
  const { get } = useApiClient();
  return useQuery({
    queryKey: ['employees'],
    queryFn: () =>
      get<ApiResponse<IEmployee[]>>('/api/employees').then((r) => r.data),
  });
}

export function useEmployee(id: string) {
  const { get } = useApiClient();
  return useQuery({
    queryKey: ['employees', id],
    queryFn: () =>
      get<ApiResponse<IEmployee>>(`/api/employees/${id}`).then((r) => r.data),
    enabled: !!id,
  });
}

export function useCreateEmployee() {
  const { post } = useApiClient();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: CreateEmployeeDto) =>
      post<ApiResponse<IEmployee>>('/api/employees', dto).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['employees'] }),
  });
}

export function useUpdateEmployee(id: string) {
  const { patch } = useApiClient();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: UpdateEmployeeDto) =>
      patch<ApiResponse<IEmployee>>(`/api/employees/${id}`, dto).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['employees'] });
      qc.invalidateQueries({ queryKey: ['employees', id] });
    },
  });
}

export function useDeleteEmployee() {
  const { del } = useApiClient();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      del<ApiResponse<null>>(`/api/employees/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['employees'] }),
  });
}
