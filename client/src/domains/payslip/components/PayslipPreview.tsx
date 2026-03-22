import { Suspense } from 'react';
import { PDFDownloadLink, PDFViewer } from '@react-pdf/renderer';
import { useTranslation } from 'react-i18next';
import { Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PageLoading } from '@/shared/components/LoadingSpinner';
import type { IForm } from '@payslips-maker/shared';
import { formatPeriod } from '@/lib/utils';

import { PayslipPDF } from './PayslipPDF';

interface PayslipPreviewProps {
  form: IForm;
}

export function PayslipPreview({ form }: PayslipPreviewProps) {
  const { t } = useTranslation();

  const fileName = `תלוש-שכר-${form.employeeInfo.fullName}-${formatPeriod(form.period.month, form.period.year)}.pdf`;

  return (
    <div className="space-y-4">
      {/* Download button */}
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold">{t('payslip.title')}</h3>
        <PDFDownloadLink
          document={<PayslipPDF form={form} />}
          fileName={fileName}
          style={{ textDecoration: 'none' }}
        >
          <Button className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            {t('payslip.downloadPdf')}
          </Button>
        </PDFDownloadLink>
      </div>

      {/* Inline PDF viewer - lazy loaded */}
      <div className="rounded-lg border overflow-hidden" style={{ height: '70vh' }}>
        <Suspense fallback={<PageLoading />}>
          <PDFViewer width="100%" height="100%" showToolbar={false}>
            <PayslipPDF form={form} />
          </PDFViewer>
        </Suspense>
      </div>
    </div>
  );
}
