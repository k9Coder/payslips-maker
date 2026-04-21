import { useQuery } from '@tanstack/react-query';
import { useApiClient } from '@/lib/useApiClient';
import type { ApiResponse, IForm } from '@payslips-maker/shared';

export function usePreviousPayslip(
  employeeId: string,
  year: number,
  month: number,
  enabled: boolean
) {
  const { get } = useApiClient();
  return useQuery({
    queryKey: ['form', 'previous', employeeId, year, month],
    queryFn: () =>
      get<ApiResponse<IForm | null>>(
        `/api/forms/previous?employeeId=${employeeId}&year=${year}&month=${month}`
      ).then((r) => r.data),
    enabled,
    staleTime: 60_000,
  });
}
