import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useApiClient } from '@/lib/useApiClient';

export function useToggleSubscription(userId: string) {
  const { patch } = useApiClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (hasSubscription: boolean) =>
      patch(`/api/admin/users/${userId}/subscription`, { hasSubscription }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'user', userId] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
    },
  });
}
