import { Router } from 'express';
import { z } from 'zod';
import { authMiddleware } from '../../middleware/auth.middleware';
import { adminMiddleware } from '../../middleware/admin.middleware';
import { routeHandler } from '../../middleware/routeHandler';
import { PayslipConstants } from './payslip-constants.model';

const router = Router();

const APRIL_2026_DEFAULTS = {
  minimumMonthlyWage: 6443.85,
  dailyRate: 257.75,
  restDayPremium: 426.35,
  medicalDeductionCeiling: 164.91,
  utilitiesDeductionCeiling: 94.34,
  recoveryPayDayRate: 418.00,
  niiEmployerRate: 0.036,
  pensionSubstituteRate: 0.065,
  severanceSubstituteRate: 0.060,
  pocketMoneyPerWeekend: 100.00,
  effectiveFrom: '2026-04-01',
};

const patchConstantsSchema = z.object({
  minimumMonthlyWage: z.number().positive().optional(),
  dailyRate: z.number().positive().optional(),
  restDayPremium: z.number().positive().optional(),
  medicalDeductionCeiling: z.number().positive().optional(),
  utilitiesDeductionCeiling: z.number().positive().optional(),
  recoveryPayDayRate: z.number().positive().optional(),
  niiEmployerRate: z.number().min(0).max(1).optional(),
  pensionSubstituteRate: z.number().min(0).max(1).optional(),
  severanceSubstituteRate: z.number().min(0).max(1).optional(),
  pocketMoneyPerWeekend: z.number().positive().optional(),
  effectiveFrom: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
});

async function getCurrent() {
  const doc = await PayslipConstants.findOne().sort({ updatedAt: -1 }).lean();
  if (doc) return doc;
  await PayslipConstants.create(APRIL_2026_DEFAULTS);
  return PayslipConstants.findOne().sort({ updatedAt: -1 }).lean();
}

// GET /api/payslip-constants — any authenticated user
router.get('/', authMiddleware, routeHandler(async (_req, res) => {
  const constants = await getCurrent();
  res.json({ data: constants });
}));

// GET /api/admin/payslip-constants — admin view (same data)
router.get('/admin', authMiddleware, adminMiddleware, routeHandler(async (_req, res) => {
  const constants = await getCurrent();
  res.json({ data: constants });
}));

// PATCH /api/admin/payslip-constants — admin only
router.patch('/admin', authMiddleware, adminMiddleware, routeHandler(async (req, res) => {
  const body = patchConstantsSchema.parse(req.body);
  const constants = await PayslipConstants.findOneAndUpdate(
    {},
    { $set: body },
    { new: true, upsert: true, sort: { updatedAt: -1 } }
  ).lean();
  res.json({ data: constants });
}));

export { router as payslipConstantsRouter };
