import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { pdf } from '@react-pdf/renderer';
import { useApiClient } from '@/lib/useApiClient';
import type { IEmployee, IForm, SupportedLanguage } from '@payslips-maker/shared';
import type { ReactElement } from 'react';

interface SendEmailParams {
  form: IForm;
  employee: IEmployee;
  language: SupportedLanguage;
  toEmail?: string;
  PDFDocument: (props: { form: IForm; language: SupportedLanguage }) => ReactElement;
}

function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

export function useSendFormEmail(formId: string) {
  const { post } = useApiClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ form, language, toEmail, PDFDocument }: SendEmailParams) => {
      const blob = await pdf(<PDFDocument form={form} language={language} />).toBlob();
      const pdfBase64 = await blobToBase64(blob);
      return post<{ success: boolean; data: { remaining: number } }>(
        `/api/forms/${formId}/send-email`,
        { language, toEmail, pdfBase64 }
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['email-status', formId] });
    },
  });
}

export function useEmailStatus(formId: string | undefined) {
  const { get } = useApiClient();
  return useQuery({
    queryKey: ['email-status', formId],
    queryFn: () =>
      get<{ success: boolean; data: { remaining: number; limit: number } }>(
        `/api/forms/${formId}/send-email/status`
      ).then((r) => r.data),
    enabled: !!formId,
  });
}
