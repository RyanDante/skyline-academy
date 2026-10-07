import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';

import { Button, Screen, ScreenHeader, Text, TextField } from '@/components/ui';
import { authService } from '@/services/auth';
import { profileService } from '@/services/profile';
import { useSessionStore } from '@/stores/sessionStore';

export default function Verify() {
  const { reason } = useLocalSearchParams<{ reason?: string }>();
  const signIn = useSessionStore((s) => s.signIn);
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);

  const phone = authService.pendingPhone();

  const verify = async () => {
    if (!/^\d{6}$/.test(code)) {
      setError('Enter the 6-digit code from the SMS.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const user = await authService.confirmCode(code);
      signIn(user.uid, user.phone);

      const profile = useSessionStore.getState().profile;
      if (profile) await profileService.save(user.uid, { ...profile, uid: user.uid }).catch(() => undefined);

      if (reason === 'login' && !useSessionStore.getState().onboardingComplete) {
        router.replace('/(onboarding)/setup');
      } else {
        router.dismiss(2);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'That code did not work. Try again.');
    } finally {
      setLoading(false);
    }
  };

  const resend = async () => {
    if (!phone) return router.back();
    setResending(true);
    try {
      await authService.sendCode(phone);
    } finally {
      setResending(false);
    }
  };

  return (
    <Screen
      topBar={<ScreenHeader title="Verify your number" />}
      footer={<Button label="Verify" variant="go" onPress={verify} loading={loading} />}
    >
      <Text variant="title">Enter the code</Text>
      <Text variant="body" className="text-muted">
        We sent a 6-digit code to {phone ?? 'your phone'}.
      </Text>
      <TextField
        label="Verification code"
        value={code}
        onChangeText={(v) => {
          setCode(v.replace(/\D/g, '').slice(0, 6));
          setError(null);
        }}
        keyboardType="number-pad"
        textContentType="oneTimeCode"
        autoComplete="sms-otp"
        maxLength={6}
        placeholder="123456"
        error={error}
        onSubmitEditing={verify}
        className="mt-2"
      />
      <Button label="Didn't get it? Resend code" variant="ghost" onPress={resend} loading={resending} />
    </Screen>
  );
}
