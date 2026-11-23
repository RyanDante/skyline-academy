import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, View } from 'react-native';

import { Logo } from '@/components/brand/Logo';
import { Button, IconInput, Screen, Text } from '@/components/ui';
import { AuthError, authService, normaliseCameroonPhone } from '@/services/auth';
import { profileService } from '@/services/profile';
import { useSessionStore } from '@/stores/sessionStore';
import { useThemeColors } from '@/theme/tokens';

/** Create account (design mockup 3): nickname, name, phone, password, terms. */
export default function SignUp() {
  const colors = useThemeColors();
  const signIn = useSessionStore((s) => s.signIn);
  const saveProfile = useSessionStore((s) => s.saveProfile);
  const profile = useSessionStore((s) => s.profile);
  const notify = useSessionStore((s) => s.notify);

  const [nickname, setNickname] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [agreed, setAgreed] = useState(false);
  const [errors, setErrors] = useState<Record<string, string | null>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    const e164 = normaliseCameroonPhone(phone);
    const next = {
      nickname: nickname.trim() ? null : 'Enter a nickname.',
      fullName: fullName.trim() ? null : 'Enter your name.',
      phone: e164 ? null : 'Enter a Cameroon mobile number, like 6 70 12 34 56.',
      password: password.length >= authService.minPassword ? null : `At least ${authService.minPassword} characters.`,
    };
    setErrors(next);
    if (Object.values(next).some(Boolean) || !e164) return;
    if (!agreed) {
      setFormError('Please agree to the Terms of Service and Privacy Policy.');
      return;
    }
    setFormError(null);
    setLoading(true);
    try {
      const user = await authService.signUp({ phone: e164, password, displayName: nickname.trim() });
      signIn(user.uid, user.phone);
      const draft = {
        ...(profile ?? { level: 'A' as const, form: 'Upper Sixth', stream: 'science' as const, subjectIds: [], examYear: new Date().getFullYear() + 1, pathway: 'undecided' as const }),
        uid: user.uid,
        firstName: nickname.trim(),
        fullName: fullName.trim(),
      };
      saveProfile(draft);
      await profileService.save(user.uid, draft).catch(() => undefined);
      notify({
        kind: 'info',
        title: `Welcome to Skyline Academy, ${nickname.trim()} 👋`,
        body: 'Personalise your exams, then start with a past paper or ask the GCE Tutor.',
      });
      router.replace('/(onboarding)/setup');
    } catch (e) {
      setFormError(e instanceof AuthError ? e.message : 'Something went wrong. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen contentClassName="gap-5 px-6 pt-6">
      <Logo />
      <View className="gap-1">
        <Text variant="title" accessibilityRole="header">
          Create Your Account
        </Text>
        <Text variant="lead" className="text-muted">
          Get started in seconds
        </Text>
      </View>

      <View className="gap-3">
        <IconInput icon="person-outline" label="Nickname" value={nickname} onChangeText={setNickname}
          autoCapitalize="words" autoComplete="nickname" error={errors.nickname} />
        <IconInput icon="person-outline" label="Name" value={fullName} onChangeText={setFullName}
          autoCapitalize="words" autoComplete="name" error={errors.fullName} />
        <IconInput icon="call-outline" label="Phone number" value={phone} onChangeText={setPhone}
          keyboardType="phone-pad" autoComplete="tel" textContentType="telephoneNumber" error={errors.phone} />
        <IconInput icon="lock-closed-outline" label="Password" value={password} onChangeText={setPassword}
          secret autoComplete="new-password" textContentType="newPassword" error={errors.password}
          onSubmitEditing={submit} />
      </View>

      <Pressable
        accessibilityRole="checkbox"
        accessibilityState={{ checked: agreed }}
        onPress={() => setAgreed((a) => !a)}
        className="min-h-12 flex-row items-center gap-3"
      >
        <Ionicons name={agreed ? 'checkbox' : 'square-outline'} size={26} color={agreed ? colors.brand : colors.muted} />
        <Text variant="body" className="flex-1 text-muted">
          I agree to the <Text variant="body" className="text-brand-deep">Terms of Service</Text> and{' '}
          <Text variant="body" className="text-brand-deep">Privacy Policy</Text>
        </Text>
      </Pressable>

      {formError ? (
        <Text variant="body" className="text-danger" accessibilityLiveRegion="polite">
          {formError}
        </Text>
      ) : null}

      <Button label="Create Account" size="lg" loading={loading} onPress={submit} />

      <View className="flex-row items-center gap-3">
        <View className="h-px flex-1 bg-line" />
        <Text variant="small">or</Text>
        <View className="h-px flex-1 bg-line" />
      </View>
      <View className="flex-row items-center justify-center gap-1">
        <Text variant="body" className="text-muted">Already have an account?</Text>
        <Button label="Sign in" variant="ghost" size="sm" onPress={() => router.replace('/(auth)/sign-in')} />
      </View>
    </Screen>
  );
}
