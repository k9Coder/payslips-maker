import { useClerk } from '@clerk/clerk-react';
import { Button } from '@/components/ui/button';
import { BRAND_COLORS } from '@/shared/components/brand/brand';

export function UnderDevelopmentPage() {
  const { signOut } = useClerk();

  return (
    <div
      className="flex min-h-screen flex-col items-center justify-center px-6 text-center text-white"
      style={{
        background: `linear-gradient(160deg, ${BRAND_COLORS.primaryHex} 0%, #1d4ed8 55%, #2563eb 100%)`,
      }}
    >
      <div className="mb-6 text-6xl" aria-hidden="true">🚧</div>
      <h1 className="mb-3 text-3xl font-black tracking-tight sm:text-4xl">
        המערכת בפיתוח
      </h1>
      <p className="mb-2 max-w-sm text-base leading-relaxed text-[#bfdbfe]">
        הגישה למערכת מוגבלת כרגע למשתמשים מורשים בלבד.
      </p>
      <p className="mb-8 text-sm text-[#93c5fd]">
        Under Development — Authorized Access Only
      </p>
      <Button
        variant="outline"
        className="border-white/40 bg-transparent text-white hover:bg-white/10 hover:text-white"
        onClick={() => signOut({ redirectUrl: '/' })}
      >
        התנתק
      </Button>
    </div>
  );
}
