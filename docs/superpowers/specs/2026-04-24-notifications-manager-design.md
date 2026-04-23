# Notifications Manager — Design Spec

**Date:** 2026-04-24  
**Status:** Approved

---

## Overview

Admin-only feature that lets the system administrator configure scheduled WhatsApp and email notifications sent to users (employers). The admin picks which users to notify, which channels to use per user, and sets up to 3 recurring monthly notification events — each with its own day, time (Israeli timezone), and message template.

---

## Data Model

### User model — new field

```ts
notificationChannels: [String]  // enum values: 'email' | 'whatsapp'
// [] = no notifications, ['email'] = email only, ['email','whatsapp'] = both
```

`phone` already exists on the User model (optional). WhatsApp eligibility is derived as `!!user.phone` — no new field needed.

### New collection: `NotificationEvent`

```ts
{
  day: Number,              // 1–31, day of month
  hour: Number,             // 0–23, Israeli time (Asia/Jerusalem)
  minute: Number,           // 0–59
  messageTemplate: String,  // e.g. "היי {{name}}, הגיע הזמן לשלוח תלושי שכר. כנס: {{link}}"
  enabled: Boolean,         // default true
  createdAt, updatedAt      // timestamps
}
```

Maximum 3 documents enforced at the service layer (POST rejects if 3 already exist).

### `agendaJobs` collection

Managed entirely by Agenda — no manual writes.

---

## API Surface

### Notification Events (new router: `/api/admin/notifications`)

```
GET    /api/admin/notifications/events        list all events
POST   /api/admin/notifications/events        create event (rejects if 3 exist)
PATCH  /api/admin/notifications/events/:id    update day/hour/minute/template/enabled
DELETE /api/admin/notifications/events/:id    delete event
```

All routes protected by existing `adminMiddleware`.

### Users (extend existing admin user endpoints)

- `GET /api/admin/users` — extended with query object support at the repository layer. The router passes query params to the repository which translates them into a Mongoose query (e.g. `?hasPhone=true` to filter users with a phone number, `?fields=notificationChannels` to include notification fields in the projection).
- `PATCH /api/admin/users/bulk` — new: `{ ids: string[], notificationChannels: string[] }` for select-all / deselect-all. **Must be registered before `/:id` in the Express router** to avoid `bulk` being matched as an id param.
- `PATCH /api/admin/users/:id` — extended to accept `notificationChannels` as a patchable field.

---

## Backend Scheduler

### Technology

**Agenda** (MongoDB-based job queue) — chosen for restart-resilience with zero new infrastructure. Persists scheduled jobs to MongoDB (existing connection). Adds one `agenda` npm package.

### Scheduling logic

A `NotificationScheduler` service is initialized at server startup:

1. Cancels all existing `send-notification` Agenda jobs.
2. Loads all enabled `NotificationEvent` docs from DB.
3. Schedules each as a monthly cron job with `timezone: 'Asia/Jerusalem'`.

Cron expression per event: `'MM HH DD * *'` (minute, hour, day-of-month).

On any event CRUD via the API, the scheduler is re-synced (cancel all → reschedule from DB). If an event is created for a day that has already passed in the current month, Agenda schedules it for the next month's occurrence — this is expected behavior.

### Job handler (`send-notification`)

1. Fetches the firing `NotificationEvent` (for the message template).
2. Fetches all users where `notificationChannels` is not empty.
3. For each user:
   - `'email'` in `notificationChannels` → sends via SendGrid (already configured). Body = `messageTemplate` with `{{name}}` (user's fullName) and `{{link}}` (`CLIENT_ORIGIN` from existing env) interpolated.
   - `'whatsapp'` in `notificationChannels` AND `user.phone` exists → sends via Meta WhatsApp Cloud API using the pre-approved template, passing name and app link as the two template parameters.

### WhatsApp constraint

Meta requires pre-approved message templates for business-initiated outbound messages. The template is created once in the Meta Business dashboard with two variables: `{{1}}` = user name, `{{2}}` = app link. The `messageTemplate` field on `NotificationEvent` is used for **email only**; WhatsApp always derives name + link from the user record and app config.

### New environment variables

```
WHATSAPP_PHONE_NUMBER_ID    # Meta Cloud API phone number ID
WHATSAPP_ACCESS_TOKEN       # Meta permanent access token
WHATSAPP_TEMPLATE_NAME      # name of the pre-approved Meta template
```

---

## UI

### Sidebar

New admin-only item added after existing admin items:

```
icon: Bell (lucide)
label: מנהל התראות
route: /admin/notifications
```

### Page: `/admin/notifications`

Single page (no tabs), two stacked card sections:

#### Section 1 — Schedules (אירועי התראה)

- Displays up to 3 event cards side by side.
- Each card shows: day, time (HH:MM), enabled toggle, truncated message preview, Edit + Delete buttons.
- A dashed "+" card is shown when fewer than 3 events exist.
- Clicking Edit or "+" opens a dialog with:
  - Day picker (number input, 1–31)
  - Time picker (hour + minute)
  - Message template textarea with placeholder hints (`{{name}}`, `{{link}}`)
  - Save / Cancel

#### Section 2 — Users (משתמשים)

- "בחר הכל" / "בטל הכל" bulk-action buttons.
- Table columns: Name | Email | WhatsApp toggle | Email toggle.
- WhatsApp toggle is **disabled and greyed out** if `!user.phone`, with a tooltip: "אין מספר טלפון".
- Each toggle fires `PATCH /api/admin/users/:id` immediately (optimistic update with rollback on error).

---

## Out of Scope

- Per-user custom schedules (all users share the same events).
- Admin-editable WhatsApp template text (template is managed in Meta's dashboard).
- Notification history / logs (not in this iteration).
- Employee-level notifications (employees have no accounts in the system).
