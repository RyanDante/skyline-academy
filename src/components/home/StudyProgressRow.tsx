import { Ionicons } from '@expo/vector-icons';
import { View } from 'react-native';

import { pluralize } from '@/lib/format';
import { useThemeColors } from '@/theme/tokens';

import { ProgressRing } from '../ui/ProgressRing';
import { Text } from '../ui/Text';

/** "Your Study Progress" row (mockup 6): streak, questions answered, overall progress. */
export function StudyProgressRow({
  streak,
  questions,
  overall,
}: {
  streak: number;
  questions: number;
  overall: number | null;
}) {
  const colors = useThemeColors();
  return (
    <View className="flex-row gap-2.5">
      <View className="flex-1 gap-1 rounded-card border border-line bg-surface p-3" accessible accessibilityLabel={`Streak ${pluralize(streak, 'day')}`}>
        <Text variant="caption">Streak</Text>
        <View className="flex-row items-center gap-1.5">
          <Ionicons name="flame" size={22} color={colors.accent} />
          <Text variant="h3" numberOfLines={1}>{pluralize(streak, 'day')}</Text>
        </View>
      </View>
      <View className="flex-1 gap-1 rounded-card border border-line bg-surface p-3" accessible accessibilityLabel={`${questions} questions answered`}>
        <Text variant="caption">Questions</Text>
        <View className="flex-row items-center gap-1.5">
          <Ionicons name="help-circle" size={22} color={colors.brandDeep} />
          <Text variant="h3">{questions}</Text>
        </View>
      </View>
      <View className="flex-1 flex-row items-center gap-2 rounded-card border border-line bg-surface p-2.5" accessible accessibilityLabel={overall === null ? 'Overall progress not started' : `Overall progress ${Math.round(overall * 100)} percent`}>
        <ProgressRing value={overall} size={50} />
        <Text variant="caption" className="flex-1">Overall progress</Text>
      </View>
    </View>
  );
}
