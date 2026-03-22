import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@clerk/clerk-react';
import { useApiClient } from '@/lib/useApiClient';
import type { ApiResponse, IUser } from '@payslips-maker/shared';

const DEMO_MODE = import.meta.env.VITE_DEMO_MODE === 'true';

export function useCurrentUser() {
  const { isSignedIn } = useAuth();
  const { get } = useApiClient();

  return useQuery({
    queryKey: ['currentUser'],
    queryFn: () => get<ApiResponse<IUser>>('/api/users/me'),
    enabled: DEMO_MODE || !!isSignedIn,
    select: (res) => res.data,
  });
}
