---
name: security-patterns
description: This skill should be used when the user touches authentication flows, authorization logic, environment variables, input validation, or any route that handles user identity or sensitive data. Provides security checklist and anti-patterns for this monorepo.
version: 1.0.0
---

# Security Patterns

Apply these checks whenever touching auth, input handling, or sensitive data.

## Authorization checklist for every route handler

- [ ] `blockForbiddenRequests(req)` called before any logic
- [ ] `getUserFromRequest(req)` used to get identity — never trust body/params for user ID
- [ ] Ownership verified: `resource.userId === user.id` before returning or mutating
- [ ] State-mutating methods (POST/PUT/DELETE/PATCH) always behind auth

## Input validation checklist

- [ ] All `req.json()`, `req.searchParams`, `params` validated with Zod `safeParse`
- [ ] Validation result checked with `.success` before use
- [ ] `returnInvalidDataErrors(validation)` returned on failure — never expose Zod internals
- [ ] No direct use of unvalidated input in Prisma queries or template strings

## Environment variables

- Server-only secrets: `DATABASE_URL`, `BETTER_AUTH_SECRET`, `GOOGLE_SECRET`, `RESEND_API_KEY`
  - Must **not** have `NEXT_PUBLIC_` prefix
  - Must **not** appear in `next.config.ts` `env` block
- Public client vars: only `NEXT_PUBLIC_APP_URL`, `NEXT_PUBLIC_POSTHOG_*`
- Never log secrets, never return them in API responses

## Error handling

```typescript
// Correct — normalize before returning
catch (error) {
  return NextResponse.json(
    { error: { message: toErrorMessage(error) } },
    { status: 500 }
  )
}

// Wrong — leaks stack traces and DB internals
catch (error) {
  return NextResponse.json({ error: error.message }, { status: 500 })
}
```

## Better Auth constraints

- Password/email changes → dedicated Better Auth endpoints **only**
- `@auth/prisma-adapter` is **not** used here — do not install it
- OAuth: `GOOGLE_ID` and `GOOGLE_SECRET` are server-only — never `NEXT_PUBLIC_`

## Response hygiene

- Never return full Prisma objects — select only the fields the client needs
- Never return password hashes, internal IDs, or system metadata
- Paginated endpoints must enforce server-side `take` limits
