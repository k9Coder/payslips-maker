import { useQuery } from '@tanstack/react-query';
import { useApiClient } from '../../../lib/useApiClient';
import { useEmployees } from './useEmployees';

export function useFormsSummary() {
  const api = useApiClient();
  return useQuery({
    queryKey: ['forms', 'summary'],
    queryFn: async () => {
      const res = await api.get<{ data: { count: number; thisMonth: number } }>('/api/forms/summary');
      return res.data;
    },
  });
}

export function useDashboardStats() {
  const { data: employees, isLoading } = useEmployees();
  return {
    employeeCount: employees?.length ?? 0,
    isLoading,
    employees: employees ?? [],
  };
}
