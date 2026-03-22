import { useQuery } from '@tanstack/react-query';
import { useApiClient } from '@/lib/useApiClient';
import type { AdminFormsQuery } from '@payslips-maker/shared';

export function useAdminForms(query: AdminFormsQuery = {}) {
  const { get } = useApiClient();

  const params = new URLSearchParams();
  if (query.userId) params.set('userId', query.userId);
  if (query.month) params.set('month', String(query.month));
  if (query.year) params.set('year', String(query.year));
  if (query.sortBy) params.set('sortBy', query.sortBy);
  if (query.sortOrder) params.set('sortOrder', query.sortOrder);
  if (query.page) params.set('page', String(query.page));
  if (query.limit) params.set('limit', String(query.limit));

  return useQuery({
    queryKey: ['admin', 'forms', query],
    queryFn: () => get<{ success: boolean; forms: unknown[]; total: number; page: number; limit: number }>(`/api/admin/forms?${params.toString()}`),
  });
}
