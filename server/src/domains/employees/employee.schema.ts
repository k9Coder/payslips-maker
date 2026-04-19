import { z } from 'zod';

export const createEmployeeSchema = z.object({
  fullName: z.record(z.string()),
  passportNumber: z.string().min(5),
  nationality: z.string().min(2),
  email: z.string().email().optional().or(z.literal('')),
  phone: z.string().optional(),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD'),
  preferredLanguage: z.enum(['he', 'en', 'fil', 'th', 'am', 'hi', 'ar']).default('he'),
});

export const updateEmployeeSchema = createEmployeeSchema.partial();
