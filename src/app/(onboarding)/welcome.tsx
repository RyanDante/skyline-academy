import { router } from 'expo-router';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Logo } from '@/components/brand/Logo';
import { SkylineSilhouette } from '@/components/brand/SkylineSilhouette';
import { Button, Text } from '@/components/ui';
import { useThemeColors } from '@/theme/tokens';

const POINTS = [
  'Past GCE papers with solutions from Skyline teachers',
  'See which Concours you can sit and how ready you are',
  'Help from the Tutor when you are stuck',
];

export default function Welcome() {
  const insets = useSafeAreaInsets();
  const colors = useThemeColors();

  return (
    <View className="flex-1" style={{ backgroundColor: colors.heroBg }}>
      <View className="flex-1 px-6" style={{ paddingTop: insets.top + 24 }}>
        <Logo onDark />
        <Text variant="hero" className="mt-10 text-white">
          Your exams.{'\n'}Your future.{'\n'}Your pathway.
        </Text>
        <View className="mt-8 gap-3">
          {POINTS.map((point) => (
            <View key={point} className="flex-row gap-3">
              <View className="mt-2 h-2 w-2 rounded-full bg-accent" />
              <Text variant="lead" className="flex-1 text-white/90">
                {point}
              </Text>
            </View>
          ))}
        </View>
      </View>

      <SkylineSilhouette height={56} />
      <View className="gap-3 bg-bg px-6 pt-5" style={{ paddingBottom: insets.bottom + 16 }}>
        <Button label="Get started" variant="go" size="lg" onPress={() => router.push('/(onboarding)/setup')} />
        <Button
          label="I already have an account"
          variant="ghost"
          onPress={() => router.push({ pathname: '/(auth)/phone', params: { reason: 'login' } })}
        />
      </View>
    </View>
  );
}
