import '../global.css';

import { Stack } from 'expo-router';
import { AuthProvider } from '~/contexts/AuthContext';

export default function Layout() {
  return (
    <AuthProvider>
      <Stack screenOptions={{ headerShown: false }} />
    </AuthProvider>
  );
}
