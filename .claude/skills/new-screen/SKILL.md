---
name: new-screen
description: Scaffold a new Expo / React Native screen with NativeWind styling, Expo Router file-based routing, and auth context wiring.
argument-hint: <screen-name> [--protected | --public]
allowed-tools: [Read, Write, Bash, Glob, Grep]
---

# New Mobile Screen

Scaffold a new screen in the `mobile/` Expo app following the monorepo's conventions.

## Arguments

- `$ARGUMENTS` — parse screen name and auth flag:
  - Screen name (required): e.g. `home`, `profile`, `lesson-detail`
  - `--protected` (default) → requires auth, redirect to login if no session
  - `--public` → no auth check

## Before scaffolding

1. Read `mobile/app/_layout.tsx` to understand the current navigation structure
2. Read `mobile/contexts/AuthContext.tsx` to understand how auth is consumed
3. Decide where the screen fits: tab navigator, stack, or modal

## File structure to create

```
mobile/app/
└── {screen-name}.tsx     # Expo Router file-based screen
```

Optionally, if the screen is complex:
```
mobile/app/
└── {screen-name}/
    ├── index.tsx          # main screen
    └── _components/
        └── {Screen}Header.tsx
```

### Screen template — protected

```typescript
import { View, Text, StyleSheet } from 'react-native'
import { Redirect } from 'expo-router'
import { useAuth } from '~/contexts/AuthContext'

export default function {Screen}Screen() {
  const { user, isLoading } = useAuth()

  if (isLoading) return null
  if (!user) return <Redirect href="/(auth)/login" />

  return (
    <View className="flex-1 items-center justify-center bg-white">
      <Text className="text-2xl font-bold">{Screen Name}</Text>
    </View>
  )
}
```

### Screen template — public

```typescript
import { View, Text } from 'react-native'

export default function {Screen}Screen() {
  return (
    <View className="flex-1 items-center justify-center bg-white">
      <Text className="text-2xl font-bold">{Screen Name}</Text>
    </View>
  )
}
```

## Conventions

- **NativeWind** — use `className` for all styles; no StyleSheet unless absolutely necessary
- **Path alias** — `~/` maps to the project root (e.g. `~/contexts/AuthContext`)
- **Auth** — always use `useAuth()` from `~/contexts/AuthContext`, never call the auth client directly
- **Navigation** — use `useRouter()` from `expo-router` for programmatic navigation
- **API calls** — use the backend URL from `process.env.EXPO_PUBLIC_BACKEND_URL`

## After scaffolding

Print the created file(s) and remind the developer to:
1. Register the screen in the appropriate navigator in `_layout.tsx` if needed
2. Test on both iOS and Android simulators (`pnpm --filter mobile ios` / `pnpm android`)
