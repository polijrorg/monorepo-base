---
name: new-page
description: Scaffold a new Next.js App Router page with the correct folder structure, _components barrel, and actions folder.
argument-hint: <page-name> [--protected | --public | --auth | --admin]
allowed-tools: [Read, Write, Bash, Glob, Grep]
---

# New Page

Scaffold a Next.js 16 App Router page following the monorepo's frontend conventions.

## Arguments

- `$ARGUMENTS` — parse page name and route group flag:
  - Page name (required): e.g. `dashboard`, `user-settings`, `lesson-detail`
  - `--protected` (default) → `src/app/(frontend)/(user-protected)/{page}/`
  - `--public` → `src/app/(frontend)/(landing-pages)/{page}/`
  - `--auth` → `src/app/(frontend)/(auth)/{page}/`
  - `--admin` → `src/app/(frontend)/admin/{page}/`

## File structure to create

```
{route-group}/{page}/
├── page.tsx              # Server Component — fetches data, renders layout
├── _components/
│   ├── index.ts          # barrel: export * from './PageHeader'
│   └── {Page}Header.tsx  # first component placeholder
└── actions/
    └── fetch{Page}.ts    # SWR fetcher or server action stub
```

### `page.tsx` — Server Component

```typescript
import { {Page}Header } from './_components'

export default async function {Page}Page() {
  // TODO: fetch data from service or via server action

  return (
    <main>
      <{Page}Header />
    </main>
  )
}

export const metadata = {
  title: '{Page Name}',
}
```

### `_components/{Page}Header.tsx` — Client Component example

```typescript
'use client'

export function {Page}Header() {
  return (
    <header>
      <h1>{Page Name}</h1>
    </header>
  )
}
```

### `_components/index.ts`

```typescript
export * from './{Page}Header'
```

### `actions/fetch{Page}.ts`

```typescript
// SWR fetcher — use in Client Components
export async function fetch{Page}() {
  const res = await fetch('/api/{resource}')
  if (!res.ok) throw new Error('Failed to fetch')
  return res.json()
}
```

## After scaffolding

1. Print the new files created
2. Remind the developer:
   - Keep each component under 200 lines
   - Use `toast.success()` / `toast.error()` (react-hot-toast) for user feedback
   - Use SWR in Client Components for data that needs real-time updates
   - Put reusable components in `src/components/`, page-specific ones in `_components/`
