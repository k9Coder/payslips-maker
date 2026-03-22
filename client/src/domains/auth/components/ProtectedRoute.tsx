import { useAuth } from '@clerk/clerk-react';
import { Navigate, Outlet } from 'react-router-dom';
import { PageLoading } from '@/shared/components/LoadingSpinner';
import { useCurrentUser } from '@/hooks/useCurrentUser';

const DEMO_MODE = import.meta.env.VITE_DEMO_MODE === 'true';

interface ProtectedRouteProps {
  requireAdmin?: boolean;
}

export function ProtectedRoute({ requireAdmin = false }: ProtectedRouteProps) {
  const { isLoaded, isSignedIn } = useAuth();
  const { data: currentUser, isLoading: userLoading } = useCurrentUser();

  if (!DEMO_MODE && (!isLoaded || (requireAdmin && userLoading))) {
    return <PageLoading />;
  }

  if (!DEMO_MODE && !isSignedIn) {
    return <Navigate to="/sign-in" replace />;
  }

  if (requireAdmin && currentUser && !currentUser.isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}
