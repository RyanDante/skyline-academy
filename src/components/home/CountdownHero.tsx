import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Pressable, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import type { SeasonState } from '@/domain/season';
import { formatLongToday, greetingFor } from '@/lib/dates';
import { useThemeColors } from '@/theme/tokens';

import { Logo } from '../brand/Logo';
import { SkylineSilhouette } from '../brand/SkylineSilhouette';
import { Badge } from '../ui/Badge';
import { Text } from '../ui/Text';

interface CountdownHeroProps {
  /** Omitted when unknown: the greeting then reads just "Good afternoon". */
  firstName?: string;
  subtitle: string;
  season: SeasonState;
  sampleData?: boolean;
}

/** Home's teal "horizon" header: greeting, exam countdown and the skyline motif. */
export function CountdownHero({ firstName, subtitle, season, sampleData }: CountdownHeroProps) {
  const insets = useSafeAreaInsets();
  const colors = useThemeColors();
  const showNumber = season.phase === 'foundation' || season.phase === 'build' || season.phase === 'final';

  return (
    <View style={{ backgroundColor: colors.heroBg, paddingTop: insets.top + 8 }}>
      <View className="gap-1 px-4">
        <View className="flex-row items-center justify-between">
          <Logo onDark />
          <View className="flex-row items-center gap-2">
            {sampleData ? <Badge label="Sample data" tone="accent" /> : null}
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Your profile and progress"
              hitSlop={10}
              onPress={() => router.push('/(tabs)/me')}
            >
              <Ionicons name="person-circle-outline" size={28} color="#FFFFFF" />
            </Pressable>
          </View>
        </View>

        <Text variant="heading" className="mt-4 text-white">
          {firstName ? `${greetingFor()}, ${firstName}` : greetingFor()}
        </Text>
        <Text variant="caption" className="text-brand-soft">
          {formatLongToday()} · {subtitle}
        </Text>

        <View className="mt-4" accessibilityRole="summary">
          {showNumber ? (
            // Nested Text keeps the figure and its label on one baseline.
            <Text variant="hero" className="text-white" maxFontSizeMultiplier={1.1}>
              {season.daysToExam}
              <Text variant="h3" className="font-body-medium text-brand-soft">
                {'  '}days to the GCE
              </Text>
            </Text>
          ) : (
            <Text variant="title" className="text-white">
              {season.headline}
            </Text>
          )}
        </View>
        <Text variant="body" className="mt-1 text-white/90">
          {season.focus}
        </Text>
      </View>
      <View className="mt-3">
        <SkylineSilhouette height={36} />
      </View>
    </View>
  );
}
