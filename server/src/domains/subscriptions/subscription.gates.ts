import { Request, Response, NextFunction } from 'express';
import type { ISubscription } from '@payslips-maker/shared';

export const Feature = {
  CREATE_ADDITIONAL_EMPLOYEE: 'create_additional_employee',
  GENERATE_PDF:               'generate_pdf',
  SEND_EMAIL:                 'send_email',
  FINAL_SETTLEMENT:           'final_settlement',
  WORKLOG:                    'worklog',
} as const;
export type Feature = typeof Feature[keyof typeof Feature];

type FeatureRequirement =
  | { type: 'any_subscription' }
  | { type: 'employee_unlock' }
  | { type: 'employee_unlock_or_free_limit'; freeLimit: number };

// ← the only place gate rules ever change
const GATES: Record<Feature, FeatureRequirement> = {
  create_additional_employee: { type: 'any_subscription' },
  generate_pdf:               { type: 'employee_unlock_or_free_limit', freeLimit: 3 },
  send_email:                 { type: 'employee_unlock' },
  final_settlement:           { type: 'employee_unlock' },
  worklog:                    { type: 'employee_unlock' },
};

export interface GateResult {
  allowed:    boolean;
  reason?:    string;
  remaining?: number | null;
}

function isEmployeeUnlocked(subscriptions: ISubscription[], employeeId?: string): boolean {
  return subscriptions.some(
    (s) =>
      s.status === 'active' &&
      (s.plan === 'full' || (s.plan === 'per_employee' && s.employeeId === employeeId))
  );
}

export function checkGate(
  feature: Feature,
  subscriptions: ISubscription[],
  options?: { employeeId?: string; currentCount?: number }
): GateResult {
  const req = GATES[feature];

  if (req.type === 'any_subscription') {
    const allowed = subscriptions.some((s) => s.status === 'active');
    return { allowed, reason: allowed ? undefined : 'SUBSCRIPTION_REQUIRED' };
  }

  if (req.type === 'employee_unlock') {
    const allowed = isEmployeeUnlocked(subscriptions, options?.employeeId);
    return { allowed, reason: allowed ? undefined : 'EMPLOYEE_SUBSCRIPTION_REQUIRED' };
  }

  if (req.type === 'employee_unlock_or_free_limit') {
    if (isEmployeeUnlocked(subscriptions, options?.employeeId)) {
      return { allowed: true, remaining: null };
    }
    const count     = options?.currentCount ?? 0;
    const remaining = req.freeLimit - count;
    return {
      allowed:   remaining > 0,
      remaining: Math.max(0, remaining),
      reason:    remaining <= 0 ? 'FREE_LIMIT_REACHED' : undefined,
    };
  }

  return { allowed: false, reason: 'UNKNOWN_FEATURE' };
}

export function requireFeature(
  feature: Feature,
  getEmployeeId?: (req: Request) => string | undefined
) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const employeeId = getEmployeeId?.(req);
    const result     = checkGate(feature, req.activeSubscriptions ?? [], { employeeId });

    if (!result.allowed) {
      res.status(403).json({ success: false, error: result.reason });
      return;
    }
    next();
  };
}
