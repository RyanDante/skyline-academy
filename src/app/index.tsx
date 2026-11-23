import { Redirect } from 'expo-router';

import { useSessionStore } from '@/stores/sessionStore';

/** Onboarding order: welcome slides → create account → personalise → tabs. */
export default function Index() {
  const onboardingComplete = useSessionStore((s) => s.onboardingComplete);
  const uid = useSessionStore((s) => s.uid);
  if (onboardingComplete) return <Redirect href="/(tabs)" />;
  return <Redirect href={uid ? '/(onboarding)/setup' : '/(onboarding)/welcome'} />;
}
