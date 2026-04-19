import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useApiClient } from '@/lib/useApiClient';
import type { WorkLogMonthSummary, CreateWorkLogEntryDto, UpdateWorkLogEntryDto } from '@payslips-maker/shared';
import type { ApiResponse } from '@payslips-maker/shared';

export function useWorkLogMonth(employeeId: string, year: number, month: number) {
  const { get } = useApiClient();
  return useQuery({
    queryKey: ['worklog', employeeId, year, month],
    queryFn: () =>
      get<ApiResponse<WorkLogMonthSummary>>(
        `/api/worklog?employeeId=${employeeId}&year=${year}&month=${month}`
      ).then((r) => r.data),
    enabled: !!employeeId,
  });
}

export function useCreateWorkLogEntry() {
  const { post } = useApiClient();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: CreateWorkLogEntryDto) =>
      post<ApiResponse<unknown>>('/api/worklog', dto),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['worklog'] }),
  });
}

export function useUpdateWorkLogEntry() {
  const { patch } = useApiClient();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ entryId, dto }: { entryId: string; dto: UpdateWorkLogEntryDto }) =>
      patch<ApiResponse<unknown>>(`/api/worklog/${entryId}`, dto),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['worklog'] }),
  });
}

export function useDeleteWorkLogEntry() {
  const { del } = useApiClient();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (entryId: string) => del<ApiResponse<null>>(`/api/worklog/${entryId}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['worklog'] }),
  });
}
