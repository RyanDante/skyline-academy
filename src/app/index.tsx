import { Redirect } from 'expo-router';

import { useSessionStore } from '@/stores/sessionStore';

export default function Index() {
  const onboardingComplete = useSessionStore((s) => s.onboardingComplete);
  return <Redirect href={onboardingComplete ? '/(tabs)' : '/(onboarding)/welcome'} />;
}
