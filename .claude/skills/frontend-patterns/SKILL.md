---
name: frontend-patterns
description: This skill should be used when the user asks to create a page, component, hook, or anything in src/app/(frontend)/ or src/components/. Provides Server/Client Component decision rules, file organization, import order, and UI conventions for this monorepo.
version: 1.0.0
---

# Frontend Patterns

Apply these patterns whenever creating or modifying frontend code.

## Server vs Client Component decision

**Server Component (default — no directive needed):**
- Fetches data, renders static HTML
- No event handlers, no browser APIs, no hooks

**Client Component (`"use client"` at top of file):**
- Has event handlers (onClick, onChange, onSubmit)
- Uses useState, useEffect, useRef, or any other hook
- Uses browser APIs
- Uses SWR

Never add `"use client"` unless required. Push interactivity to leaf components.

## File organization

```
(user-protected)/feature/
├── page.tsx                 # Server Component
├── _components/
│   ├── index.ts             # export * from each component
│   └── FeatureCard.tsx
└── actions/
    └── fetchFeature.ts      # SWR fetcher / mutation
```

- Page-specific → `_components/` (never in `src/components/`)
- Shared across pages → `src/components/`
- Components must be < 200 lines — split if larger

## Import order (enforce strictly)

```typescript
// 1. hooks → helpers → types
import { useFeature } from '@/hooks/useFeature'
import { formatDate } from '@/utils/formatDate'
import type { Feature } from '@/types'

// 2. icons → CSS → general components → domain components
import { Calendar } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { FeatureCard } from './_components'
```

## UI conventions

| Need | Use |
|---|---|
| Component primitives | shadcn/ui from `@/components/ui/` |
| Icons | `lucide-react` only |
| Fonts | `next/font` only |
| User feedback | `toast.success()` / `toast.error()` from `react-hot-toast` |
| Data fetching | SWR in Client Components |
| Mutations | plain `fetch`, then `mutate()` to revalidate SWR |

## Data fetching pattern

```typescript
// In a Client Component
'use client'
import useSWR from 'swr'

const fetcher = (url: string) => fetch(url).then(r => r.json())
const { data, error, isLoading } = useSWR('/api/resource', fetcher)
```

## What never to do

- No Prisma in page/component files
- No axios — SWR or plain fetch only
- No inline styles when Tailwind classes exist
- No component > 200 lines without splitting
