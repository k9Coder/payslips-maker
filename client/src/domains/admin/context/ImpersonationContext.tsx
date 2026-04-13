import { createContext, useContext } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useApiClient } from '@/lib/useApiClient';
import type { IUser, ApiResponse, FormListItem } from '@payslips-maker/shared';

interface ImpersonationContextValue {
  targetUserId: string;
  targetUser: IUser | null;
}

const ImpersonationContext = createContext<ImpersonationContextValue | null>(null);

export function ImpersonationProvider({ children }: { children: React.ReactNode }) {
  const { userId } = useParams<{ userId: string }>();
  const { get } = useApiClient();

  const { data } = useQuery({
    queryKey: ['admin', 'user', userId],
    queryFn: () =>
      get<ApiResponse<{ user: IUser; forms: FormListItem[] }>>(`/api/admin/users/${userId}`),
    enabled: !!userId,
    select: (res) => res.data?.user ?? null,
  });

  if (!userId) return null;

  return (
    <ImpersonationContext.Provider value={{ targetUserId: userId, targetUser: data ?? null }}>
      {children}
    </ImpersonationContext.Provider>
  );
}

export function useImpersonation() {
  return useContext(ImpersonationContext);
}
