import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';

import { Button, Screen, ScreenHeader, Text, TextField } from '@/components/ui';
import type { AccountReason } from '@/hooks/useRequireAccount';
import { config } from '@/lib/config';
import { authService, normaliseCameroonPhone } from '@/services/auth';

const REASONS: Record<AccountReason | 'login', string> = {
  login: 'Welcome back. Sign in to restore your progress.',
  save: 'Create a free account to save papers and keep your progress.',
  quiz: 'Create a free account so your quiz results count toward your progress.',
  tutor: 'Create a free account to ask the Tutor.',
  target: 'Create a free account to track Concours and get deadline alerts.',
  group: 'Create a free account to join your class group.',
  pay: 'Create a free account so your Season Pass is linked to you.',
};

export default function Phone() {
  const { reason = 'save' } = useLocalSearchParams<{ reason?: AccountReason | 'login' }>();
  const [phone, setPhone] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    const e164 = normaliseCameroonPhone(phone);
    if (!e164) {
      setError('Enter a Cameroon mobile number, like 6 70 12 34 56.');
      return;
    }
    setError(null);
    setLoading(true);
    try {
      await authService.sendCode(e164);
      router.push({ pathname: '/(auth)/verify', params: { reason } });
    } catch {
      setError("We couldn't send the code. Check the number and your connection, then try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen
      topBar={<ScreenHeader title="Your phone number" modal />}
      footer={<Button label="Send code" onPress={submit} loading={loading} />}
    >
      <Text variant="title">Sign in with your phone</Text>
      <Text variant="body" className="text-muted">
        {REASONS[reason] ?? REASONS.save}
      </Text>
      <View className="mt-2">
        <TextField
          label="Mobile number"
          prefix="+237"
          value={phone}
          onChangeText={(v) => {
            setPhone(v);
            setError(null);
          }}
          keyboardType="phone-pad"
          autoComplete="tel"
          textContentType="telephoneNumber"
          placeholder="6 70 12 34 56"
          error={error}
          hint="We'll text you a 6-digit code. Standard SMS rates may apply."
          onSubmitEditing={submit}
        />
      </View>
      {config.useMocks ? (
        <Text variant="caption" className="text-accent-deep">
          Demo mode: any Cameroon number works and the code is 123456.
        </Text>
      ) : null}
    </Screen>
  );
}
