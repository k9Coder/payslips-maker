import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useApiClient } from '@/lib/useApiClient';
import type { ICompany, CreateCompanyDto, UpdateCompanyDto, ApiResponse } from '@payslips-maker/shared';

export function useCompanies() {
  const { get } = useApiClient();
  return useQuery({
    queryKey: ['companies'],
    queryFn: () =>
      get<ApiResponse<ICompany[]>>('/api/companies').then((r) => r.data),
  });
}

export function useCompany(id: string) {
  const { get } = useApiClient();
  return useQuery({
    queryKey: ['companies', id],
    queryFn: () =>
      get<ApiResponse<ICompany>>(`/api/companies/${id}`).then((r) => r.data),
    enabled: !!id,
  });
}

export function useCreateCompany() {
  const { post } = useApiClient();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: CreateCompanyDto) =>
      post<ApiResponse<ICompany>>('/api/companies', dto).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['companies'] });
      qc.invalidateQueries({ queryKey: ['currentUser'] });
    },
  });
}

export function useUpdateCompany(id: string) {
  const { patch } = useApiClient();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: UpdateCompanyDto) =>
      patch<ApiResponse<ICompany>>(`/api/companies/${id}`, dto).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['companies'] });
      qc.invalidateQueries({ queryKey: ['companies', id] });
    },
  });
}

export function useDeleteCompany() {
  const { del } = useApiClient();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => del<ApiResponse<null>>(`/api/companies/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['companies'] });
      qc.invalidateQueries({ queryKey: ['currentUser'] });
    },
  });
}
