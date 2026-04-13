import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useApiClient } from '@/lib/useApiClient';
import type { ApiResponse, FormListItem, IEmployee } from '@payslips-maker/shared';

export function useEmployeeArchive(employeeId: string) {
  const { get } = useApiClient();
  return useQuery({
    queryKey: ['forms', 'employee', employeeId],
    queryFn: () =>
      get<ApiResponse<FormListItem[]>>(`/api/forms?employeeId=${employeeId}`).then((r) => r.data),
    enabled: !!employeeId,
  });
}

export function useDeleteForm() {
  const { del } = useApiClient();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (formId: string) => del<ApiResponse<null>>(`/api/forms/${formId}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['forms'] });
    },
  });
}

export function useAdminCompanyEmployees(companyId: string) {
  const { get } = useApiClient();
  return useQuery({
    queryKey: ['admin', 'companies', companyId, 'employees'],
    queryFn: () =>
      get<ApiResponse<IEmployee[]>>(`/api/admin/companies/${companyId}/employees`).then((r) => r.data),
    enabled: !!companyId,
  });
}

export function useAdminEmployeeArchive(companyId: string, employeeId: string) {
  const { get } = useApiClient();
  return useQuery({
    queryKey: ['admin', 'companies', companyId, 'employees', employeeId, 'forms'],
    queryFn: () =>
      get<ApiResponse<FormListItem[]>>(
        `/api/admin/companies/${companyId}/employees/${employeeId}/forms`
      ).then((r) => r.data),
    enabled: !!companyId && !!employeeId,
  });
}
