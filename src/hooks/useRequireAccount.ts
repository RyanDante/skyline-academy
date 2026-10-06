import { router } from 'expo-router';
import { useCallback } from 'react';

import { useSessionStore } from '@/stores/sessionStore';

export type AccountReason = 'save' | 'quiz' | 'tutor' | 'target' | 'group' | 'pay';

/**
 * Browsing is open to everyone; an account is asked for only at the first action that needs one.
 * Returns true when the student is already signed in; otherwise opens the sign-in flow.
 */
export function useRequireAccount() {
  const uid = useSessionStore((s) => s.uid);

  return useCallback(
    (reason: AccountReason): boolean => {
      if (uid) return true;
      router.push({ pathname: '/(auth)/phone', params: { reason } });
      return false;
    },
    [uid],
  );
}
