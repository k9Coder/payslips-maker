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

export const createCompanySchema = z.object({
  name: multiLangStringSchema,
  ein: z.string().optional(),
  logo: z.string().url().optional().or(z.literal('')),
  address: z.string().optional(),
  phone: z.string().optional(),
  website: z.string().url().optional().or(z.literal('')),
});

export const updateCompanySchema = createCompanySchema.partial();
