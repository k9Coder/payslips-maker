import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

interface UpgradePromptProps {
  open:     boolean;
  onClose:  () => void;
  reason?:  'pdf_limit' | 'email' | 'final_settlement' | 'worklog' | 'employee';
}

const MESSAGES: Record<NonNullable<UpgradePromptProps['reason']>, { title: string; description: string }> = {
  pdf_limit:        { title: 'הגעת למגבלת ה-PDF החינמית',   description: 'ניצלת את 3 ה-PDF החינמיים לעובד זה. שדרג מנוי כדי ליצור PDFs ללא הגבלה.' },
  email:            { title: 'שליחת מייל דורשת מנוי',       description: 'שדרג מנוי לעובד זה כדי לשלוח תלושי שכר במייל.' },
  final_settlement: { title: 'גמר חשבון דורש מנוי',         description: 'שדרג מנוי לעובד זה כדי ליצור טפסי גמר חשבון.' },
  worklog:          { title: 'יומן עבודה דורש מנוי',         description: 'שדרג מנוי לעובד זה כדי לגשת ליומן העבודה.' },
  employee:         { title: 'הוספת עובד דורשת מנוי',       description: 'שדרג מנוי כדי להוסיף עובדים נוספים.' },
};

export function UpgradePrompt({ open, onClose, reason = 'pdf_limit' }: UpgradePromptProps) {
  const navigate = useNavigate();
  const { title, description } = MESSAGES[reason];

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <div className="flex justify-end gap-3 pt-2">
          <Button variant="outline" onClick={onClose}>סגור</Button>
          <Button onClick={() => { onClose(); navigate('/subscriptions'); }}>
            שדרג מנוי
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
