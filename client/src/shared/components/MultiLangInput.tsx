import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { resolveMultiLangString } from '@payslips-maker/shared';
import type { MultiLangString, SupportedLanguage } from '@payslips-maker/shared';

const LANGUAGES: { code: SupportedLanguage; label: string; short: string }[] = [
  { code: 'he', label: 'עברית',       short: 'HE'  },
  { code: 'en', label: 'English',     short: 'EN'  },
  { code: 'ar', label: 'عربي',        short: 'AR'  },
  { code: 'fil', label: 'Filipino',   short: 'FIL' },
  { code: 'th', label: 'ภาษาไทย',     short: 'TH'  },
  { code: 'am', label: 'አማርኛ',        short: 'AM'  },
  { code: 'hi', label: 'हिन्दी',       short: 'HI'  },
];

interface MultiLangInputProps {
  value: MultiLangString;
  onChange: (val: MultiLangString) => void;
  placeholder?: string;
  required?: boolean;
  readOnly?: boolean;
  compact?: boolean;
  id?: string;
}

export function MultiLangInput({
  value,
  onChange,
  placeholder,
  required,
  readOnly,
  compact,
  id,
}: MultiLangInputProps) {
  const { i18n } = useTranslation();
  const currentLang = i18n.language as SupportedLanguage;

  // Default active tab: current UI lang, or first filled lang, or 'he'
  const [activeTab, setActiveTab] = useState<SupportedLanguage>(() => {
    if (LANGUAGES.some((l) => l.code === currentLang)) return currentLang;
    const filled = LANGUAGES.find((l) => value[l.code]?.trim());
    return filled?.code ?? 'he';
  });

  if (readOnly) {
    return (
      <p className="text-sm py-2">
        {resolveMultiLangString(value, currentLang) || (
          <span className="text-muted-foreground">—</span>
        )}
      </p>
    );
  }

  const handleChange = (text: string) => {
    onChange({ ...value, [activeTab]: text });
  };

  const activeLang = LANGUAGES.find((l) => l.code === activeTab)!;
  const isRtl = activeTab === 'he' || activeTab === 'ar';

  return (
    <div className={cn('space-y-1.5', compact && 'space-y-1')}>
      {/* Language tab strip */}
      <div className="flex flex-wrap gap-1">
        {LANGUAGES.map(({ code, label, short }) => {
          const hasValue = !!(value[code]?.trim());
          const isActive = code === activeTab;
          const isUiLang = code === currentLang;

          return (
            <button
              key={code}
              type="button"
              onClick={() => setActiveTab(code)}
              title={label}
              className={cn(
                'relative px-2 rounded text-xs font-medium border transition-colors',
                compact ? 'py-0.5' : 'py-1',
                isActive
                  ? 'bg-primary text-primary-foreground border-primary'
                  : isUiLang
                  ? 'border-ring/60 text-foreground hover:bg-accent'
                  : 'border-border text-muted-foreground hover:border-ring/60 hover:text-foreground hover:bg-accent'
              )}
            >
              {short}
              {/* Filled-value dot */}
              {hasValue && (
                <span
                  className={cn(
                    'absolute -top-0.5 -right-0.5 h-1.5 w-1.5 rounded-full',
                    isActive ? 'bg-primary-foreground' : 'bg-primary'
                  )}
                />
              )}
            </button>
          );
        })}
      </div>

      {/* Single input for active language */}
      <Input
        id={id}
        value={value[activeTab] ?? ''}
        onChange={(e) => handleChange(e.target.value)}
        placeholder={placeholder ?? activeLang.label}
        required={required && activeTab === 'he'}
        dir={isRtl ? 'rtl' : 'ltr'}
        className={cn(compact && 'h-8 text-sm')}
      />
    </div>
  );
}
