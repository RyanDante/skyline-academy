import * as Linking from 'expo-linking';
import { router } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';

import { Logo } from '@/components/brand/Logo';
import { Button, IconInput, Screen, Text } from '@/components/ui';
import { AuthError, authService, normaliseCameroonPhone } from '@/services/auth';
import { leadsService } from '@/services/leads';
import { profileService } from '@/services/profile';
import { useSessionStore } from '@/stores/sessionStore';

/** Welcome back (design mockup 4): phone number + password. */
export default function SignIn() {
  const signIn = useSessionStore((s) => s.signIn);
  const saveProfile = useSessionStore((s) => s.saveProfile);
  const completeOnboarding = useSessionStore((s) => s.completeOnboarding);
  const setEntitlement = useSessionStore((s) => s.setEntitlement);

  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    const e164 = normaliseCameroonPhone(phone);
    if (!e164) {
      setError('Enter a Cameroon mobile number, like 6 70 12 34 56.');
      return;
    }
    if (!password) {
      setError('Enter your password.');
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const user = await authService.signIn({ phone: e164, password });
      signIn(user.uid, user.phone);

      // Restore the profile and pass saved on another phone (live mode).
      const saved = await profileService.load(user.uid).catch(() => null);
      if (saved) {
        saveProfile(saved);
        completeOnboarding();
      }
      const entitlement = await profileService.entitlement(user.uid).catch(() => null);
      if (entitlement) setEntitlement(entitlement);

      const done = useSessionStore.getState().onboardingComplete;
      if (!done) router.replace('/(onboarding)/setup');
      else if (router.canGoBack()) router.back();
      else router.replace('/(tabs)');
    } catch (e) {
      setError(e instanceof AuthError ? e.message : 'Something went wrong. Try again.');
    } finally {
      setLoading(false);
    }
  };

  // No email on these accounts, so resets go through a Skyline admin on WhatsApp.
  const forgot = () =>
    void Linking.openURL(
      leadsService.whatsappUrl(
        `Hello Skyline, I forgot my Skyline Academy app password. My phone number is ${phone || '…'}.`,
      ),
    );

  return (
    <Screen contentClassName="gap-5 px-6 pt-6">
      <Logo />
      <View className="gap-1">
        <Text variant="title" accessibilityRole="header">
          Welcome Back
        </Text>
        <Text variant="lead" className="text-muted">
          Sign in to continue your learning journey.
        </Text>
      </View>

      <View className="gap-3">
        <IconInput icon="call-outline" label="Phone number" value={phone} onChangeText={setPhone}
          keyboardType="phone-pad" autoComplete="tel" textContentType="telephoneNumber" />
        <IconInput icon="lock-closed-outline" label="Password" value={password} onChangeText={setPassword}
          secret autoComplete="current-password" textContentType="password" onSubmitEditing={submit} />
        <Button label="Forgot password?" variant="ghost" size="sm" className="self-end px-0" onPress={forgot} />
      </View>

      {error ? (
        <Text variant="body" className="text-danger" accessibilityLiveRegion="polite">
          {error}
        </Text>
      ) : null}

      <Button label="Sign In" size="lg" loading={loading} onPress={submit} />

      <View className="flex-row items-center justify-center gap-1">
        <Text variant="body" className="text-muted">Don’t have an account?</Text>
        <Button label="Create Account" variant="ghost" size="sm" onPress={() => router.replace('/(auth)/sign-up')} />
      </View>
    </Screen>
  );
}
