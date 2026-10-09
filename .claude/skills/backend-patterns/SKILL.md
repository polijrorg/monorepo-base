---
name: backend-patterns
description: This skill should be used when the user asks to create an API route, service, endpoint, backend handler, or anything inside src/app/(backend)/. Provides the controller/service/schema pattern, utility functions, and error format for this monorepo.
version: 1.0.0
---

# Backend Patterns

Apply these patterns whenever creating or modifying backend code in `src/app/(backend)/`.

## Non-negotiable rules

1. **Route handlers are HTTP-only** — no Prisma, no business logic
2. **All business logic lives in services** — one service function per operation
3. **All external input must be validated with Zod** before touching a service
4. **Error shape is always** `{ error: { message: "..." } }` — use `toErrorMessage(error)`
5. **Success shape** — return the data object directly, no wrapping

## Required utility imports in every route handler

```typescript
import { blockForbiddenRequests } from '@/utils/blockForbiddenRequests'
import { getUserFromRequest } from '@/utils/getUserFromRequest'
import { toErrorMessage } from '@/utils/toErrorMessage'
import { returnInvalidDataErrors } from '@/utils/returnInvalidDataErrors'
```

Never reimplement these. Never catch and silently discard errors.

## URL naming

Resources are always plural. Sub-resources use nested paths:
- `/api/users` ✓
- `/api/user` ✗
- `/api/users/[id]/lessons` ✓

## Better Auth

- Auth operations → `auth.api.*` methods only
- Do **not** install or import `@auth/prisma-adapter`
- Do **not** expose password or email update via generic PATCH routes

## Integration tests

Every new route → a test file in `tests/integration/api/{resource}/`. Mock pattern:

```typescript
vi.mock('@/backend/services/{resource}', () => ({ methodName: vi.fn() }))
vi.mock('@/auth', () => ({ auth: vi.fn() }))
```
