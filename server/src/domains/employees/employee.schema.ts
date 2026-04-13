import { z } from 'zod';

const supportedLanguages = ['he', 'en', 'fil', 'th', 'am', 'hi', 'ar'] as const;
type MultiLangString = Partial<Record<typeof supportedLanguages[number], string>>;
const multiLangStringSchema = z.union([
  z.string().min(2),
  z.record(z.enum(supportedLanguages), z.string().optional()).refine(
    (val) => Object.values(val).some((v) => v && v.trim().length >= 2),
    { message: 'At least one language must have a value (min 2 chars)' }
  ),
]) as unknown as z.ZodType<MultiLangString>;

export const createEmployeeSchema = z.object({
  fullName: multiLangStringSchema,
  passportNumber: z.string().min(5),
  nationality: z.string().min(2),
  email: z.string().email().optional().or(z.literal('')),
  phone: z.string().optional(),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'חייב להיות בפורמט YYYY-MM-DD'),
  preferredLanguage: z.enum(['he', 'en', 'fil', 'th', 'am', 'hi', 'ar']).default('he'),
});

export const updateEmployeeSchema = createEmployeeSchema.partial();
