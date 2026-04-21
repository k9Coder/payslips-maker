import { Link, useMatch } from 'react-router-dom';
import { ArrowRight, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useQuery } from '@tanstack/react-query';
import { useApiClient } from '@/lib/useApiClient';
import type { ApiResponse, IUser, FormListItem } from '@payslips-maker/shared';

export function ImpersonationBanner() {
  const match = useMatch('/:userId/*');
  const userId = match?.params?.userId;
  // Only treat as impersonation if userId looks like a MongoDB ObjectId
  const isImpersonating = !!userId && /^[0-9a-f]{24}$/i.test(userId);

  const { get } = useApiClient();
  const { data: targetUser } = useQuery({
    queryKey: ['admin', 'user', userId],
    queryFn: () =>
      get<ApiResponse<{ user: IUser; forms: FormListItem[] }>>(`/api/admin/users/${userId}`)
        .then((r) => r.data?.user ?? null),
    enabled: isImpersonating,
    staleTime: 60_000,
  });

  if (!isImpersonating) return null;

  const name = targetUser?.fullName ?? userId ?? '';

  return (
    <div className="sticky top-0 z-50 bg-[#1B2A4A] border-b-2 border-blue-400 px-4 py-3 shadow-lg">
      <div className="flex items-center justify-between gap-3 max-w-7xl mx-auto">
        {/* Left: mode indicator */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-blue-400" />
            </span>
            <span className="text-blue-300 text-xs font-semibold uppercase tracking-widest">מצב ניהול</span>
          </div>
          <div className="h-4 w-px bg-blue-700" />
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-600 text-white text-xs font-bold shrink-0">
              {name.charAt(0).toUpperCase()}
            </div>
            <div className="leading-tight">
              <p className="text-white font-semibold text-sm leading-none">{name}</p>
              <p className="text-blue-300 text-xs mt-0.5">אתה רואה את המערכת כמשתמש זה</p>
            </div>
          </div>
        </div>

        {/* Right: back button */}
        <Button
          variant="outline"
          size="sm"
          className="border-blue-500 bg-transparent hover:bg-blue-700 text-blue-200 hover:text-white gap-1.5 shrink-0"
          asChild
        >
          <Link to={`/admin/users/${userId}`}>
            <Eye className="h-3.5 w-3.5" />
            יציאה ממצב ניהול
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </Button>
      </div>
    </div>
  );
}
