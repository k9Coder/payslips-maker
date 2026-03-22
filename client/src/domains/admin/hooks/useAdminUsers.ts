import { useQuery } from '@tanstack/react-query';
import { useApiClient } from '@/lib/useApiClient';
import type { AdminUserView, PaginatedResponse } from '@payslips-maker/shared';

export function useAdminUsers(page = 1, limit = 20) {
  const { get } = useApiClient();

  return useQuery({
    queryKey: ['admin', 'users', page, limit],
    queryFn: () =>
      get<PaginatedResponse<AdminUserView>>(`/api/admin/users?page=${page}&limit=${limit}`),
  });
}
