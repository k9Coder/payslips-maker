import { z } from 'zod';

export const updateUserSchema = z.object({
  fullName: z.string().min(2).optional(),
  phone: z.string().optional(),
  employerName: z.string().optional(),
  employerTaxId: z.string().optional(),
});
