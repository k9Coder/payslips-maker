# Subscription System Design

**Date:** 2026-05-11
**Status:** Approved

## Overview

Replace the existing `hasSubscription: boolean` flag with a proper per-employee subscription system. Two paid tiers unlock features at different granularities. Bit payment integration is deferred — stubs are wired now so it plugs in cleanly later.

---

## Subscription Tiers

| Tier | Price | Scope | Unlocks |
|---|---|---|---|
| Free | 0 ILS | Per user | 1 employee, 3 PDF generates, no email/worklog/final settlement |
| `per_employee` | 40 ILS/month | Per employee | Unlimited generates, email, worklog, final settlement for that employee |
| `full` | 85 ILS/month | All employees | Everything, unlimited employees |

---

## Section 1 — Data Model

### New: `Subscription` collection

```ts
// shared/src/types/subscription.types.ts
export type SubscriptionPlan   = 'per_employee' | 'full';
export type SubscriptionStatus = 'active' | 'cancelled' | 'expired';

export interface ISubscription {
  _id:        string;
  userId:     string;
  plan:       SubscriptionPlan;
  employeeId?: string;       // set for per_employee; absent for full
  status:     SubscriptionStatus;
  amountILS:  number;        // 40 or 85 — stored so history survives price changes
  startedAt:  Date | string;
  expiresAt:  Date | string;
  billingRef?: string;       // Bit transaction ID, wired in later
  createdAt:  Date | string;
  updatedAt:  Date | string;
}

export interface CreateSubscriptionDto {
  plan:        SubscriptionPlan;
  employeeId?: string;
}
```

Mongoose schema lives at `server/src/domains/subscriptions/subscription.model.ts`.

### Changed: `IUser`

Remove `hasSubscription: boolean`. Subscription status is always derived from the Subscription collection at request time — no stale flag.

### Changed: `IEmployee`

Add `pdfGenerateCount: number` (default `0`). Tracks free-tier PDF generates for this employee. Ignored once the employee has an active subscription.

---

## Section 2 — Feature Gate Module

A single file owns all gate rules. To add a feature or change a limit, touch one line in one place.

```ts
// server/src/domains/subscriptions/subscription.gates.ts

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
```

### `checkGate` function

```ts
checkGate(
  feature: Feature,
  subscriptions: ISubscription[],
  options?: { employeeId?: string; currentCount?: number }
): { allowed: boolean; reason?: string; remaining?: number }
```

- `any_subscription`: allowed if any active subscription exists.
- `employee_unlock`: allowed if user has active `full` plan, or active `per_employee` for `employeeId`.
- `employee_unlock_or_free_limit`: employee_unlock check first; if not unlocked, allowed while `currentCount < freeLimit`, returns `remaining`.

### `requireFeature` middleware factory

```ts
requireFeature(feature: Feature, getEmployeeId?: (req: Request) => string | undefined)
  → Express middleware
```

Returns `403 { error: 'FEATURE_LOCKED', reason }` if the gate fails. Used directly on routes — no changes to auth middleware logic beyond loading subscriptions.

### Auth middleware addition

Auth middleware loads active subscriptions once per request:
```ts
req.activeSubscriptions = await SubscriptionService.getActiveByUserId(req.userId)
```
All `checkGate` calls read from this — zero extra DB queries per gate check.

---

## Section 3 — API Surface

### New: `/api/subscriptions`

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/api/subscriptions` | user | List user's active subscriptions |
| GET | `/api/subscriptions/employee/:employeeId` | user | Gate status for one employee: `{ plan, features: { generatePdf, sendEmail, finalSettlement, worklog } }` |
| POST | `/api/subscriptions` | user | Create subscription — stub for now, Bit wires here. Body: `{ plan, employeeId? }` |
| DELETE | `/api/subscriptions/:id` | user | Cancel subscription |

### New: `POST /api/forms/:id/generate`

Gate check + increment `pdfGenerateCount` on the employee if free tier.

Response: `{ allowed: boolean, remaining: number | null }` (`null` = unlimited).

Client calls this before rendering the PDF. If `allowed: false`, show upgrade prompt instead.

### Changed endpoints

| Endpoint | Change |
|---|---|
| `POST /api/forms` | Add `requireFeature(Feature.FINAL_SETTLEMENT)` guard when `formType === 'final_settlement'` |
| `POST /api/forms/:id/send-email` | Replace `subscriptionMiddleware` with `requireFeature(Feature.SEND_EMAIL, ...)` |
| `POST /api/employees` | Add `requireFeature(Feature.CREATE_ADDITIONAL_EMPLOYEE)` when user already has ≥1 employee |
| `GET /api/worklog/*` | Add `requireFeature(Feature.WORKLOG, ...)` |

### Removed

- `subscriptionMiddleware` — replaced entirely by `requireFeature`
- `hasSubscription` on `IUser` — no longer needed

---

## Section 4 — Client-Side Changes

### New hook: `useEmployeeSubscription(employeeId)`

Fetches `GET /api/subscriptions/employee/:employeeId`. Returns `{ plan, features }`. Used everywhere the UI gates on subscription.

### Generate PDF button

1. Calls `POST /api/forms/:id/generate` before rendering PDF.
2. If `allowed: false` → show upgrade prompt modal.
3. If `allowed: true` and `remaining !== null` → show badge: `"X of 3 free generates remaining"`.
4. Subscribed employees: no badge, no gate.

### Employee list / employee card

- Subscription badge per employee: `Free (2/3 generates used)` or `Subscribed`.
- "Subscribe" CTA on unsubscribed employees.

### Add Employee flow

If user has no active subscription and already has ≥1 employee → show upgrade prompt before hitting the server. Do not rely solely on the server 403.

### Final settlement tab/button

Hidden or disabled (with tooltip: "Requires subscription") when `features.finalSettlement === false`.

### Worklog

Same pattern — disabled with tooltip when `features.worklog === false`.

### Email send button

Replace current `hasSubscription` boolean check with `features.sendEmail` from `useEmployeeSubscription`.

### New: Subscription management page

Route: `/subscriptions`

Contents:
- Current plan per employee (table or card list)
- Subscribe / cancel buttons per employee
- Global "Subscribe to full plan" option
- Payment section is a stub: button renders, Bit integration wired later

---

## Deferred

- Bit payment integration: `billingRef` field on `ISubscription` is the hook. `POST /api/subscriptions` accepts the payload now; payment verification is added when Bit is ready.
- Subscription expiry cron job: a background job to mark `status: 'expired'` when `expiresAt` passes. Not needed until Bit is live.
- Admin subscription management view.
