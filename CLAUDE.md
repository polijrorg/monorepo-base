# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository Overview

This is the NTec (PoliJunior) monorepo template — a full-stack web + mobile framework using pnpm workspaces. It contains three packages:

- `web/` — Next.js 16 full-stack app (frontend + backend API)
- `mobile/` — Expo 55 (React Native) app
- `bruno/` — Bruno API collection for documenting and testing endpoints

## Common Commands

Run from the respective workspace directory (`web/` or `mobile/`):

**Web:**
```bash
pnpm dev          # Next.js dev server (Turbopack)
pnpm build        # Production build
pnpm lint         # ESLint with auto-fix
pnpm lint:check   # ESLint check only
pnpm test         # Vitest integration tests (run once)
pnpm test:watch   # Vitest in watch mode
pnpm test:e2e     # Playwright e2e tests
pnpm coverage     # Vitest with coverage
```

**Mobile:**
```bash
pnpm start        # Expo dev server
pnpm ios          # iOS simulator
pnpm android      # Android emulator
pnpm lint         # ESLint + Prettier check
pnpm format       # ESLint + Prettier fix
```

**Root:**
```bash
pnpm install      # Install all workspace dependencies
```

## Environment Setup

**Web** — create `web/.env` from `web/.env.example`:
- `DATABASE_URL` — MongoDB Atlas connection string
- `BETTER_AUTH_SECRET` — generate with `openssl rand -base64 32`
- Google OAuth: `GOOGLE_ID`, `GOOGLE_SECRET`
- Email: Resend API key
- AWS S3 credentials (optional)

`prisma generate` runs automatically on `postinstall`.

**Mobile** — create `mobile/.env` from `mobile/.env.example`:
- `EXPO_PUBLIC_BACKEND_URL` — URL of the running web backend

## Architecture

### Web: Route Groups and Code Organization

The Next.js `src/app/` is split into two route groups:

- `(backend)/` — API-only code. Contains:
  - `api/` — Route handlers (controllers)
  - `services/` — Business logic (never use Prisma in routes)
  - `schemas/` — Zod validation schemas
- `(frontend)/` — Page components, split by auth context:
  - `(auth)/` — Login/register pages
  - `(user-protected)/` — Authenticated user pages
  - `(landing-pages)/` — Public pages
  - `admin/` — Admin panel

Non-route source code lives in `src/`:
- `components/` — Shared reusable UI components
- `hooks/` — Shared React hooks
- `lib/` — Core utilities, email templates
- `utils/` — Utility functions (blockForbiddenRequests, toErrorMessage, etc.)
- `types/` — Shared TypeScript types
- `auth.ts` — Better Auth instance configuration

### Backend Patterns (Controller/Service/Schema)

Follow the MVC-like pattern for all new API routes:

1. **Route handler** (`api/{resource}/route.ts`) — HTTP layer only; no Prisma calls
2. **Service** (`services/{resource}/`) — Business logic with Prisma
3. **Schema** (`schemas/{resource}.schema.ts`) — Zod validation

Always use utility functions for common operations:
- `blockForbiddenRequests` — authorization guard
- `toErrorMessage` — error formatting
- `getUserFromRequest` — extract authenticated user
- `returnInvalidDataErrors(validationResult)` — Zod error response

Error responses must follow `{ error: { message: "..." } }`. Success responses return a plain object (no wrapping `message` field).

Resources must be plural (`/users`, `/materias`, `/lessons`).

### Authentication (Better Auth)

Better Auth manages most user operations automatically — use its built-in functions instead of custom implementations. Do **not** allow direct updates to user passwords or emails via generic update routes; use dedicated auth endpoints for those. Refer to `web/docs/BETTER-AUTH.md` for the custom routes added beyond the library defaults.

### Frontend Patterns

- Components must be < 200 lines; follow SOLID principles
- Reusable components → `src/components/`
- Page-specific components → `{domain}/_components/` (with `index.ts`)
- Page-specific utilities/actions → `{domain}/_utils/`, `{domain}/actions/`
- API call functions live in an `actions/` folder (use SWR for fetching, plain fetch for mutations)

Import order:
1. Hooks → helper functions → types
2. Icons/CSS → general components → domain-specific components

UI conventions:
- Icons: `lucide-react`
- Fonts: `next/font`
- Alerts: `toast.success` / `toast.error` (react-hot-toast)
- shadcn/ui for component primitives

### TypeScript Path Aliases

**Web:**
- `@/*` → `src/`
- `@/backend/*` → `src/app/(backend)/*`
- `@/frontend/*` → `src/app/(frontend)/*`

**Mobile:**
- `~/*` → project root

### Testing

Integration tests (Vitest) live in `web/tests/integration/`. All new API routes must have integration tests.

E2E tests (Playwright) live in `web/tests/e2e/`.

## Key Docs

- `web/docs/API.md` — REST API specs and patterns
- `web/docs/BETTER-AUTH.md` — Auth library usage and constraints
- `web/docs/FRONTEND.md` — Frontend component and import patterns
- `bruno/` — API request collections for manual testing
