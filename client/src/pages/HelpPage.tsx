import { useState } from 'react';
import { HelpCircle, ChevronDown } from 'lucide-react';
import { cn } from '../lib/utils';

const FAQ_ITEMS = [
  {
    q: 'איך מוסיפים עובד חדש?',
    a: 'לחץ על "כרטיסי עובדים" בתפריט הצידי, ולאחר מכן על "עובד חדש". מלא את הפרטים הנדרשים ושמור.',
  },
  {
    q: 'איך יוצרים תלוש שכר?',
    a: 'לחץ על "תלושי שכר" בתפריט, בחר "תלוש חדש", בחר עובד וחודש, ומלא את פרטי השכר. ניתן להוריד PDF או לשלוח במייל.',
  },
  {
    q: 'מה זה יומן עבודה?',
    a: 'יומן עבודה מאפשר לתעד עבור כל עובד את ימי העבודה, חופשה, מחלה, חגים ושעות נוספות. הנתונים מוזנים אוטומטית לתלוש השכר בעת יצירתו.',
  },
  {
    q: 'כיצד נתוני יומן העבודה נכנסים לתלוש?',
    a: 'כשיוצרים תלוש חדש לעובד מסוים, המערכת מושכת אוטומטית את נתוני היומן לחודש הרלוונטי ומאכלסת את שדות ימי העבודה, חופשה, מחלה ושעות נוספות.',
  },
  {
    q: 'איך משנים את שפת הממשק?',
    a: 'עבור להגדרות (סמל גלגל השיניים בתפריט) ובחר שפה תחת "שפת ממשק".',
  },
  {
    q: 'כמה עובדים ותלושים אפשר ליצור בגרסת החינם?',
    a: 'בגרסת החינם ניתן להוסיף עובד אחד ולייצר עד 10 תלושים. שדרוג למנוי מאפשר עובדים ותלושים ללא הגבלה.',
  },
  {
    q: 'איך שולחים תלוש במייל לעובד?',
    a: 'פתח תלוש קיים ולחץ על "שלח במייל". ניתן לשלוח עד 3 מיילים ליום לכל תלוש.',
  },
];

export function HelpPage() {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-2">
        <HelpCircle className="h-6 w-6 text-[#1B2A4A]" />
        <h1 className="text-2xl font-bold text-[#1B2A4A]">עזרה ומדריך</h1>
      </div>

      <p className="text-gray-500 text-sm">
        ברוכים הבאים למדריך השימוש במערכת פשוט תלוש. כאן תמצאו תשובות לשאלות הנפוצות ביותר.
      </p>

      <div className="space-y-2">
        {FAQ_ITEMS.map((item, idx) => (
          <div key={idx} className="border border-gray-200 rounded-xl overflow-hidden">
            <button
              className="w-full flex items-center justify-between px-5 py-4 text-start text-sm font-medium text-[#1B2A4A] hover:bg-gray-50 transition-colors"
              onClick={() => setOpen(open === idx ? null : idx)}
            >
              <span>{item.q}</span>
              <ChevronDown
                className={cn(
                  'h-4 w-4 text-gray-400 transition-transform shrink-0 ms-2',
                  open === idx && 'rotate-180'
                )}
              />
            </button>
            {open === idx && (
              <div className="px-5 pb-4 pt-1 text-sm text-gray-600 bg-gray-50 leading-relaxed">
                {item.a}
              </div>
            )}
          </div>
        ))}
      </div>

      <p className="text-xs text-gray-400 text-center pt-4">
        לתמיכה נוספת פנו אלינו בדוא״ל
      </p>
    </div>
  );
}
