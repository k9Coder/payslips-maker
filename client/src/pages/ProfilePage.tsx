import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useApiClient } from '@/lib/useApiClient';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { toast } from '@/hooks/use-toast';
import type { ApiResponse, IUser } from '@payslips-maker/shared';

const profileSchema = z.object({
  fullName: z.string().min(2, 'שם מלא חייב להכיל לפחות 2 תווים'),
  phone: z.string().optional(),
  employerName: z.string().optional(),
  employerTaxId: z.string().optional(),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

export function ProfilePage() {
  const { t } = useTranslation();
  const { put } = useApiClient();
  const queryClient = useQueryClient();
  const { data: currentUser, isLoading } = useCurrentUser();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    values: currentUser
      ? {
          fullName: currentUser.fullName,
          phone: currentUser.phone ?? '',
          employerName: currentUser.employerName ?? '',
          employerTaxId: currentUser.employerTaxId ?? '',
        }
      : undefined,
  });

  const mutation = useMutation({
    mutationFn: (data: ProfileFormValues) => put<ApiResponse<IUser>>('/api/users/me', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUser'] });
      toast({ title: t('common.success') });
    },
    onError: () => {
      toast({ title: t('errors.generic'), variant: 'destructive' });
    },
  });

  if (isLoading) return null;

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <h1 className="text-3xl font-bold">{t('profile.title')}</h1>

      <Card>
        <CardHeader>
          <CardTitle>{t('profile.title')}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit((data) => mutation.mutate(data))} className="space-y-5">
            <div className="flex flex-col gap-2">
              <Label htmlFor="fullName">{t('profile.fullName')}</Label>
              <Input
                id="fullName"
                {...register('fullName')}
                className={errors.fullName ? 'border-destructive' : ''}
              />
              {errors.fullName && <p className="text-sm text-destructive">{errors.fullName.message}</p>}
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="phone">{t('profile.phone')}</Label>
              <Input id="phone" type="tel" {...register('phone')} />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="employerName">{t('profile.employerName')}</Label>
              <Input id="employerName" {...register('employerName')} />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="employerTaxId">{t('profile.employerTaxId')}</Label>
              <Input id="employerTaxId" {...register('employerTaxId')} />
            </div>

            <Button type="submit" size="lg" disabled={mutation.isPending} className="w-full">
              {mutation.isPending ? t('common.loading') : t('profile.save')}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
