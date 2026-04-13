import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PageLoading } from '@/shared/components/LoadingSpinner';
import { toast } from '@/hooks/use-toast';
import { MultiLangInput } from '@/shared/components/MultiLangInput';
import { useCompany, useCreateCompany, useUpdateCompany } from '../hooks/useCompanies';
import type { MultiLangString } from '@payslips-maker/shared';

const supportedLanguages = ['he', 'en', 'fil', 'th', 'am', 'hi', 'ar'] as const;
const multiLangStringSchema = z.union([
  z.string().min(2, 'שם חברה חייב להכיל לפחות 2 תווים'),
  z.record(z.enum(supportedLanguages), z.string().optional()).refine(
    (val) => Object.values(val).some((v) => v && v.trim().length >= 2),
    { message: 'נדרש שם בלפחות שפה אחת' }
  ),
]) as unknown as z.ZodType<MultiLangString>;

const schema = z.object({
  name: multiLangStringSchema,
  ein: z.string().optional(),
  address: z.string().optional(),
  phone: z.string().optional(),
  website: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

interface Props {
  mode: 'create' | 'edit';
}

export function CompanyFormPage({ mode }: Props) {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: existing, isLoading } = useCompany(id ?? '');
  const createCompany = useCreateCompany();
  const updateCompany = useUpdateCompany(id ?? '');

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
  });

  useEffect(() => {
    if (mode === 'edit' && existing) {
      reset({
        name: existing.name,
        ein: existing.ein ?? '',
        address: existing.address ?? '',
        phone: existing.phone ?? '',
        website: existing.website ?? '',
      });
    }
  }, [existing, mode, reset]);

  const onSubmit = async (values: FormValues) => {
    try {
      if (mode === 'create') {
        await createCompany.mutateAsync(values);
      } else {
        await updateCompany.mutateAsync(values);
      }
      navigate('/companies');
    } catch (error) {
      const msg = error instanceof Error ? error.message : '';
      if (msg === 'COMPANY_LIMIT_REACHED') {
        toast({
          title: 'הגעת למגבלת החברות',
          description: 'שדרג מנוי כדי להוסיף חברות נוספות',
          variant: 'destructive',
        });
      } else {
        toast({ title: 'שגיאה בשמירה', variant: 'destructive' });
      }
    }
  };

  if (mode === 'edit' && isLoading) return <PageLoading />;

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <nav className="flex items-center gap-2 text-sm text-muted-foreground">
        <button
          type="button"
          onClick={() => navigate('/companies')}
          className="hover:text-foreground flex items-center gap-1"
        >
          <ArrowRight className="h-4 w-4" />
          החברות שלי
        </button>
        <span>/</span>
        <span className="text-foreground">{mode === 'create' ? 'חברה חדשה' : 'עריכת חברה'}</span>
      </nav>

      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">
            {mode === 'create' ? 'הוסף חברה חדשה' : 'עריכת חברה'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div className="space-y-1.5">
              <Label>שם חברה *</Label>
              <Controller
                name="name"
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
              {errors.name && (
                <p className="text-sm text-destructive">{errors.name.message as string}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="ein">מספר עוסק / ח.פ</Label>
              <Input id="ein" {...register('ein')} dir="ltr" />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="address">כתובת</Label>
              <Input id="address" {...register('address')} />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="phone">טלפון</Label>
              <Input id="phone" type="tel" {...register('phone')} dir="ltr" />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="website">אתר אינטרנט</Label>
              <Input id="website" type="url" {...register('website')} dir="ltr" />
            </div>

            <div className="flex gap-3 pt-2">
              <Button type="submit" disabled={isSubmitting} className="flex-1">
                {mode === 'create' ? 'הוסף חברה' : 'שמור שינויים'}
              </Button>
              <Button type="button" variant="outline" onClick={() => navigate('/companies')}>
                ביטול
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
