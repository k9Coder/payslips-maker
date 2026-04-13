import { z } from 'zod';

export const sendEmailSchema = z.object({
  language: z.enum(['he', 'en', 'fil', 'th', 'am', 'hi', 'ar']).default('he'),
  toEmail: z.string().email().optional(),
  pdfBase64: z.string().min(1),
});
