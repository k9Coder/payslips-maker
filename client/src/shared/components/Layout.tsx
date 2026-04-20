import { Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '@clerk/clerk-react';
import { Sidebar } from './Sidebar';
import { MobileHeader } from './MobileHeader';
import { Footer } from './Footer';
import { SidebarProvider } from '../context/SidebarContext';
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
    <SidebarProvider>
      <div className="flex h-screen overflow-hidden bg-gray-50" dir="rtl">
        {/* Desktop sidebar */}
        <Sidebar />

        {/* Main content area */}
        <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
          <ImpersonationBanner />
          {/* Mobile top header — hidden on md+ */}
          <MobileHeader />
          <main className="flex-1 overflow-y-auto p-4 md:p-6 flex flex-col">
            <div className="flex-1">
              <Outlet />
            </div>
            <Footer />
          </main>
        </div>
      </div>
      <Toaster />
    </SidebarProvider>
  );
}
