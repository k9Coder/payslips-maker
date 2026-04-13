import { useClerk, useUser } from '@clerk/clerk-react';
import { useNavigate, Link, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { FileText, LogOut, Settings, Shield, Users, Building2, ArrowRight, UserCog, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { useQuery } from '@tanstack/react-query';
import { useApiClient } from '@/lib/useApiClient';
import type { IUser, ApiResponse, FormListItem } from '@payslips-maker/shared';
import i18n from '@/i18n';

const LANGUAGE_OPTIONS = [
  { value: 'he', label: 'עברית' },
  { value: 'en', label: 'English' },
  { value: 'ar', label: 'عربي' },
  { value: 'fil', label: 'Filipino' },
  { value: 'th', label: 'ภาษาไทย' },
  { value: 'am', label: 'አማርኛ' },
  { value: 'hi', label: 'हिन्दी' },
] as const;

const DEMO_MODE = import.meta.env.VITE_DEMO_MODE === 'true';

export function Navbar() {
  const { t } = useTranslation();
  const { signOut } = useClerk();
  const { user: clerkUser } = useUser();
  const navigate = useNavigate();
  const { data: currentUser } = useCurrentUser();
  const { userId } = useParams<{ userId?: string }>();
  const { get } = useApiClient();

  const { data: impersonatedUser } = useQuery({
    queryKey: ['admin', 'user', userId],
    queryFn: () =>
      get<ApiResponse<{ user: IUser; forms: FormListItem[] }>>(`/api/admin/users/${userId}`)
        .then((r) => r.data?.user ?? null),
    enabled: !!userId,
  });

  const displayName = DEMO_MODE
    ? 'ישראל האדמין'
    : (clerkUser?.fullName ?? clerkUser?.primaryEmailAddress?.emailAddress);
  const avatarUrl = DEMO_MODE ? undefined : clerkUser?.imageUrl;

  const handleSignOut = async () => {
    if (DEMO_MODE) return;
    await signOut();
    navigate('/');
  };

  const handleLanguageChange = (lang: string) => {
    i18n.changeLanguage(lang);
    localStorage.setItem('ui-language', lang);
    document.documentElement.dir = lang === 'he' || lang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
  };

  // Prefix helper — adds /:userId when impersonating
  const p = (path: string) => userId ? `/${userId}${path}` : path;

  if (userId) {
    // ── Impersonation mode navbar ──────────────────────────────────────
    return (
      <header className="sticky top-0 z-40 border-b border-amber-300 bg-amber-50 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
          {/* Left side: exit button + logo */}
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" className="border-amber-400 bg-amber-100 hover:bg-amber-200 text-amber-900 gap-1.5" asChild>
              <Link to={`/admin/users/${userId}`}>
                <ArrowRight className="h-4 w-4" />
                <span className="hidden sm:inline">חזור לניהול</span>
              </Link>
            </Button>
            <Link to={p('/dashboard')} className="flex items-center gap-2 text-xl font-bold text-amber-900">
              <FileText className="h-6 w-6" />
              <span className="hidden sm:inline">יוצר תלושי שכר</span>
            </Link>
          </div>

          {/* Nav links — all prefixed */}
          <nav className="flex items-center gap-2">
            <Button variant="ghost" size="sm" className="text-amber-900 hover:bg-amber-100" asChild>
              <Link to={p('/companies')} className="flex items-center gap-1.5">
                <Building2 className="h-4 w-4" />
                <span className="hidden sm:inline">{t('nav.companies')}</span>
              </Link>
            </Button>

            <Button variant="ghost" size="sm" className="text-amber-900 hover:bg-amber-100" asChild>
              <Link to={p('/employees')} className="flex items-center gap-1.5">
                <Users className="h-4 w-4" />
                <span className="hidden sm:inline">{t('nav.employees')}</span>
              </Link>
            </Button>

            <select
              value={i18n.language}
              onChange={(e) => handleLanguageChange(e.target.value)}
              className="hidden sm:block text-sm bg-transparent border border-amber-400 rounded-md px-2 py-1 cursor-pointer focus:outline-none focus:ring-1 focus:ring-amber-400 text-amber-900"
              aria-label="Language"
            >
              {LANGUAGE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>

            {/* Impersonated user identity */}
            <div className="relative hidden items-center gap-2 sm:flex ms-2 group cursor-default">
              <UserCog className="h-4 w-4 text-amber-700" />
              <span className="text-sm font-semibold text-amber-900">
                {impersonatedUser?.fullName ?? '...'}
              </span>
              <Badge variant="outline" className="border-amber-400 text-amber-700 text-xs">
                מנהל עבורו
              </Badge>
              {/* Hover card */}
              <div className="absolute top-full end-0 mt-2 hidden group-hover:flex flex-col gap-1 z-50 min-w-[200px] rounded-lg border border-amber-200 bg-white shadow-lg p-3 text-sm">
                <span className="font-semibold text-amber-900">{impersonatedUser?.fullName}</span>
                <span className="text-muted-foreground">{impersonatedUser?.email}</span>
                {impersonatedUser?.phone && (
                  <span className="text-muted-foreground">{impersonatedUser.phone}</span>
                )}
              </div>
            </div>
          </nav>
        </div>
      </header>
    );
  }

  // ── Normal navbar ──────────────────────────────────────────────────────
  return (
    <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        <Link to="/dashboard" className="flex items-center gap-2 text-xl font-bold text-primary">
          <FileText className="h-6 w-6" />
          <span className="hidden sm:inline">יוצר תלושי שכר</span>
        </Link>

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
            <Link to="/companies" className="flex items-center gap-1.5">
              <Building2 className="h-4 w-4" />
              <span className="hidden sm:inline">{t('nav.companies')}</span>
            </Link>
          </Button>

          <Button variant="ghost" size="sm" asChild>
            <Link to="/employees" className="flex items-center gap-1.5">
              <Users className="h-4 w-4" />
              <span className="hidden sm:inline">{t('nav.employees')}</span>
            </Link>
          </Button>

          <Button variant="ghost" size="sm" asChild>
            <Link to="/manual" className="flex items-center gap-1.5">
              <BookOpen className="h-4 w-4" />
              <span className="hidden sm:inline">{t('nav.manual')}</span>
            </Link>
          </Button>

          <Button variant="ghost" size="sm" asChild>
            <Link to="/profile" className="flex items-center gap-1.5">
              <Settings className="h-4 w-4" />
              <span className="hidden sm:inline">{t('nav.profile')}</span>
            </Link>
          </Button>

          <select
            value={i18n.language}
            onChange={(e) => handleLanguageChange(e.target.value)}
            className="hidden sm:block text-sm bg-transparent border border-input rounded-md px-2 py-1 cursor-pointer focus:outline-none focus:ring-1 focus:ring-ring"
            aria-label="Language"
          >
            {LANGUAGE_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>

          <div className="hidden items-center gap-2 sm:flex">
            {avatarUrl && (
              <img src={avatarUrl} alt={displayName ?? ''} className="h-8 w-8 rounded-full" />
            )}
            <span className="text-sm text-muted-foreground">{displayName}</span>
          </div>

          <Button variant="ghost" size="sm" onClick={handleSignOut} className="flex items-center gap-1.5">
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">{t('nav.signOut')}</span>
          </Button>
        </nav>
      </div>
    </header>
  );
}
