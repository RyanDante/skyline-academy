import { router } from 'expo-router';
import { useCallback } from 'react';

import { useSessionStore } from '@/stores/sessionStore';

export type AccountReason = 'save' | 'quiz' | 'tutor' | 'target' | 'group' | 'pay';

/**
 * Returns true when the student is signed in; otherwise opens Sign in. Students normally create
 * an account during onboarding; this covers anyone who signed out.
 */
export function useRequireAccount() {
  const uid = useSessionStore((s) => s.uid);

  return useCallback(
    (_reason: AccountReason): boolean => {
      if (uid) return true;
      router.push('/(auth)/sign-in');
      return false;
    },
    [uid],
  );
}
