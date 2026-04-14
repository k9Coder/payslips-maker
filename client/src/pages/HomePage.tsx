import { useAuth } from '@clerk/clerk-react';
import { Navigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { PageLoading } from '@/shared/components/LoadingSpinner';
import { BRAND_NAME, BRAND_COLORS } from '@/shared/components/brand/brand';

const DEMO_MODE = import.meta.env.VITE_DEMO_MODE === 'true';

// ─── Sub-sections ────────────────────────────────────────────────────────────

function HeroBadge() {
  return (
    <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-sm text-[#bfdbfe]">
      <span aria-hidden="true">✓</span>
      <span>מחושב לפי חוקי העבודה הישראלי</span>
    </div>
  );
}

function HeroActions() {
  return (
    <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
      <Button
        size="lg"
        className="bg-white font-bold text-[#1e3a8a] hover:bg-[#f0f4ff] min-w-[160px]"
        asChild
      >
        <Link to="/sign-in">כניסה למערכת</Link>
      </Button>
      <Button
        size="lg"
        variant="outline"
        className="border-white/40 bg-transparent text-white hover:bg-white/10 hover:text-white min-w-[160px]"
        asChild
      >
        <Link to="/sign-up">הרשמה חינם</Link>
      </Button>
    </div>
  );
}

function HeroSection() {
  return (
    <div
      className="px-6 py-20 text-center text-white"
      style={{
        background: `linear-gradient(160deg, ${BRAND_COLORS.primaryHex} 0%, #1d4ed8 55%, #2563eb 100%)`,
      }}
    >
      <div className="mx-auto max-w-2xl">
        <HeroBadge />
        <h1 className="mb-4 text-4xl font-black leading-tight tracking-tight sm:text-5xl">
          תלושי שכר לעובדים זרים —{' '}
          <span className="text-[#93c5fd]">בקלות ובמהירות</span>
        </h1>
        <p className="mx-auto mb-10 max-w-xl text-lg leading-relaxed text-[#bfdbfe]">
          מערכת מקצועית ליצירת תלושי שכר תקינים, חישוב מס אוטומטי ושליחה ישירה לעובד —
          בעברית ובשפת האם שלו.
        </p>
        <HeroActions />
      </div>
    </div>
  );
}

interface TrustItemProps {
  icon: string;
  title: string;
  subtitle: string;
}

function TrustItem({ icon, title, subtitle }: TrustItemProps) {
  return (
    <div className="flex flex-col items-center gap-1 text-center">
      <span className="text-2xl" aria-hidden="true">{icon}</span>
      <span className="text-sm font-bold text-[#1e3a8a]">{title}</span>
      <span className="text-xs text-muted-foreground">{subtitle}</span>
    </div>
  );
}

const TRUST_ITEMS: TrustItemProps[] = [
  { icon: '🧮', title: 'חישוב מס אוטומטי',  subtitle: 'מס הכנסה, ביטוח לאומי ובריאות' },
  { icon: '🌍', title: '7 שפות',             subtitle: 'עברית, פיליפינית, תאילנדית ועוד' },
  { icon: '📄', title: 'PDF בלחיצה',         subtitle: 'הורדה ושליחה ישירה לעובד' },
];

function TrustBar() {
  return (
    <div className="border-b border-border bg-background px-6 py-8">
      <div className="mx-auto flex max-w-3xl flex-col items-center gap-6 sm:flex-row sm:justify-around">
        {TRUST_ITEMS.map((item) => (
          <TrustItem key={item.title} {...item} />
        ))}
      </div>
    </div>
  );
}

interface FeatureCardProps {
  icon: string;
  title: string;
  description: string;
}

function FeatureCard({ icon, title, description }: FeatureCardProps) {
  return (
    <div className="rounded-xl border border-border bg-white p-5 shadow-sm">
      <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-[#eff6ff] text-xl" aria-hidden="true">
        {icon}
      </div>
      <h3 className="mb-1.5 text-sm font-bold text-[#1e3a8a]">{title}</h3>
      <p className="text-xs leading-relaxed text-muted-foreground">{description}</p>
    </div>
  );
}

const FEATURE_CARDS: FeatureCardProps[] = [
  {
    icon: '🏢',
    title: 'ניהול חברות ועובדים',
    description: 'שמור פרטי חברות ועובדים — ייוכנסו אוטומטית לכל תלוש חדש.',
  },
  {
    icon: '⚖️',
    title: 'תאימות משפטית מלאה',
    description: 'מחושב לפי פקודת מס הכנסה, ביטוח לאומי, ופנסיית חובה.',
  },
  {
    icon: '✉️',
    title: 'שליחה ישירה לעובד',
    description: 'שלח את התלוש ישירות לאימייל של העובד בשפה שלו.',
  },
];

function FeaturesSection() {
  return (
    <div className="bg-[#f8faff] px-6 py-14">
      <div className="mx-auto grid max-w-3xl grid-cols-1 gap-5 sm:grid-cols-3">
        {FEATURE_CARDS.map((card) => (
          <FeatureCard key={card.title} {...card} />
        ))}
      </div>
    </div>
  );
}

// ─── Page ────────────────────────────────────────────────────────────────────

export function HomePage() {
  const { isLoaded, isSignedIn } = useAuth();

  if (DEMO_MODE) return <Navigate to="/dashboard" replace />;
  if (!isLoaded) return <PageLoading />;
  if (isSignedIn) return <Navigate to="/dashboard" replace />;

  return (
    // Negative margin breaks out of Layout's padding for full-bleed sections
    <div className="-mx-4 -my-6 sm:-mx-6 lg:-mx-8" aria-label={`${BRAND_NAME} — דף הבית`}>
      <HeroSection />
      <TrustBar />
      <FeaturesSection />
    </div>
  );
}
