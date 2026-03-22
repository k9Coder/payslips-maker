# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Full-stack TypeScript monorepo for generating Israeli payslips for foreign employees. Three workspaces: `shared` (types), `client` (React + Vite), `server` (Express + MongoDB).

## Commands

```bash
# Run both client and server in dev mode
npm run dev

# Run individual workspaces
npm run dev -w client    # Vite dev server on :5173
npm run dev -w server    # tsx watch on :3001

# Build (order matters: shared → server → client)
npm run build

# Type checking
npm run typecheck                # Root (references all)
npm run typecheck -w client
npm run typecheck -w server
```

No test suite exists in this project.

## Architecture

### Monorepo Structure
- **`shared/`** — TypeScript interfaces only, no runtime code. Consumed via path alias `@shared` in client and TypeScript project references in server.
- **`client/`** — React 18 + Vite. Path alias `@` maps to `src/`. Proxies `/api` to `:3001` in dev.
- **`server/`** — Express + Mongoose. Compiles to `dist/`. Environment validated via Zod at startup.

### Client Domain Organization
Code is organized under `client/src/domains/` by feature:
- `payslip/` — PayslipForm (react-hook-form + Zod), PayslipPDF (@react-pdf/renderer), tax calculations
- `admin/` — Admin views and hooks
- `auth/` — ProtectedRoute wrapper

### Authentication Flow
1. Clerk handles auth on client (JWT tokens attached to requests)
2. `auth.middleware.ts` validates JWT via `@clerk/backend`
3. **Webhook route (`/api/webhooks/clerk`) MUST be registered BEFORE `express.json()`** — Svix requires raw Buffer body for signature verification
4. `POST /api/users/sync` acts as a safety net for race conditions on first login

### Admin Access
The `isAdmin` flag on User model must be set **manually in MongoDB** — there is no API endpoint to promote users.

### PDF Generation
- Uses `@react-pdf/renderer` with bundled `.ttf` files from `client/public/fonts/` (Heebo Regular, Bold, Medium)
- Do NOT use Google Fonts CSS imports for PDF — must be registered TTF files
- PDF generation runs entirely client-side

### Hebrew / RTL
- HTML element has `lang="he" dir="rtl"`
- Use logical CSS margin classes (`ms-`, `me-`) not directional (`ml-`, `mr-`)
- Font family: Heebo throughout

### Key Environment Variables

**Server** (`server/.env`, validated in `server/src/infrastructure/env.ts`):
- `PORT` (default 3001)
- `MONGODB_URI`
- `CLERK_SECRET_KEY`
- `CLERK_WEBHOOK_SECRET`
- `CLIENT_ORIGIN`

**Client** (`client/.env`):
- `VITE_CLERK_PUBLISHABLE_KEY`

### API Surface
- `GET|PATCH /api/users/me`, `POST /api/users/sync`
- `GET|POST /api/forms`, `GET|PATCH /api/forms/:id`
- `GET /api/admin/users`, `GET /api/admin/users/:id`, `GET /api/admin/forms`
- `GET /health`
