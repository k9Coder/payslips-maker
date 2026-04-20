import { Link } from 'react-router-dom';
import { ArrowRight, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useImpersonation } from '../context/ImpersonationContext';

export function ImpersonationBanner() {
  const ctx = useImpersonation();
  if (!ctx) return null;

  const name = ctx.targetUser?.fullName ?? ctx.targetUserId;

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
          <Link to={`/admin/users/${ctx.targetUserId}`}>
            <Eye className="h-3.5 w-3.5" />
            יציאה ממצב ניהול
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </Button>
      </div>
    </div>
  );
}
