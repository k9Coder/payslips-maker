import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PageLoading } from '@/shared/components/LoadingSpinner';
import { MultiLangInput } from '@/shared/components/MultiLangInput';
import { useEmployee, useCreateEmployee, useUpdateEmployee } from '../hooks/useEmployees';
import type { SupportedLanguage, MultiLangString } from '@payslips-maker/shared';

const supportedLanguages = ['he', 'en', 'fil', 'th', 'am', 'hi', 'ar'] as const;
const multiLangStringSchema = z.union([
  z.string().min(2, 'שם מלא חייב להכיל לפחות 2 תווים'),
  z.record(z.enum(supportedLanguages), z.string().optional()).refine(
    (val) => Object.values(val).some((v) => v && v.trim().length >= 2),
    { message: 'נדרש שם בלפחות שפה אחת' }
  ),
]) as unknown as z.ZodType<MultiLangString>;

const schema = z.object({
  fullName: multiLangStringSchema,
  passportNumber: z.string().min(5, 'מספר דרכון חייב להכיל לפחות 5 תווים'),
  nationality: z.string().min(2, 'נא לציין לאום'),
  email: z.string().email('כתובת דוא"ל לא תקינה').optional().or(z.literal('')),
  phone: z.string().optional(),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'חייב להיות בפורמט YYYY-MM-DD'),
  preferredLanguage: z.enum(['he', 'en', 'fil', 'th', 'am', 'hi', 'ar']).default('he'),
  weeklyRestDay: z.enum(['friday', 'saturday', 'sunday']).default('saturday'),
  hasPocketMoney: z.boolean().default(false),
  medicalInsuranceMonthlyCost: z.number().min(0).default(0),
  accommodationDeduction: z.number().min(0).default(0),
  utilitiesDeduction: z.number().min(0).max(94.34).default(0),
  hasFoodDeduction: z.boolean().default(false),
});

type FormValues = z.infer<typeof schema>;

const NATIONALITY_VALUES = [
  'philippines', 'thailand', 'india', 'nigeria', 'sri lanka', 'moldova', 'ukraine', 'other',
] as const;

const LANGUAGE_NAMES: Record<SupportedLanguage, string> = {
  he: 'עברית',
  en: 'English',
  fil: 'Filipino',
  th: 'ภาษาไทย (Thai)',
  am: 'አማርኛ (Amharic)',
  hi: 'हिन्दी (Hindi)',
  ar: 'عربي (Arabic)',
};

interface Props {
  mode: 'create' | 'edit';
}

export function EmployeeFormPage({ mode }: Props) {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const { data: existing, isLoading } = useEmployee(id ?? '');
  const createEmployee = useCreateEmployee();
  const updateEmployee = useUpdateEmployee(id ?? '');

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    control,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      preferredLanguage: 'he',
      weeklyRestDay: 'saturday',
      hasPocketMoney: false,
      medicalInsuranceMonthlyCost: 0,
      accommodationDeduction: 0,
      utilitiesDeduction: 0,
      hasFoodDeduction: false,
    },
  });

  useEffect(() => {
    if (mode === 'edit' && existing) {
      reset({
        fullName: existing.fullName,
        passportNumber: existing.passportNumber,
        nationality: existing.nationality,
        email: existing.email ?? '',
        phone: existing.phone ?? '',
        startDate: existing.startDate,
        preferredLanguage: existing.preferredLanguage,
        weeklyRestDay: existing.weeklyRestDay ?? 'saturday',
        hasPocketMoney: existing.hasPocketMoney ?? false,
        medicalInsuranceMonthlyCost: existing.medicalInsuranceMonthlyCost ?? 0,
        accommodationDeduction: existing.accommodationDeduction ?? 0,
        utilitiesDeduction: existing.utilitiesDeduction ?? 0,
        hasFoodDeduction: existing.hasFoodDeduction ?? false,
      });
    }
  }, [existing, mode, reset]);

  const onSubmit = async (values: FormValues) => {
    if (mode === 'create') {
      await createEmployee.mutateAsync(values);
    } else {
      await updateEmployee.mutateAsync(values);
    }
    navigate('/employees');
  };

  if (mode === 'edit' && isLoading) return <PageLoading />;

  const nationality = watch('nationality');
  const preferredLanguage = watch('preferredLanguage');

  return (
    <div className="mx-auto max-w-xl space-y-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-muted-foreground">
        <button
          type="button"
          onClick={() => navigate('/employees')}
          className="hover:text-foreground flex items-center gap-1"
        >
          <ArrowRight className="h-4 w-4" />
          {t('employees.pageTitle')}
        </button>
        <span>/</span>
        <span className="text-foreground">{mode === 'create' ? t('employees.newEmployee') : t('employees.editEmployee')}</span>
      </nav>

      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">
            {mode === 'create' ? t('employees.addNewEmployee') : t('employees.editEmployee')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Full name */}
            <div className="space-y-1.5">
              <Label>{t('employees.fields.fullName')} *</Label>
              <Controller
                name="fullName"
                control={control}
                defaultValue={{}}
                render={({ field }) => (
                  <MultiLangInput
                    value={typeof field.value === 'string' ? { he: field.value } : (field.value ?? {})}
                    onChange={field.onChange}
                    required
                  />
                )}
              />
              {errors.fullName && (
                <p className="text-sm text-destructive">{errors.fullName.message as string}</p>
              )}
            </div>

            {/* Passport */}
            <div className="space-y-1.5">
              <Label htmlFor="passportNumber">{t('employees.fields.passport')} *</Label>
              <Input id="passportNumber" {...register('passportNumber')} dir="ltr" />
              {errors.passportNumber && (
                <p className="text-sm text-destructive">{errors.passportNumber.message}</p>
              )}
            </div>

            {/* Nationality */}
            <div className="space-y-1.5">
              <Label>{t('employees.fields.nationality')} *</Label>
              <Select
                value={nationality}
                onValueChange={(val) => setValue('nationality', val, { shouldValidate: true })}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t('employees.placeholders.selectNationality')} />
                </SelectTrigger>
                <SelectContent>
                  {NATIONALITY_VALUES.map((val) => (
                    <SelectItem key={val} value={val}>
                      {t(`employees.nationalities.${val.replace(' ', '_')}`)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {nationality === 'other' && (
                <Input
                  placeholder={t('employees.placeholders.otherNationality')}
                  onChange={(e) => setValue('nationality', e.target.value, { shouldValidate: true })}
                  className="mt-2"
                />
              )}
              {errors.nationality && (
                <p className="text-sm text-destructive">{errors.nationality.message}</p>
              )}
            </div>

            {/* Start date */}
            <div className="space-y-1.5">
              <Label htmlFor="startDate">{t('employees.fields.startDate')} *</Label>
              <Input id="startDate" type="date" {...register('startDate')} dir="ltr" />
              {errors.startDate && (
                <p className="text-sm text-destructive">{errors.startDate.message}</p>
              )}
            </div>

            {/* Email */}
            <div className="space-y-1.5">
              <Label htmlFor="email">{t('employees.fields.email')}</Label>
              <Input id="email" type="email" {...register('email')} dir="ltr" />
              {errors.email && (
                <p className="text-sm text-destructive">{errors.email.message}</p>
              )}
            </div>

            {/* Phone */}
            <div className="space-y-1.5">
              <Label htmlFor="phone">{t('employees.fields.phone')}</Label>
              <Input id="phone" type="tel" {...register('phone')} dir="ltr" />
            </div>

            {/* Preferred language */}
            <div className="space-y-1.5">
              <Label>{t('employees.fields.preferredLanguage')}</Label>
              <Select
                value={preferredLanguage}
                onValueChange={(val) =>
                  setValue('preferredLanguage', val as SupportedLanguage, { shouldValidate: true })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(Object.entries(LANGUAGE_NAMES) as [SupportedLanguage, string][]).map(
                    ([code, label]) => (
                      <SelectItem key={code} value={code}>
                        {label}
                      </SelectItem>
                    )
                  )}
                </SelectContent>
              </Select>
            </div>

            {/* Contract settings */}
            <div className="space-y-4 border-t pt-4">
              <h3 className="text-base font-semibold text-[#1B2A4A]">הגדרות חוזה</h3>

              <div className="space-y-1.5">
                <Label>יום מנוחה שבועי</Label>
                <select
                  {...register('weeklyRestDay')}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="saturday">שבת</option>
                  <option value="friday">שישי</option>
                  <option value="sunday">ראשון</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <input type="checkbox" id="hasPocketMoney" {...register('hasPocketMoney')} />
                <Label htmlFor="hasPocketMoney">דמי כיס בחוזה (₪100 לסוף שבוע)</Label>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="medicalInsuranceMonthlyCost">עלות ביטוח רפואי חודשית בפועל (₪)</Label>
                <Input id="medicalInsuranceMonthlyCost" type="number" min="0" step="0.01" dir="ltr" {...register('medicalInsuranceMonthlyCost', { valueAsNumber: true })} />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="accommodationDeduction">ניכוי מגורים חודשי (₪)</Label>
                <Input id="accommodationDeduction" type="number" min="0" step="0.01" dir="ltr" {...register('accommodationDeduction', { valueAsNumber: true })} />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="utilitiesDeduction">הוצאות נלוות (₪) — מקסימום ₪94.34</Label>
                <Input id="utilitiesDeduction" type="number" min="0" max="94.34" step="0.01" dir="ltr" {...register('utilitiesDeduction', { valueAsNumber: true })} />
              </div>

              <div className="flex items-center gap-2">
                <input type="checkbox" id="hasFoodDeduction" {...register('hasFoodDeduction')} />
                <Label htmlFor="hasFoodDeduction">ניכוי כלכלה (עד 10% משכר) — הסכמה בכתב בחוזה</Label>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <Button
                type="submit"
                disabled={isSubmitting}
                className="flex-1"
              >
                {mode === 'create' ? t('employees.addEmployee') : t('employees.saveChanges')}
              </Button>
              <Button type="button" variant="outline" onClick={() => navigate('/employees')}>
                {t('common.cancel')}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
