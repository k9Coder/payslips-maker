import { Router } from 'express';
import { z } from 'zod';
import { authMiddleware } from '../../middleware/auth.middleware';
import { routeHandler, AppError } from '../../middleware/routeHandler';
import { SubscriptionService } from './subscription.service';
import { checkGate, Feature } from './subscription.gates';
import type { EmployeeSubscriptionStatus } from '@payslips-maker/shared';

const router = Router();
router.use(authMiddleware);

const createSubscriptionSchema = z
  .object({
    plan:       z.enum(['per_employee', 'full']),
    employeeId: z.string().optional(),
  })
  .refine((d) => d.plan !== 'per_employee' || !!d.employeeId, {
    message: 'employeeId required for per_employee plan',
  });

// GET /api/subscriptions
router.get('/', routeHandler(async (req, res) => {
  res.json({ success: true, data: req.activeSubscriptions });
}));

// GET /api/subscriptions/employee/:employeeId
router.get('/employee/:employeeId', routeHandler(async (req, res) => {
  const { employeeId } = req.params;
  const subs  = req.activeSubscriptions ?? [];
  const count = await SubscriptionService.getEmployeeGenerateCount(employeeId, req.userId!);

  const features: EmployeeSubscriptionStatus['features'] = {
    generatePdf:     checkGate(Feature.GENERATE_PDF,     subs, { employeeId, currentCount: count }).allowed,
    sendEmail:       checkGate(Feature.SEND_EMAIL,       subs, { employeeId }).allowed,
    finalSettlement: checkGate(Feature.FINAL_SETTLEMENT, subs, { employeeId }).allowed,
    worklog:         checkGate(Feature.WORKLOG,          subs, { employeeId }).allowed,
  };

  const activePlan = subs.find(
    (s) => s.plan === 'full' || (s.plan === 'per_employee' && s.employeeId === employeeId)
  );

  const status: EmployeeSubscriptionStatus = {
    plan:             activePlan?.plan ?? null,
    features,
    pdfGenerateCount: count,
    pdfGenerateLimit: 3,
  };

  res.json({ success: true, data: status });
}));

// POST /api/subscriptions
router.post('/', routeHandler(async (req, res) => {
  const parsed = createSubscriptionSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ success: false, error: parsed.error.flatten().fieldErrors });
    return;
  }
  const subscription = await SubscriptionService.createSubscription(req.userId!, parsed.data);
  req.activeSubscriptions = await SubscriptionService.getActiveByUserId(req.userId!);
  res.status(201).json({ success: true, data: subscription });
}));

// DELETE /api/subscriptions/:id
router.delete('/:id', routeHandler(async (req, res) => {
  const cancelled = await SubscriptionService.cancelSubscription(req.params.id, req.userId!);
  if (!cancelled) throw new AppError(404, 'Subscription not found');
  res.json({ success: true, data: null });
}));

export { router as subscriptionRouter };
