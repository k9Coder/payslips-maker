import { useState, Suspense } from 'react';
import { PDFViewer, pdf } from '@react-pdf/renderer';
import { Download } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { PageLoading } from '@/shared/components/LoadingSpinner';
import type { IForm, SupportedLanguage } from '@payslips-maker/shared';

const LANGUAGE_LABELS: Record<string, Record<SupportedLanguage, string>> = {
  he: { he: 'עברית',   en: 'אנגלית',    ar: 'ערבית',      fil: 'פיליפינית', th: 'תאילנדית',   am: 'אמהרית',     hi: 'הינדי'      },
  en: { he: 'Hebrew',  en: 'English',   ar: 'Arabic',     fil: 'Filipino',  th: 'Thai',       am: 'Amharic',    hi: 'Hindi'      },
  ar: { he: 'عبري',    en: 'إنجليزي',   ar: 'عربي',       fil: 'فلبيني',    th: 'تايلاندي',   am: 'أمهرية',     hi: 'هندي'       },
  fil:{ he: 'Hebreo',  en: 'Ingles',    ar: 'Arabe',      fil: 'Filipino',  th: 'Thai',       am: 'Amharic',    hi: 'Hindi'      },
  th: { he: 'ฮีบรู',   en: 'อังกฤษ',    ar: 'อาหรับ',     fil: 'ฟิลิปปินส์', th: 'ไทย',       am: 'อัมฮาริก',   hi: 'ฮินดี'      },
  am: { he: 'ዕብራይስጥ', en: 'እንግሊዝኛ',  ar: 'አረብኛ',       fil: 'ፊሊፒኖ',     th: 'ታይ',         am: 'አማርኛ',       hi: 'ሂንዲ'        },
  hi: { he: 'हिब्रू',  en: 'अंग्रेजी',  ar: 'अरबी',       fil: 'फ़िलिपीनो',  th: 'थाई',        am: 'अम्हारिक',   hi: 'हिंदी'      },
};

const LANG_KEYS: SupportedLanguage[] = ['he', 'en', 'ar', 'fil', 'th', 'am', 'hi'];

interface PDFDownloadDialogProps {
  open: boolean;
  onClose: () => void;
  defaultLanguage: SupportedLanguage;
  form: IForm;
  PDFDocument: (props: { form: IForm; language: SupportedLanguage }) => React.ReactElement;
  fileName: string;
}

export function PDFDownloadDialog({
  open,
  onClose,
  defaultLanguage,
  form,
  PDFDocument,
  fileName,
}: PDFDownloadDialogProps) {
  const { i18n } = useTranslation();
  const [language, setLanguage] = useState<SupportedLanguage>(defaultLanguage);
  const [downloading, setDownloading] = useState(false);

  const labels = LANGUAGE_LABELS[i18n.language] ?? LANGUAGE_LABELS.he;
  const languageOptions = LANG_KEYS.map((lang) => ({ value: lang, label: labels[lang] }));

  async function handleDownload() {
    setDownloading(true);
    try {
      const blob = await pdf(<PDFDocument form={form} language={language} />).toBlob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${fileName}-${language}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setDownloading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-5xl w-full h-[90vh] flex flex-col gap-3">
        <DialogHeader>
          <DialogTitle>הורדת PDF</DialogTitle>
        </DialogHeader>

        {/* Language picker */}
        <div className="flex flex-wrap gap-2">
          {languageOptions.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setLanguage(opt.value)}
              className={`rounded-full border px-3 py-1 text-sm transition-colors ${
                language === opt.value
                  ? 'border-primary bg-primary text-primary-foreground'
                  : 'border-border bg-background hover:bg-muted'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {/* Download button */}
        <div className="flex justify-end">
          <Button className="flex items-center gap-2" onClick={handleDownload} disabled={downloading}>
            <Download className="h-4 w-4" />
            {downloading ? 'מכין...' : 'הורד PDF'}
          </Button>
        </div>

        {/* Preview */}
        <div className="flex-1 rounded-lg border overflow-hidden min-h-0">
          <Suspense fallback={<PageLoading />}>
            <PDFViewer key={language} width="100%" height="100%" showToolbar={false}>
              <PDFDocument form={form} language={language} />
            </PDFViewer>
          </Suspense>
        </div>
      </DialogContent>
    </Dialog>
  );
}
