import { useState } from 'react';
import { Mail, Send } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';
import { useSendFormEmail, useEmailStatus } from '../hooks/useSendFormEmail';
import type { IEmployee, IForm, SupportedLanguage } from '@payslips-maker/shared';
import type { ReactElement } from 'react';

const LANGUAGE_OPTIONS: { value: SupportedLanguage; label: string }[] = [
  { value: 'he', label: 'עברית' },
  { value: 'en', label: 'English' },
  { value: 'ar', label: 'عربي' },
  { value: 'fil', label: 'Filipino' },
  { value: 'th', label: 'ภาษาไทย' },
  { value: 'am', label: 'አማርኛ' },
  { value: 'hi', label: 'हिन्दी' },
];

interface SendEmailDialogProps {
  open: boolean;
  onClose: () => void;
  form: IForm;
  employee: IEmployee;
  PDFDocument: (props: { form: IForm; language: SupportedLanguage }) => ReactElement;
}

export function SendEmailDialog({ open, onClose, form, employee, PDFDocument }: SendEmailDialogProps) {
  const { t } = useTranslation();
  const [language, setLanguage] = useState<SupportedLanguage>(employee.preferredLanguage);
  const [toEmail, setToEmail] = useState(employee.email ?? '');

  const { data: statusData } = useEmailStatus(form._id);
  const remaining = statusData?.remaining ?? 3;
  const atLimit = remaining === 0;

  const sendMutation = useSendFormEmail(form._id);

  const handleSend = () => {
    sendMutation.mutate(
      { form, employee, language, toEmail: toEmail || undefined, PDFDocument },
      {
        onSuccess: () => {
          toast({ title: t('email.success') });
          onClose();
        },
        onError: (err: unknown) => {
          const msg = err instanceof Error ? err.message : '';
          if (msg === 'EMAIL_RATE_LIMIT_REACHED') {
            toast({ title: t('email.limitReached'), variant: 'destructive' });
          } else if (msg === 'EMPLOYEE_NO_EMAIL') {
            toast({ title: t('email.noEmail'), variant: 'destructive' });
          } else {
            toast({ title: t('errors.generic'), variant: 'destructive' });
          }
        },
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            {t('email.dialogTitle')}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Recipient */}
          <div className="space-y-1">
            <Label>{t('email.defaultRecipient')}</Label>
            <Input
              type="email"
              value={toEmail}
              onChange={(e) => setToEmail(e.target.value)}
              placeholder="email@example.com"
              dir="ltr"
            />
          </div>

          {/* Language */}
          <div className="space-y-2">
            <Label>{t('email.language')}</Label>
            <div className="flex flex-wrap gap-2">
              {LANGUAGE_OPTIONS.map((opt) => (
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
          </div>

          {/* Remaining sends */}
          <p className={`text-sm ${atLimit ? 'text-destructive' : 'text-muted-foreground'}`}>
            {atLimit
              ? t('email.limitReached')
              : t('email.remaining', { count: remaining })}
          </p>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-1">
            <Button variant="outline" onClick={onClose}>
              {t('common.cancel')}
            </Button>
            <Button
              onClick={handleSend}
              disabled={atLimit || sendMutation.isPending || !toEmail}
              className="flex items-center gap-2"
            >
              <Send className="h-4 w-4" />
              {sendMutation.isPending ? '...' : t('email.sendButton')}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
