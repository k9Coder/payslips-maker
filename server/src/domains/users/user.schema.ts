import { z } from 'zod';

export const updateUserSchema = z.object({
  fullName: z.string().min(2).optional(),
  phone: z.string().optional(),
  employerName: z.record(z.string()).optional(),
  employerTaxId: z.string().optional(),
  employerAddress: z.string().optional(),
  employerCity: z.string().optional(),
  employerZip: z.string().optional(),
});
