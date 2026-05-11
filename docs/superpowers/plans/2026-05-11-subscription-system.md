# Subscription System Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the `hasSubscription: boolean` flag with a per-employee subscription system (two paid tiers) that gates PDF generation, email, worklog, and final settlement behind a central feature-gate module.

**Architecture:** A new `Subscription` MongoDB collection tracks active plans per user/employee. A single `subscription.gates.ts` file owns all feature-gate rules. Auth middleware loads active subscriptions once per request and attaches them to `req.activeSubscriptions`, giving all route handlers zero-extra-query gate checks.

**Tech Stack:** TypeScript, Express, Mongoose, React 18, TanStack Query, Zod, react-hook-form

---

## File Map

**Create:**
- `shared/src/types/subscription.types.ts`
- `server/src/domains/subscriptions/subscription.model.ts`
- `server/src/domains/subscriptions/subscription.service.ts`
- `server/src/domains/subscriptions/subscription.gates.ts`
- `server/src/domains/subscriptions/subscription.gates.test.ts`
- `server/src/domains/subscriptions/subscription.router.ts`
- `client/src/domains/subscriptions/hooks/useEmployeeSubscription.ts`
- `client/src/domains/subscriptions/components/UpgradePrompt.tsx`
- `client/src/pages/SubscriptionsPage.tsx`

**Modify:**
- `shared/src/types/user.types.ts` — remove `hasSubscription`
- `shared/src/types/employee.types.ts` — add `pdfGenerateCount`
- `shared/src/index.ts` — export subscription types
- `server/src/types/express.d.ts` — swap `hasSubscription` → `activeSubscriptions`
- `server/src/domains/users/user.model.ts` — remove `hasSubscription` field
- `server/src/domains/employees/employee.model.ts` — add `pdfGenerateCount`
- `server/src/middleware/auth.middleware.ts` — load active subscriptions
- `server/src/domains/forms/form.service.ts` — remove `hasSubscription` param + limit logic
- `server/src/domains/forms/form.router.ts` — add `/generate` endpoint, gate `final_settlement`
- `server/src/domains/employees/employee.router.ts` — gate create ≥2 employees
- `server/src/domains/worklog/worklog.router.ts` — gate all write + read operations
- `server/src/app.ts` — register subscription router + model import
- `client/src/domains/forms/components/FormContainer.tsx` — gate PDF + email buttons
- `client/src/domains/employees/EmployeeCardsPage.tsx` — gate new employee button
- `client/src/App.tsx` — add `/subscriptions` route
- `client/src/shared/components/Sidebar.tsx` — add Subscriptions nav item

**Delete:**
- `server/src/middleware/subscription.middleware.ts`

---

### Task 1: Subscription shared types

**Files:**
- Create: `shared/src/types/subscription.types.ts`
- Modify: `shared/src/index.ts`

- [ ] **Step 1: Create subscription types**

```typescript
// shared/src/types/subscription.types.ts
export type SubscriptionPlan   = 'per_employee' | 'full';
export type SubscriptionStatus = 'active' | 'cancelled' | 'expired';

export interface ISubscription {
  _id:         string;
  userId:      string;
  plan:        SubscriptionPlan;
  employeeId?: string;
  status:      SubscriptionStatus;
  amountILS:   number;
  startedAt:   Date | string;
  expiresAt:   Date | string;
  billingRef?: string;
  createdAt:   Date | string;
  updatedAt:   Date | string;
}

export interface CreateSubscriptionDto {
  plan:        SubscriptionPlan;
  employeeId?: string;
}

export interface EmployeeSubscriptionStatus {
  plan: SubscriptionPlan | null;
  features: {
    generatePdf:      boolean;
    sendEmail:        boolean;
    finalSettlement:  boolean;
    worklog:          boolean;
  };
  pdfGenerateCount:   number;
  pdfGenerateLimit:   number;
}
```

- [ ] **Step 2: Export from shared index**

In `shared/src/index.ts`, add:
```typescript
export * from './types/subscription.types';
```

- [ ] **Step 3: Commit**

```bash
git add shared/src/types/subscription.types.ts shared/src/index.ts
git commit -m "feat(shared): add ISubscription, SubscriptionPlan, EmployeeSubscriptionStatus types"
```

---

### Task 2: Add pdfGenerateCount to employee

**Files:**
- Modify: `shared/src/types/employee.types.ts`
- Modify: `server/src/domains/employees/employee.model.ts`

- [ ] **Step 1: Read current IEmployee in shared**

Open `shared/src/types/employee.types.ts` — find the `IEmployee` interface. Add `pdfGenerateCount` as an optional field at the end:

```typescript
export interface IEmployee {
  // ... existing fields ...
  pdfGenerateCount?: number;
}
```

- [ ] **Step 2: Add field to Mongoose schema**

In `server/src/domains/employees/employee.model.ts`, add to `IEmployeeDocument`:
```typescript
pdfGenerateCount: number;
```

And add to `EmployeeSchema`:
```typescript
pdfGenerateCount: { type: Number, default: 0 },
```

Full updated schema block (add after `hasFoodDeduction`):
```typescript
    hasFoodDeduction: { type: Boolean, default: false },
    pdfGenerateCount: { type: Number, default: 0 },
```

- [ ] **Step 3: Commit**

```bash
git add shared/src/types/employee.types.ts server/src/domains/employees/employee.model.ts
git commit -m "feat(employee): add pdfGenerateCount field for free-tier PDF gate"
```

---

### Task 3: Remove hasSubscription from user

**Files:**
- Modify: `shared/src/types/user.types.ts`
- Modify: `server/src/domains/users/user.model.ts`

- [ ] **Step 1: Remove from shared IUser**

In `shared/src/types/user.types.ts`, remove the `hasSubscription: boolean;` line from `IUser`.

- [ ] **Step 2: Remove from Mongoose schema**

In `server/src/domains/users/user.model.ts`, remove:
```typescript
hasSubscription: { type: Boolean, default: false },
```

- [ ] **Step 3: Commit**

```bash
git add shared/src/types/user.types.ts server/src/domains/users/user.model.ts
git commit -m "feat(user): remove hasSubscription boolean — subscription status now derived from Subscription collection"
```

---

### Task 4: Subscription Mongoose model

**Files:**
- Create: `server/src/domains/subscriptions/subscription.model.ts`

- [ ] **Step 1: Create the model**

```typescript
// server/src/domains/subscriptions/subscription.model.ts
import mongoose, { Schema, Document, Types } from 'mongoose';
import type { ISubscription, SubscriptionPlan, SubscriptionStatus } from '@payslips-maker/shared';

export interface SubscriptionDocument extends Omit<ISubscription, '_id' | 'userId' | 'employeeId'>, Document {
  userId:      Types.ObjectId;
  employeeId?: Types.ObjectId;
}

const SubscriptionSchema = new Schema<SubscriptionDocument>(
  {
    userId:     { type: Schema.Types.ObjectId, ref: 'User',     required: true, index: true },
    employeeId: { type: Schema.Types.ObjectId, ref: 'Employee', index: true },
    plan:       { type: String, enum: ['per_employee', 'full'] as SubscriptionPlan[], required: true },
    status:     { type: String, enum: ['active', 'cancelled', 'expired'] as SubscriptionStatus[], default: 'active' },
    amountILS:  { type: Number, required: true },
    startedAt:  { type: Date, required: true },
    expiresAt:  { type: Date, required: true },
    billingRef: { type: String },
  },
  { timestamps: true }
);

SubscriptionSchema.index({ userId: 1, status: 1 });
SubscriptionSchema.index({ userId: 1, employeeId: 1, status: 1 });

export const Subscription = mongoose.model<SubscriptionDocument>('Subscription', SubscriptionSchema);
```

- [ ] **Step 2: Commit**

```bash
git add server/src/domains/subscriptions/subscription.model.ts
git commit -m "feat(subscriptions): add Subscription Mongoose model"
```

---

### Task 5: SubscriptionService

**Files:**
- Create: `server/src/domains/subscriptions/subscription.service.ts`

- [ ] **Step 1: Create the service**

```typescript
// server/src/domains/subscriptions/subscription.service.ts
import { Types } from 'mongoose';
import { Subscription } from './subscription.model';
import { Employee } from '../employees/employee.model';
import type { ISubscription, CreateSubscriptionDto } from '@payslips-maker/shared';

const PLAN_AMOUNTS: Record<string, number> = {
  per_employee: 40,
  full:         85,
};

export const SubscriptionService = {
  async getActiveByUserId(userId: string): Promise<ISubscription[]> {
    const now = new Date();
    const docs = await Subscription.find({
      userId: new Types.ObjectId(userId),
      status: 'active',
      expiresAt: { $gt: now },
    }).lean();

    return docs.map((d) => ({
      ...d,
      _id:        d._id.toString(),
      userId:     d.userId.toString(),
      employeeId: d.employeeId?.toString(),
    })) as ISubscription[];
  },

  async createSubscription(
    userId: string,
    dto: CreateSubscriptionDto
  ): Promise<ISubscription> {
    const now   = new Date();
    const expiry = new Date(now);
    expiry.setMonth(expiry.getMonth() + 1);

    const doc = await Subscription.create({
      userId:     new Types.ObjectId(userId),
      employeeId: dto.employeeId ? new Types.ObjectId(dto.employeeId) : undefined,
      plan:       dto.plan,
      status:     'active',
      amountILS:  PLAN_AMOUNTS[dto.plan],
      startedAt:  now,
      expiresAt:  expiry,
    });

    return {
      ...doc.toObject(),
      _id:        doc._id.toString(),
      userId,
      employeeId: dto.employeeId,
    } as unknown as ISubscription;
  },

  async cancelSubscription(subscriptionId: string, userId: string): Promise<boolean> {
    const result = await Subscription.updateOne(
      { _id: subscriptionId, userId: new Types.ObjectId(userId) },
      { $set: { status: 'cancelled' } }
    );
    return result.modifiedCount === 1;
  },

  async incrementGenerateCount(employeeId: string, userId: string): Promise<number> {
    const doc = await Employee.findOneAndUpdate(
      { _id: new Types.ObjectId(employeeId), userId: new Types.ObjectId(userId) },
      { $inc: { pdfGenerateCount: 1 } },
      { new: true }
    );
    return doc?.pdfGenerateCount ?? 0;
  },

  async getEmployeeGenerateCount(employeeId: string, userId: string): Promise<number> {
    const doc = await Employee.findOne({
      _id:    new Types.ObjectId(employeeId),
      userId: new Types.ObjectId(userId),
    }).lean();
    return doc?.pdfGenerateCount ?? 0;
  },
};
```

- [ ] **Step 2: Commit**

```bash
git add server/src/domains/subscriptions/subscription.service.ts
git commit -m "feat(subscriptions): add SubscriptionService (CRUD + generate counter)"
```

---

### Task 6: Feature gate module + tests

**Files:**
- Create: `server/src/domains/subscriptions/subscription.gates.ts`
- Create: `server/src/domains/subscriptions/subscription.gates.test.ts`

- [ ] **Step 1: Create the gate module**

```typescript
// server/src/domains/subscriptions/subscription.gates.ts
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
  remaining?: number | null; // null = unlimited; number = remaining free uses
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
```

- [ ] **Step 2: Write unit tests for checkGate**

```typescript
// server/src/domains/subscriptions/subscription.gates.test.ts
import { checkGate, Feature } from './subscription.gates';
import type { ISubscription } from '@payslips-maker/shared';

const ACTIVE_FULL: ISubscription = {
  _id: '1', userId: 'u1', plan: 'full', status: 'active',
  amountILS: 85, startedAt: new Date(), expiresAt: new Date(),
  createdAt: new Date(), updatedAt: new Date(),
};

const ACTIVE_PER_EMP: ISubscription = {
  _id: '2', userId: 'u1', plan: 'per_employee', employeeId: 'emp1',
  status: 'active', amountILS: 40,
  startedAt: new Date(), expiresAt: new Date(),
  createdAt: new Date(), updatedAt: new Date(),
};

describe('checkGate — any_subscription', () => {
  it('allows when any active subscription exists', () => {
    expect(checkGate(Feature.CREATE_ADDITIONAL_EMPLOYEE, [ACTIVE_FULL])).toMatchObject({ allowed: true });
  });
  it('blocks when no subscriptions', () => {
    expect(checkGate(Feature.CREATE_ADDITIONAL_EMPLOYEE, [])).toMatchObject({
      allowed: false, reason: 'SUBSCRIPTION_REQUIRED',
    });
  });
});

describe('checkGate — employee_unlock', () => {
  it('allows with full plan regardless of employeeId', () => {
    expect(checkGate(Feature.SEND_EMAIL, [ACTIVE_FULL], { employeeId: 'emp99' })).toMatchObject({ allowed: true });
  });
  it('allows with matching per_employee plan', () => {
    expect(checkGate(Feature.SEND_EMAIL, [ACTIVE_PER_EMP], { employeeId: 'emp1' })).toMatchObject({ allowed: true });
  });
  it('blocks when per_employee plan is for a different employee', () => {
    expect(checkGate(Feature.SEND_EMAIL, [ACTIVE_PER_EMP], { employeeId: 'emp2' })).toMatchObject({
      allowed: false, reason: 'EMPLOYEE_SUBSCRIPTION_REQUIRED',
    });
  });
  it('blocks when no subscriptions', () => {
    expect(checkGate(Feature.WORKLOG, [], { employeeId: 'emp1' })).toMatchObject({ allowed: false });
  });
});

describe('checkGate — employee_unlock_or_free_limit', () => {
  it('allows unlimited when employee is unlocked', () => {
    const result = checkGate(Feature.GENERATE_PDF, [ACTIVE_FULL], { employeeId: 'emp1', currentCount: 99 });
    expect(result).toMatchObject({ allowed: true, remaining: null });
  });
  it('allows within free limit', () => {
    const result = checkGate(Feature.GENERATE_PDF, [], { employeeId: 'emp1', currentCount: 1 });
    expect(result).toMatchObject({ allowed: true, remaining: 2 });
  });
  it('blocks when free limit reached', () => {
    const result = checkGate(Feature.GENERATE_PDF, [], { employeeId: 'emp1', currentCount: 3 });
    expect(result).toMatchObject({ allowed: false, reason: 'FREE_LIMIT_REACHED', remaining: 0 });
  });
  it('remaining is 0 not negative when over limit', () => {
    const result = checkGate(Feature.GENERATE_PDF, [], { currentCount: 10 });
    expect(result.remaining).toBe(0);
  });
});
```

- [ ] **Step 3: Run tests**

This project has no test runner configured. Add vitest to the server workspace:
```bash
npm install -D vitest -w server
```
Then run:
```bash
npx vitest run server/src/domains/subscriptions/subscription.gates.test.ts
```
Expected: all 8 tests pass.

- [ ] **Step 4: Commit**

```bash
git add server/src/domains/subscriptions/subscription.gates.ts server/src/domains/subscriptions/subscription.gates.test.ts
git commit -m "feat(subscriptions): add feature gate module with checkGate + requireFeature"
```

---

### Task 7: Update Express types + auth middleware

**Files:**
- Modify: `server/src/types/express.d.ts`
- Modify: `server/src/middleware/auth.middleware.ts`

- [ ] **Step 1: Swap Request type**

Replace the contents of `server/src/types/express.d.ts`:

```typescript
import type { ISubscription } from '@payslips-maker/shared';

declare namespace Express {
  interface Request {
    clerkId?:            string;
    userId?:             string;
    isAdmin?:            boolean;
    activeSubscriptions?: ISubscription[];
    impersonating?:      boolean;
    impersonatedUserId?: string;
    requestId?:          string;
    startTime?:          number;
  }
}
```

- [ ] **Step 2: Update auth middleware**

In `server/src/middleware/auth.middleware.ts`:

Add import at top:
```typescript
import { SubscriptionService } from '../domains/subscriptions/subscription.service';
```

Find the block that sets `req.clerkId`, `req.userId`, etc. Replace:
```typescript
    req.clerkId = clerkId;
    req.userId = user._id.toString();
    req.isAdmin = user.isAdmin;
    req.hasSubscription = user.hasSubscription;

    const impersonateId = req.headers['x-impersonate-user'] as string | undefined;
    if (impersonateId && user.isAdmin) {
      const target = await User.findById(impersonateId);
      if (!target) {
        res.status(404).json({ success: false, error: 'Impersonation target not found' });
        return;
      }
      req.userId = target._id.toString();
      req.hasSubscription = target.hasSubscription;
      req.impersonating = true;
      req.impersonatedUserId = target._id.toString();
    }
```

With:
```typescript
    req.clerkId = clerkId;
    req.userId  = user._id.toString();
    req.isAdmin = user.isAdmin;

    const impersonateId = req.headers['x-impersonate-user'] as string | undefined;
    if (impersonateId && user.isAdmin) {
      const target = await User.findById(impersonateId);
      if (!target) {
        res.status(404).json({ success: false, error: 'Impersonation target not found' });
        return;
      }
      req.userId        = target._id.toString();
      req.impersonating = true;
      req.impersonatedUserId = target._id.toString();
    }

    req.activeSubscriptions = await SubscriptionService.getActiveByUserId(req.userId);
```

- [ ] **Step 3: Fix TypeScript errors**

Run: `npm run typecheck -w server`

Any remaining references to `req.hasSubscription` will now error — fix them in the next tasks.

- [ ] **Step 4: Commit**

```bash
git add server/src/types/express.d.ts server/src/middleware/auth.middleware.ts
git commit -m "feat(auth): load activeSubscriptions on req; remove hasSubscription"
```

---

### Task 8: Subscription router + register in app.ts

**Files:**
- Create: `server/src/domains/subscriptions/subscription.router.ts`
- Modify: `server/src/app.ts`

- [ ] **Step 1: Create the router**

```typescript
// server/src/domains/subscriptions/subscription.router.ts
import { Router } from 'express';
import { authMiddleware } from '../../middleware/auth.middleware';
import { routeHandler, AppError } from '../../middleware/routeHandler';
import { SubscriptionService } from './subscription.service';
import { checkGate, Feature } from './subscription.gates';
import { z } from 'zod';
import type { EmployeeSubscriptionStatus } from '@payslips-maker/shared';

const router = Router();
router.use(authMiddleware);

const createSubscriptionSchema = z.object({
  plan:        z.enum(['per_employee', 'full']),
  employeeId:  z.string().optional(),
}).refine(
  (d) => d.plan !== 'per_employee' || !!d.employeeId,
  { message: 'employeeId required for per_employee plan' }
);

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
  // Refresh subscriptions on req for any downstream use
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
```

- [ ] **Step 2: Register in app.ts**

In `server/src/app.ts`, add the import after the other domain imports:
```typescript
import './domains/subscriptions/subscription.model';
import { subscriptionRouter } from './domains/subscriptions/subscription.router';
```

Add the route after `/api/employees`:
```typescript
app.use('/api/subscriptions', subscriptionRouter);
```

- [ ] **Step 3: Run typecheck**

```bash
npm run typecheck -w server
```
Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add server/src/domains/subscriptions/subscription.router.ts server/src/app.ts
git commit -m "feat(subscriptions): add subscription router and register in app"
```

---

### Task 9: POST /api/forms/:id/generate endpoint

**Files:**
- Modify: `server/src/domains/forms/form.router.ts`
- Modify: `server/src/domains/forms/form.service.ts`

- [ ] **Step 1: Remove hasSubscription from createForm**

In `server/src/domains/forms/form.service.ts`, find `createForm`. Remove the `hasSubscription` parameter and the entire form-count limit block:

```typescript
// REMOVE this entire block:
if (!hasSubscription) {
  const count = await Form.countDocuments({
    userId: new Types.ObjectId(userId),
  });
  if (count >= 10) throw new Error('FORM_LIMIT_REACHED');
}
```

Change the signature from:
```typescript
async createForm(
  clerkId: string,
  userId: string,
  producedByName: string,
  dto: CreateFormDto,
  hasSubscription = false
): Promise<IForm>
```
to:
```typescript
async createForm(
  clerkId: string,
  userId: string,
  producedByName: string,
  dto: CreateFormDto
): Promise<IForm>
```

- [ ] **Step 2: Add generate endpoint to form router**

In `server/src/domains/forms/form.router.ts`, add these imports at the top (after existing imports):
```typescript
import { checkGate, Feature } from '../subscriptions/subscription.gates';
import { SubscriptionService } from '../subscriptions/subscription.service';
```

Add the `POST /generate` route **before** the `GET /:id` route (route order matters):

```typescript
// POST /api/forms/:id/generate — gate check + increment free-tier counter
router.post('/:id/generate', authMiddleware, routeHandler(async (req: Request, res: Response): Promise<void> => {
  const form = await FormService.getFormById(req.params.id, req.userId!);
  if (!form) {
    res.status(404).json({ success: false, error: 'Form not found' });
    return;
  }

  const { employeeId } = form;
  const currentCount = await SubscriptionService.getEmployeeGenerateCount(employeeId, req.userId!);
  const result = checkGate(Feature.GENERATE_PDF, req.activeSubscriptions ?? [], {
    employeeId,
    currentCount,
  });

  if (!result.allowed) {
    res.status(403).json({ success: false, error: result.reason, remaining: 0 });
    return;
  }

  // Increment counter only for free-tier (remaining !== null means not unlimited)
  if (result.remaining !== null) {
    await SubscriptionService.incrementGenerateCount(employeeId, req.userId!);
  }

  res.json({ success: true, data: { allowed: true, remaining: result.remaining } });
}));
```

- [ ] **Step 3: Gate final_settlement form creation**

In the `POST /api/forms` route handler in `form.router.ts`, add a gate check after the schema parse and before calling `FormService.createForm`. Find:

```typescript
  const user = await UserService.getUserByClerkId(req.clerkId!);
```

Add before it:
```typescript
  if (parsed.data.formType === 'final_settlement') {
    const gateResult = checkGate(Feature.FINAL_SETTLEMENT, req.activeSubscriptions ?? [], {
      employeeId: parsed.data.employeeId,
    });
    if (!gateResult.allowed) {
      throw new AppError(403, gateResult.reason ?? 'EMPLOYEE_SUBSCRIPTION_REQUIRED');
    }
  }
```

- [ ] **Step 4: Remove hasSubscription from the createForm call**

In the same `POST /` route, find:
```typescript
    const form = await FormService.createForm(
      req.clerkId!,
      req.userId!,
      producedByName,
      parsed.data,
      req.hasSubscription
    );
```

Change to:
```typescript
    const form = await FormService.createForm(
      req.clerkId!,
      req.userId!,
      producedByName,
      parsed.data
    );
```

Also remove the `FORM_LIMIT_REACHED` error handler below it (no longer thrown):
```typescript
// REMOVE:
    if (error instanceof Error && error.message === 'FORM_LIMIT_REACHED') {
      throw new AppError(422, 'FORM_LIMIT_REACHED');
    }
```

- [ ] **Step 5: Typecheck**

```bash
npm run typecheck -w server
```
Expected: no errors.

- [ ] **Step 6: Commit**

```bash
git add server/src/domains/forms/form.router.ts server/src/domains/forms/form.service.ts
git commit -m "feat(forms): add /generate gate endpoint; gate final_settlement creation; remove legacy form limit"
```

---

### Task 10: Gate employee creation + worklog

**Files:**
- Modify: `server/src/domains/employees/employee.router.ts`
- Modify: `server/src/domains/worklog/worklog.router.ts`

- [ ] **Step 1: Gate employee creation**

In `server/src/domains/employees/employee.router.ts`, add imports:
```typescript
import { checkGate, Feature } from '../subscriptions/subscription.gates';
import { Employee } from './employee.model';
import mongoose from 'mongoose';
```

Replace the `router.post('/')` handler:
```typescript
router.post('/', routeHandler(async (req, res) => {
  const existingCount = await Employee.countDocuments({
    userId: new mongoose.Types.ObjectId(req.userId!),
  });

  if (existingCount >= 1) {
    const result = checkGate(Feature.CREATE_ADDITIONAL_EMPLOYEE, req.activeSubscriptions ?? []);
    if (!result.allowed) {
      res.status(403).json({ success: false, error: result.reason });
      return;
    }
  }

  const body = createEmployeeSchema.parse(req.body);
  const employee = await createEmployee(req.userId!, body);
  res.status(201).json({ data: employee });
}));
```

- [ ] **Step 2: Gate worklog**

In `server/src/domains/worklog/worklog.router.ts`, add imports:
```typescript
import { requireFeature, Feature } from '../subscriptions/subscription.gates';
```

The worklog query takes `employeeId` as a query param. Gate all four routes with `requireFeature`. Replace the router definition:

```typescript
const router = Router();
router.use(authMiddleware);

// GET /api/worklog?employeeId=&year=&month=
router.get(
  '/',
  requireFeature(Feature.WORKLOG, (req) => req.query.employeeId as string | undefined),
  routeHandler(async (req, res) => {
    const { employeeId, year, month } = workLogMonthQuerySchema.parse(req.query);
    const summary = await getMonthSummary(req.isAdmin ? null : req.userId!, employeeId, year, month);
    res.json({ data: summary });
  })
);

// POST /api/worklog
router.post(
  '/',
  requireFeature(Feature.WORKLOG, (req) => req.body?.employeeId as string | undefined),
  routeHandler(async (req, res) => {
    const body = createWorkLogEntrySchema.parse(req.body);
    const entry = await createEntry(req.userId!, body);
    res.status(201).json({ data: entry });
  })
);

// PATCH /api/worklog/:id
router.patch(
  '/:id',
  routeHandler(async (req, res) => {
    const body = updateWorkLogEntrySchema.parse(req.body);
    const entry = await updateEntry(req.userId!, req.params.id, body);
    if (!entry) { res.status(404).json({ error: 'Not found' }); return; }
    res.json({ data: entry });
  })
);

// DELETE /api/worklog/:id
router.delete(
  '/:id',
  routeHandler(async (req, res) => {
    await deleteEntry(req.userId!, req.params.id);
    res.status(204).send();
  })
);

export default router;
```

*Note: PATCH and DELETE don't receive employeeId in the request, so they inherit the previous GET/POST gate implicitly by design — the entry itself is scoped to the user. If you want stricter gating on PATCH/DELETE, load the entry by ID and check its employeeId.*

- [ ] **Step 3: Commit**

```bash
git add server/src/domains/employees/employee.router.ts server/src/domains/worklog/worklog.router.ts
git commit -m "feat(gates): gate employee creation (≥2) and worklog behind subscription"
```

---

### Task 11: Remove old subscriptionMiddleware

**Files:**
- Modify: `server/src/domains/forms/form.router.ts`
- Delete: `server/src/middleware/subscription.middleware.ts`

- [ ] **Step 1: Replace subscriptionMiddleware on send-email route**

In `server/src/domains/forms/form.router.ts`, find:
```typescript
router.post('/:id/send-email', authMiddleware, subscriptionMiddleware, routeHandler(
```

The send-email route needs the form's employeeId for the gate check. Since the form is loaded inside the handler anyway, handle the gate inline. Replace with:

```typescript
router.post('/:id/send-email', authMiddleware, routeHandler(async (req: Request, res: Response): Promise<void> => {
  const parsed = sendEmailSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ success: false, error: parsed.error.flatten().fieldErrors });
    return;
  }

  const form = await FormService.getFormById(req.params.id, req.userId!);
  if (!form) {
    res.status(404).json({ success: false, error: 'Form not found' });
    return;
  }

  // Gate: send email requires employee subscription
  const emailGate = checkGate(Feature.SEND_EMAIL, req.activeSubscriptions ?? [], {
    employeeId: form.employeeId,
  });
  if (!emailGate.allowed) {
    throw new AppError(403, emailGate.reason ?? 'EMPLOYEE_SUBSCRIPTION_REQUIRED');
  }

  const employee = await getEmployeeById(form.employeeId.toString(), req.userId!);
  if (!employee) {
    res.status(404).json({ success: false, error: 'Employee not found' });
    return;
  }

  // ... rest of the existing send-email handler (toEmail, user, pdfBuffer, etc.) unchanged
```

Keep the rest of the handler body exactly as-is (from `const toEmail = ...` onwards).

Remove the import of `subscriptionMiddleware` from the top of `form.router.ts`.

- [ ] **Step 2: Delete the old middleware file**

```bash
git rm server/src/middleware/subscription.middleware.ts
git rm server/src/middleware/subscription.middleware.test.ts
```

- [ ] **Step 3: Typecheck**

```bash
npm run typecheck -w server
npm run typecheck -w client
```
Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add server/src/domains/forms/form.router.ts
git commit -m "feat(subscriptions): replace subscriptionMiddleware with requireFeature on send-email; delete old middleware"
```

---

### Task 12: Client — useEmployeeSubscription hook

**Files:**
- Create: `client/src/domains/subscriptions/hooks/useEmployeeSubscription.ts`

- [ ] **Step 1: Create the hook**

```typescript
// client/src/domains/subscriptions/hooks/useEmployeeSubscription.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useApiClient } from '@/lib/useApiClient';
import type { ApiResponse, EmployeeSubscriptionStatus, CreateSubscriptionDto, ISubscription } from '@payslips-maker/shared';

export function useEmployeeSubscription(employeeId: string | undefined) {
  const { get } = useApiClient();

  return useQuery({
    queryKey: ['subscription', 'employee', employeeId],
    queryFn: () =>
      get<ApiResponse<EmployeeSubscriptionStatus>>(`/api/subscriptions/employee/${employeeId}`)
        .then((r) => r.data),
    enabled: !!employeeId,
    staleTime: 30_000,
  });
}

export function useSubscriptions() {
  const { get } = useApiClient();
  return useQuery({
    queryKey: ['subscriptions'],
    queryFn: () =>
      get<ApiResponse<ISubscription[]>>('/api/subscriptions').then((r) => r.data),
  });
}

export function useCreateSubscription() {
  const { post } = useApiClient();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: CreateSubscriptionDto) =>
      post<ApiResponse<ISubscription>>('/api/subscriptions', dto).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['subscriptions'] });
      qc.invalidateQueries({ queryKey: ['subscription'] });
    },
  });
}

export function useCancelSubscription() {
  const { del } = useApiClient();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => del<ApiResponse<null>>(`/api/subscriptions/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['subscriptions'] });
      qc.invalidateQueries({ queryKey: ['subscription'] });
    },
  });
}

export function useRecordGenerate() {
  const { post } = useApiClient();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (formId: string) =>
      post<ApiResponse<{ allowed: boolean; remaining: number | null }>>(
        `/api/forms/${formId}/generate`,
        {}
      ).then((r) => r.data),
    onSuccess: (_data, _formId, _ctx) => {
      qc.invalidateQueries({ queryKey: ['subscription'] });
    },
  });
}
```

*Note: Check your `useApiClient` hook — if it doesn't have a `del` method, add one mirroring `post` but using HTTP DELETE.*

- [ ] **Step 2: Commit**

```bash
git add client/src/domains/subscriptions/hooks/useEmployeeSubscription.ts
git commit -m "feat(client/subscriptions): add useEmployeeSubscription, useRecordGenerate hooks"
```

---

### Task 13: Client — UpgradePrompt component

**Files:**
- Create: `client/src/domains/subscriptions/components/UpgradePrompt.tsx`

- [ ] **Step 1: Create the component**

```tsx
// client/src/domains/subscriptions/components/UpgradePrompt.tsx
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

interface UpgradePromptProps {
  open:      boolean;
  onClose:   () => void;
  reason?:   'pdf_limit' | 'email' | 'final_settlement' | 'worklog' | 'employee';
}

const MESSAGES: Record<NonNullable<UpgradePromptProps['reason']>, { title: string; description: string }> = {
  pdf_limit:        { title: 'הגעת למגבלת ה-PDF החינמית',   description: 'ניצלת את 3 ה-PDF החינמיים לעובד זה. שדרג מנוי כדי ליצור PDFs ללא הגבלה.' },
  email:            { title: 'שליחת מייל דורשת מנוי',       description: 'שדרג מנוי לעובד זה כדי לשלוח תלושי שכר במייל.' },
  final_settlement: { title: 'גמר חשבון דורש מנוי',         description: 'שדרג מנוי לעובד זה כדי ליצור טפסי גמר חשבון.' },
  worklog:          { title: 'יומן עבודה דורש מנוי',         description: 'שדרג מנוי לעובד זה כדי לגשת ליומן העבודה.' },
  employee:         { title: 'הוספת עובד דורשת מנוי',       description: 'שדרג מנוי כדי להוסיף עובדים נוספים.' },
};

export function UpgradePrompt({ open, onClose, reason = 'pdf_limit' }: UpgradePromptProps) {
  const navigate = useNavigate();
  const { title, description } = MESSAGES[reason];

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <div className="flex justify-end gap-3 pt-2">
          <Button variant="outline" onClick={onClose}>סגור</Button>
          <Button onClick={() => { onClose(); navigate('/subscriptions'); }}>
            שדרג מנוי
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add client/src/domains/subscriptions/components/UpgradePrompt.tsx
git commit -m "feat(client/subscriptions): add UpgradePrompt dialog component"
```

---

### Task 14: Client — Gate PDF + email in FormContainer

**Files:**
- Modify: `client/src/domains/forms/components/FormContainer.tsx`

- [ ] **Step 1: Add imports**

At the top of `FormContainer.tsx`, add:
```typescript
import { useEmployeeSubscription, useRecordGenerate } from '@/domains/subscriptions/hooks/useEmployeeSubscription';
import { UpgradePrompt } from '@/domains/subscriptions/components/UpgradePrompt';
```

- [ ] **Step 2: Add hook + state inside the component**

Inside `FormContainer`, after the existing state declarations, add:
```typescript
  const [upgradeOpen, setUpgradeOpen]           = useState(false);
  const [upgradeReason, setUpgradeReason]        = useState<'pdf_limit' | 'email' | 'final_settlement' | 'worklog' | 'employee'>('pdf_limit');
  const { data: subStatus }                      = useEmployeeSubscription(employeeId);
  const recordGenerate                           = useRecordGenerate();
```

- [ ] **Step 3: Replace handleOpenPdf logic**

Find the existing PDF button:
```tsx
<Button
  type="button"
  variant="outline"
  onClick={() => setPdfDialogOpen(true)}
  ...
>
```

Replace `onClick` with a gated version:
```tsx
onClick={async () => {
  if (!formId) return;
  try {
    const result = await recordGenerate.mutateAsync(formId);
    if (!result.allowed) {
      setUpgradeReason('pdf_limit');
      setUpgradeOpen(true);
    } else {
      setPdfDialogOpen(true);
    }
  } catch {
    setUpgradeReason('pdf_limit');
    setUpgradeOpen(true);
  }
}}
disabled={!existingForm || recordGenerate.isPending}
```

- [ ] **Step 4: Replace email button gate**

Find:
```tsx
disabled={!existingForm || !currentUser?.hasSubscription}
title={!currentUser?.hasSubscription ? t('email.subscriptionRequired') : undefined}
```

Replace with:
```tsx
disabled={!existingForm || !subStatus?.features.sendEmail}
title={!subStatus?.features.sendEmail ? t('email.subscriptionRequired') : undefined}
```

Find:
```tsx
{existingForm && currentUser?.hasSubscription && (
  <SendEmailDialog ...
```

Replace with:
```tsx
{existingForm && subStatus?.features.sendEmail && (
  <SendEmailDialog ...
```

- [ ] **Step 5: Add UpgradePrompt to the JSX**

Before the closing `</FormProvider>`, add:
```tsx
<UpgradePrompt
  open={upgradeOpen}
  onClose={() => setUpgradeOpen(false)}
  reason={upgradeReason}
/>
```

- [ ] **Step 6: Remove currentUser dependency for subscription**

The `currentUser` import may still be needed for employer info in form defaults — keep it. Just remove the `hasSubscription` usages replaced in steps 4-5.

- [ ] **Step 7: Commit**

```bash
git add client/src/domains/forms/components/FormContainer.tsx
git commit -m "feat(client/forms): gate PDF generation and email send behind subscription"
```

---

### Task 15: Client — Gate new employee button

**Files:**
- Modify: `client/src/domains/employees/EmployeeCardsPage.tsx`

- [ ] **Step 1: Add imports**

```typescript
import { useSubscriptions, useCreateSubscription } from '@/domains/subscriptions/hooks/useEmployeeSubscription';
import { UpgradePrompt } from '@/domains/subscriptions/components/UpgradePrompt';
```

- [ ] **Step 2: Add hook + state**

Inside `EmployeeCardsPage`:
```typescript
  const { data: subscriptions }           = useSubscriptions();
  const [upgradeOpen, setUpgradeOpen]     = useState(false);
  const hasAnySubscription                = (subscriptions ?? []).length > 0;
```

- [ ] **Step 3: Replace "New Employee" onClick**

Find the `<Button ... onClick={() => navigate('/employees/new')}>` button.

Replace its `onClick`:
```typescript
onClick={() => {
  const alreadyHasEmployee = employees && employees.length >= 1;
  if (alreadyHasEmployee && !hasAnySubscription) {
    setUpgradeOpen(true);
  } else {
    navigate('/employees/new');
  }
}}
```

- [ ] **Step 4: Add UpgradePrompt**

At the bottom of the returned JSX:
```tsx
<UpgradePrompt open={upgradeOpen} onClose={() => setUpgradeOpen(false)} reason="employee" />
```

- [ ] **Step 5: Commit**

```bash
git add client/src/domains/employees/EmployeeCardsPage.tsx
git commit -m "feat(client/employees): block adding 2nd employee without subscription"
```

---

### Task 16: Client — Subscriptions management page + routing

**Files:**
- Create: `client/src/pages/SubscriptionsPage.tsx`
- Modify: `client/src/App.tsx`
- Modify: `client/src/shared/components/Sidebar.tsx`

- [ ] **Step 1: Create SubscriptionsPage**

```tsx
// client/src/pages/SubscriptionsPage.tsx
import { CreditCard, CheckCircle, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PageLoading } from '@/shared/components/LoadingSpinner';
import { useSubscriptions, useCreateSubscription, useCancelSubscription } from '@/domains/subscriptions/hooks/useEmployeeSubscription';
import { useEmployees } from '@/domains/employees/hooks/useEmployees';
import { useResolveMultiLang } from '@/hooks/useResolveMultiLang';
import type { ISubscription } from '@payslips-maker/shared';

export function SubscriptionsPage() {
  const { data: subscriptions, isLoading: subLoading }  = useSubscriptions();
  const { data: employees,     isLoading: empLoading }  = useEmployees();
  const createSub  = useCreateSubscription();
  const cancelSub  = useCancelSubscription();
  const resolve    = useResolveMultiLang();

  if (subLoading || empLoading) return <PageLoading />;

  const hasFullPlan = subscriptions?.some((s) => s.plan === 'full' && s.status === 'active');

  function getEmployeeSubscription(employeeId: string): ISubscription | undefined {
    return subscriptions?.find(
      (s) => s.plan === 'per_employee' && s.employeeId === employeeId && s.status === 'active'
    );
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center gap-3">
        <CreditCard className="h-6 w-6 text-[#1B2A4A]" />
        <h1 className="text-2xl font-bold text-[#1B2A4A]">מנויים</h1>
      </div>

      {/* Full plan */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>מנוי מלא — 85 ₪ / חודש</span>
            {hasFullPlan ? (
              <Badge variant="default">פעיל</Badge>
            ) : (
              <Badge variant="outline">לא פעיל</Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <p className="text-sm text-muted-foreground">פותח את כל התכונות לכל העובדים: PDF ללא הגבלה, שליחת מייל, גמר חשבון, יומן עבודה.</p>
          {hasFullPlan ? (
            <Button
              variant="destructive"
              size="sm"
              onClick={() => {
                const sub = subscriptions!.find((s) => s.plan === 'full');
                if (sub) cancelSub.mutate(sub._id);
              }}
            >
              בטל מנוי
            </Button>
          ) : (
            <Button
              size="sm"
              onClick={() => createSub.mutate({ plan: 'full' })}
              disabled={createSub.isPending}
            >
              {/* Bit payment integration wires here */}
              הירשם — 85 ₪ / חודש
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Per-employee subscriptions */}
      <div className="space-y-3">
        <h2 className="font-semibold text-lg">מנוי לפי עובד — 40 ₪ / חודש לעובד</h2>
        {employees?.map((emp) => {
          const sub = getEmployeeSubscription(emp._id);
          return (
            <Card key={emp._id}>
              <CardContent className="flex items-center justify-between py-4">
                <div className="flex items-center gap-2">
                  {sub ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : (
                    <XCircle className="h-4 w-4 text-muted-foreground" />
                  )}
                  <span className="font-medium">{resolve(emp.fullName)}</span>
                </div>
                <div className="flex items-center gap-2">
                  {sub ? (
                    <>
                      <Badge variant="default">פעיל</Badge>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => cancelSub.mutate(sub._id)}
                      >
                        בטל
                      </Button>
                    </>
                  ) : (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => createSub.mutate({ plan: 'per_employee', employeeId: emp._id })}
                      disabled={createSub.isPending || !!hasFullPlan}
                    >
                      {/* Bit payment integration wires here */}
                      הירשם — 40 ₪ / חודש
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
        {employees?.length === 0 && (
          <p className="text-muted-foreground text-sm">אין עובדים עדיין.</p>
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Add route to App.tsx**

In `client/src/App.tsx`, add the lazy import:
```typescript
const SubscriptionsPage = lazy(() =>
  import('@/pages/SubscriptionsPage').then((m) => ({ default: m.SubscriptionsPage }))
);
```

Inside the `<Route element={<ProtectedRoute />}>` block, add:
```tsx
<Route
  path="subscriptions"
  element={
    <Suspense fallback={<PageLoading />}>
      <SubscriptionsPage />
    </Suspense>
  }
/>
```

- [ ] **Step 3: Add nav item to Sidebar**

Open `client/src/shared/components/Sidebar.tsx`. Find where other nav items are defined (look for patterns like `<SidebarItem to="/settings" ...>` or a nav items array). Add a Subscriptions entry with `CreditCard` icon:

```tsx
import { CreditCard } from 'lucide-react';
// ...
<SidebarItem to="/subscriptions" icon={<CreditCard className="h-5 w-5" />} label="מנויים" />
```

*The exact placement and syntax depends on the Sidebar component's existing pattern — match it.*

- [ ] **Step 4: Typecheck both workspaces**

```bash
npm run typecheck
```
Expected: no errors in client or server.

- [ ] **Step 5: Commit**

```bash
git add client/src/pages/SubscriptionsPage.tsx client/src/App.tsx client/src/shared/components/Sidebar.tsx
git commit -m "feat(client/subscriptions): add SubscriptionsPage, route, and sidebar nav"
```

---

### Task 17: Smoke test + final typecheck

- [ ] **Step 1: Start the dev server**

```bash
npm run dev
```

- [ ] **Step 2: Verify these flows work**

1. **Free user, 0 generates used** — click Generate PDF → PDF opens, badge shows "2 of 3 remaining"
2. **Free user, 3 generates used** — click Generate PDF → UpgradePrompt appears
3. **Email button** — disabled with tooltip when no subscription; enabled when subscribed
4. **Add Employee** — blocked with UpgradePrompt when user has 1 employee and no subscription
5. **New form (final settlement)** — 403 from server if no subscription (check network tab)
6. **Worklog** — 403 from server if no subscription
7. **Subscriptions page** — `/subscriptions` renders, subscribe/cancel buttons work

- [ ] **Step 3: Final typecheck**

```bash
npm run typecheck
```
Expected: zero errors.

- [ ] **Step 4: Final commit**

```bash
git add -A
git commit -m "chore: final subscription system wiring and smoke-test fixes"
```

---

## Post-Implementation Notes

- **Bit integration hook:** `POST /api/subscriptions` body `{ plan, employeeId? }` is where Bit's webhook or redirect callback will call. Add `billingRef` to the payload when wiring it.
- **Subscription expiry:** A cron job to flip `status: 'expired'` when `expiresAt` passes is not implemented. Until Bit is live and subscriptions auto-renew, subscriptions created via the stub last exactly 1 month from creation.
- **Admin override:** Admins (impersonating users) currently go through the same gate checks against the impersonated user's subscriptions. This is intentional.
- **`useEmployees` hook:** Referenced in `EmployeeCardsPage` — it presumably exists at `client/src/domains/employees/hooks/useEmployees.ts`. Verify the `del` method also exists on `useApiClient` before Task 12.
