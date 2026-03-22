import { useAuth } from '@clerk/clerk-react';
import { Navigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PageLoading } from '@/shared/components/LoadingSpinner';

const DEMO_MODE = import.meta.env.VITE_DEMO_MODE === 'true';

export function HomePage() {
  const { isLoaded, isSignedIn } = useAuth();
  const { t } = useTranslation();

  if (DEMO_MODE) return <Navigate to="/dashboard" replace />;
  if (!isLoaded) return <PageLoading />;
  if (isSignedIn) return <Navigate to="/dashboard" replace />;

  return (
    <div className="flex min-h-[80vh] flex-col items-center justify-center gap-8 text-center">
      <div className="flex flex-col items-center gap-4">
        <div className="rounded-full bg-primary/10 p-6">
          <FileText className="h-16 w-16 text-primary" />
        </div>
        <h1 className="text-4xl font-bold sm:text-5xl">{t('home.title')}</h1>
        <p className="max-w-md text-xl text-muted-foreground">{t('home.subtitle')}</p>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row">
        <Button size="lg" asChild>
          <Link to="/sign-in">{t('home.signIn')}</Link>
        </Button>
        <Button size="lg" variant="outline" asChild>
          <Link to="/sign-up">{t('home.signUp')}</Link>
        </Button>
      </div>
    </div>
  );
}
