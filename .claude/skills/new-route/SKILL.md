---
name: new-route
description: Scaffold a new API route following the controller/service/schema pattern. Creates route.ts, service files, Zod schema, and integration test stub.
argument-hint: <resource-name> [--methods GET,POST,PUT,DELETE] [--auth] [--public]
allowed-tools: [Read, Write, Bash, Glob, Grep]
---

# New API Route

Scaffold a complete API route following the monorepo's MVC pattern.

## Arguments

- `$ARGUMENTS` — parse the resource name and flags:
  - Resource name (required): e.g. `lessons`, `user-profiles`
  - `--methods GET,POST,PUT,DELETE` — which HTTP methods to scaffold (default: GET,POST)
  - `--auth` — all methods require authentication (default)
  - `--public` — skip `blockForbiddenRequests` on GET methods

## What to build

Given resource name (always use plural, e.g. `lessons`):

### 1. Route handler — `src/app/(backend)/api/{resource}/route.ts`

For each selected method, generate a handler following this exact pattern:

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { blockForbiddenRequests } from '@/utils/blockForbiddenRequests'
import { getUserFromRequest } from '@/utils/getUserFromRequest'
import { toErrorMessage } from '@/utils/toErrorMessage'
import { returnInvalidDataErrors } from '@/utils/returnInvalidDataErrors'
import { create{Resource}Schema } from '@/backend/schemas/{resource}.schema'
import * as {resource}Service from '@/backend/services/{resource}'

export async function POST(req: NextRequest) {
  try {
    await blockForbiddenRequests(req)
    const user = await getUserFromRequest(req)

    const body = await req.json()
    const validation = create{Resource}Schema.safeParse(body)
    if (!validation.success) return returnInvalidDataErrors(validation)

    const result = await {resource}Service.create{Resource}(validation.data, user.id)
    return NextResponse.json(result, { status: 201 })
  } catch (error) {
    return NextResponse.json(
      { error: { message: toErrorMessage(error) } },
      { status: 500 }
    )
  }
}
```

Skip `blockForbiddenRequests` and `getUserFromRequest` only on GET if `--public` was passed.

### 2. Service — `src/app/(backend)/services/{resource}/`

Create one file per method selected:
- `find{Resource}s.ts` (GET list)
- `find{Resource}ById.ts` (GET single)
- `create{Resource}.ts` (POST)
- `update{Resource}.ts` (PUT/PATCH)
- `delete{Resource}.ts` (DELETE)
- `index.ts` — barrel export of all above

Each service imports `prisma` from `@/lib/prisma` and has a typed function signature.

### 3. Zod schema — `src/app/(backend)/schemas/{resource}.schema.ts`

```typescript
import { z } from 'zod'

export const create{Resource}Schema = z.object({
  // Add fields — ask user or use sensible placeholder with TODO comment
})

export type Create{Resource}Input = z.infer<typeof create{Resource}Schema>
```

### 4. Integration test — `tests/integration/api/{resource}/index.test.ts`

Scaffold a test file that:
- Mocks `@/backend/services/{resource}` with `vi.mock()`
- Mocks `@/auth` with `vi.mock()`
- Has one `describe` block per HTTP method
- Has at minimum: a success case and an unauthorized case

## After scaffolding

1. Read the existing `web/prisma/schema.prisma` to see current models
2. If the resource doesn't have a Prisma model yet, print a Prisma model snippet the developer should add
3. Print the new files created with their paths
4. Remind: run `pnpm --filter web test` to verify the integration test passes
