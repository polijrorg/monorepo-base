import { createAuthClient } from 'better-auth/react';
import { expoClient } from '@better-auth/expo/client';
import * as SecureStore from 'expo-secure-store';

export const authClient = createAuthClient({
  baseURL: process.env.EXPO_PUBLIC_BACKEND_URL, // url base do backend
  plugins: [
    expoClient({
      scheme: process.env.EXPO_PUBLIC_SCHEMA,
      storagePrefix: process.env.EXPO_PUBLIC_SCHEMA,
      storage: SecureStore,
    }),
  ],
});
