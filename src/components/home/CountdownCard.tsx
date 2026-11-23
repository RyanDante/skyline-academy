import { Ionicons } from '@expo/vector-icons';
import { View } from 'react-native';

import type { SeasonState } from '@/domain/season';
import { useThemeColors } from '@/theme/tokens';

import { Text } from '../ui/Text';

/** "230 · Number of days to the GCE" card (mockup 6), season-aware. */
export function CountdownCard({ season }: { season: SeasonState }) {
  const colors = useThemeColors();
  const counting = season.phase === 'foundation' || season.phase === 'build' || season.phase === 'final';
  return (
    <View
      className="flex-row items-center gap-4 rounded-card bg-brand-soft p-4"
      accessible
      accessibilityLabel={counting ? `${season.daysToExam} days to the GCE. ${season.focus}` : season.headline}
    >
      <Ionicons name="calendar" size={40} color={colors.brandDeep} />
      <View className="h-12 w-px bg-brand/40" />
      {counting ? (
        <View className="flex-1 flex-row items-center gap-3">
          <Text variant="hero" className="text-ink" maxFontSizeMultiplier={1.1}>{season.daysToExam}</Text>
          <View className="flex-1">
            <Text variant="bodyStrong">Number of days to the GCE</Text>
            <Text variant="small">{season.focus}</Text>
          </View>
        </View>
      ) : (
        <View className="flex-1">
          <Text variant="h3">{season.headline}</Text>
          <Text variant="small">{season.focus}</Text>
        </View>
      )}
      <Ionicons name="school" size={34} color={colors.brand} />
    </View>
  );
}
