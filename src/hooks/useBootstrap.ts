import NetInfo from '@react-native-community/netinfo';
import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
} from '@expo-google-fonts/inter';
import {
  PlusJakartaSans_600SemiBold,
  PlusJakartaSans_700Bold,
} from '@expo-google-fonts/plus-jakarta-sans';
import { useFonts } from 'expo-font';
import { useEffect, useState } from 'react';

import { migrateDb } from '@/db/client';
import { attemptsService } from '@/services/attempts';
import { authService } from '@/services/auth';
import { profileService } from '@/services/profile';
import { useSessionStore } from '@/stores/sessionStore';

/**
 * Startup work before the first screen renders: fonts, SQLite migrations, persisted session.
 * Afterwards it keeps auth state, entitlements and offline attempt sync in step.
 */
export function useBootstrap(): { ready: boolean; error: Error | null } {
  const [fontsLoaded, fontError] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    PlusJakartaSans_600SemiBold,
    PlusJakartaSans_700Bold,
  });
  const [dbReady, setDbReady] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const hydrated = useSessionStore((s) => s.hydrated);

  useEffect(() => {
    migrateDb()
      .then(() => setDbReady(true))
      .catch((e: unknown) => setError(e instanceof Error ? e : new Error(String(e))));
  }, []);

  useEffect(() => {
    if (!dbReady) return;

    const unsubscribeAuth = authService.listen(async (user) => {
      const store = useSessionStore.getState();
      if (!user) {
        if (store.uid) store.signOut();
        return;
      }
      store.signIn(user.uid, user.phone);
      const entitlement = await profileService.entitlement(user.uid).catch(() => null);
      if (entitlement) store.setEntitlement(entitlement);
      void attemptsService.sync();
    });

    // Push queued attempts whenever the connection comes back.
    const unsubscribeNet = NetInfo.addEventListener((state) => {
      if (state.isConnected && state.isInternetReachable !== false) void attemptsService.sync();
    });

    return () => {
      unsubscribeAuth();
      unsubscribeNet();
    };
  }, [dbReady]);

  return {
    ready: (fontsLoaded || !!fontError) && dbReady && hydrated,
    error,
  };
}
