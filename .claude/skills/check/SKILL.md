---
name: check
description: Run lint and typecheck for web and mobile workspaces. Reports all errors before a push.
argument-hint: [web | mobile | all]
allowed-tools: [Bash]
---

# Check

Run lint and typecheck across workspaces. Use before pushing to catch issues that CI will flag.

## Arguments

- No argument or `all` → run both web and mobile
- `web` → run web only
- `mobile` → run mobile only

## Execution

### Web checks (if scope includes web)

```bash
pnpm --filter web lint:check
pnpm --filter web exec tsc --noEmit
```

### Mobile checks (if scope includes mobile)

```bash
pnpm --filter mobile lint
pnpm --filter mobile exec tsc --noEmit
```

Run lint before typecheck. Stop and report immediately if lint fails — typecheck output on top of lint errors is hard to read.

## Output format

Report results grouped by workspace:

```
web/
  lint    ✓ (or list errors)
  tsc     ✓ (or list errors)

mobile/
  lint    ✓ (or list errors)
  tsc     ✓ (or list errors)
```

If everything passes: `All checks passed. Safe to push.`

If anything fails: list the files and line numbers with errors, and suggest which agent to invoke (`/frontend` for component issues, `/backend` for API issues, `/security` for auth issues).
