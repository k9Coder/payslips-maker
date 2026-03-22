import { useClerk, useUser } from '@clerk/clerk-react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { FileText, LogOut, Settings, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCurrentUser } from '@/hooks/useCurrentUser';

const DEMO_MODE = import.meta.env.VITE_DEMO_MODE === 'true';

export function Navbar() {
  const { t } = useTranslation();
  const { signOut } = useClerk();
  const { user: clerkUser } = useUser();
  const navigate = useNavigate();
  const { data: currentUser } = useCurrentUser();

  const displayName = DEMO_MODE
    ? 'ישראל האדמין'
    : (clerkUser?.fullName ?? clerkUser?.primaryEmailAddress?.emailAddress);
  const avatarUrl = DEMO_MODE ? undefined : clerkUser?.imageUrl;

  const handleSignOut = async () => {
    if (DEMO_MODE) return;
    await signOut();
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        {/* Logo / Title - on the right in RTL */}
        <Link to="/dashboard" className="flex items-center gap-2 text-xl font-bold text-primary">
          <FileText className="h-6 w-6" />
          <span className="hidden sm:inline">יוצר תלושי שכר</span>
        </Link>

        {/* Nav actions */}
        <nav className="flex items-center gap-2">
          {currentUser?.isAdmin && (
            <Button variant="ghost" size="sm" asChild>
              <Link to="/admin" className="flex items-center gap-1.5">
                <Shield className="h-4 w-4" />
                <span className="hidden sm:inline">{t('nav.admin')}</span>
              </Link>
            </Button>
          )}

          <Button variant="ghost" size="sm" asChild>
            <Link to="/profile" className="flex items-center gap-1.5">
              <Settings className="h-4 w-4" />
              <span className="hidden sm:inline">{t('nav.profile')}</span>
            </Link>
          </Button>

          <div className="hidden items-center gap-2 sm:flex">
            {avatarUrl && (
              <img
                src={avatarUrl}
                alt={displayName ?? ''}
                className="h-8 w-8 rounded-full"
              />
            )}
            <span className="text-sm text-muted-foreground">
              {displayName}
            </span>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={handleSignOut}
            className="flex items-center gap-1.5"
          >
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">{t('nav.signOut')}</span>
          </Button>
        </nav>
      </div>
    </header>
  );
}
