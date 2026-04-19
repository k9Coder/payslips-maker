import { z } from 'zod';

const dateRegex = /^\d{4}-\d{2}-\d{2}$/;

export const createWorkLogEntrySchema = z.object({
  employeeId: z.string().min(1),
  date: z.string().regex(dateRegex, 'Date must be YYYY-MM-DD'),
  type: z.enum(['work', 'vacation', 'sick', 'holiday', 'overtime']),
  hours: z.number().min(0).max(24).optional(),
  notes: z.string().max(500).optional(),
});

export const workLogMonthQuerySchema = z.object({
  employeeId: z.string().min(1),
  year: z.coerce.number().int().min(2000).max(2100),
  month: z.coerce.number().int().min(1).max(12),
});
