import { Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '@clerk/clerk-react';
import { Sidebar } from './Sidebar';
import { ImpersonationBanner } from '../../domains/admin/components/ImpersonationBanner';
import { Toaster } from '@/components/ui/toaster';

export function Layout() {
  const { isSignedIn } = useAuth();
  const { pathname } = useLocation();

  const isPublicPath =
    pathname === '/' ||
    pathname.startsWith('/sign-in') ||
    pathname.startsWith('/sign-up');

  if (isPublicPath || !isSignedIn) {
    return (
      <>
        <Outlet />
        <Toaster />
      </>
    );
  }

  return (
    <>
      <div className="flex h-screen overflow-hidden bg-gray-50" dir="rtl">
        {/* Sidebar — hidden on mobile, shown on md+ */}
        <Sidebar className="hidden md:flex" />

        {/* Main content area */}
        <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
          <ImpersonationBanner />
          <main className="flex-1 overflow-y-auto p-4 md:p-6 pb-20 md:pb-6">
            <Outlet />
          </main>
        </div>
      </div>
      <Toaster />
    </>
  );
}
