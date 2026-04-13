import { useTranslation } from 'react-i18next';
import { Building2, Users, FileText, BookOpen, Download, Star } from 'lucide-react';

const SECTIONS = [
  { key: 'companies', icon: Building2 },
  { key: 'employees', icon: Users },
  { key: 'payslip', icon: FileText },
  { key: 'fields', icon: BookOpen },
  { key: 'export', icon: Download },
  { key: 'subscription', icon: Star },
] as const;

export function ManualPage() {
  const { t } = useTranslation();

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      <h1 className="mb-2 text-3xl font-bold text-primary">{t('manual.title')}</h1>
      <p className="mb-8 text-muted-foreground">{t('manual.toc')}</p>

      {/* Table of contents */}
      <nav className="mb-10 rounded-lg border bg-muted/40 p-4">
        <ul className="space-y-1">
          {SECTIONS.map(({ key, icon: Icon }) => (
            <li key={key}>
              <button
                onClick={() => scrollTo(`manual-${key}`)}
                className="flex w-full items-center gap-2 rounded-md px-3 py-1.5 text-sm hover:bg-accent hover:text-accent-foreground transition-colors text-start"
              >
                <Icon className="h-4 w-4 shrink-0 text-muted-foreground" />
                {t(`manual.${key}.title`)}
              </button>
            </li>
          ))}
        </ul>
      </nav>

      {/* Sections */}
      <div className="space-y-10">
        {SECTIONS.map(({ key, icon: Icon }) => (
          <section key={key} id={`manual-${key}`} className="scroll-mt-20">
            <div className="mb-3 flex items-center gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10">
                <Icon className="h-5 w-5 text-primary" />
              </div>
              <h2 className="text-xl font-semibold">{t(`manual.${key}.title`)}</h2>
            </div>
            <p className="leading-relaxed text-muted-foreground ps-12">
              {t(`manual.${key}.content`)}
            </p>
          </section>
        ))}
      </div>
    </div>
  );
}
