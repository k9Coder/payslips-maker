import { useAuth, useUser } from '@clerk/clerk-react';
import { Navigate, Outlet } from 'react-router-dom';
import { PageLoading } from '@/shared/components/LoadingSpinner';
import { useCurrentUser } from '@/hooks/useCurrentUser';

const DEMO_MODE = import.meta.env.VITE_DEMO_MODE === 'true';

const ALLOWED_EMAILS = ['Holdingliat@gmail.com', 'yarin0600@gmail.com', 'omermfla@gmail.com'];

interface ProtectedRouteProps {
  requireAdmin?: boolean;
}

export function ProtectedRoute({ requireAdmin = false }: ProtectedRouteProps) {
  const { isLoaded, isSignedIn } = useAuth();
  const { user } = useUser();
  const { data: currentUser, isLoading: userLoading } = useCurrentUser();

  if (!DEMO_MODE && (!isLoaded || (requireAdmin && userLoading))) {
    return <PageLoading />;
  }

  if (!DEMO_MODE && !isSignedIn) {
    return <Navigate to="/sign-in" replace />;
  }

  const email = user?.primaryEmailAddress?.emailAddress;
  if (!DEMO_MODE && email && !ALLOWED_EMAILS.includes(email)) {
    return <Navigate to="/under-development" replace />;
  }

  if (requireAdmin && currentUser && !currentUser.isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}
