import { Link } from 'react-router-dom';
import { UserCog, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useImpersonation } from '../context/ImpersonationContext';

export function ImpersonationBanner() {
  const ctx = useImpersonation();
  if (!ctx) return null;

  return (
    <div className="sticky top-0 z-50 flex items-center justify-between gap-3 bg-amber-100 border-b border-amber-300 px-4 py-2 text-amber-900">
      <div className="flex items-center gap-2 text-sm font-medium">
        <UserCog className="h-4 w-4 shrink-0" />
        <span>
          מנהל עבור:{' '}
          <span className="font-bold">{ctx.targetUser?.fullName ?? ctx.targetUserId}</span>
        </span>
      </div>
      <Button variant="outline" size="sm" className="border-amber-400 bg-amber-50 hover:bg-amber-200 text-amber-900 gap-1" asChild>
        <Link to={`/admin/users/${ctx.targetUserId}`}>
          חזור לפרופיל
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </Button>
    </div>
  );
}
