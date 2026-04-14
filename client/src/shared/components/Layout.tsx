import { Outlet } from 'react-router-dom';
import { useAuth } from '@clerk/clerk-react';
import { Navbar } from './Navbar';
import { Footer } from './Footer';
import { Toaster } from '@/components/ui/toaster';

const DEMO_MODE = import.meta.env.VITE_DEMO_MODE === 'true';

export function Layout() {
  const { isSignedIn: clerkSignedIn } = useAuth();
  const isSignedIn = DEMO_MODE || clerkSignedIn;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {isSignedIn && <Navbar />}
      {DEMO_MODE && (
        <div className="border-b border-yellow-300 bg-yellow-50 py-2 text-center text-sm text-yellow-800">
          מצב הדגמה — שינויים לא נשמרים
        </div>
      )}
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 w-full flex-1">
        <Outlet />
      </main>
      <Toaster />
      <Footer />
    </div>
  );
}
