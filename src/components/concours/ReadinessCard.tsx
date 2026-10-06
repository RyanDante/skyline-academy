import { View } from 'react-native';

import { daysUntil } from '@/lib/dates';
import { percent, pluralize } from '@/lib/format';
import { useThemeColors } from '@/theme/tokens';
import type { Institution, Readiness } from '@/types/models';

import { Card } from '../ui/Card';
import { ProgressBar } from '../ui/ProgressBar';
import { Text } from '../ui/Text';

interface ReadinessCardProps {
  institution: Institution;
  readiness: Readiness;
  onPress?: () => void;
}

/** Compact card for the Concours tab. The full breakdown lives on the institution screen. */
export function ReadinessCard({ institution, readiness, onPress }: ReadinessCardProps) {
  const colors = useThemeColors();
  const days = institution.examDate ? daysUntil(institution.examDate) : null;
  const weak = readiness.topics.filter((t) => t.status === 'weak').slice(0, 2);

  return (
    <Card onPress={onPress} className="gap-3 p-0" accessibilityLabel={`${institution.shortName} readiness ${percent(readiness.score)}`}>
      <View className="gap-1 rounded-t-card p-4" style={{ backgroundColor: colors.heroBg }}>
        <Text variant="bodyStrong" className="text-white">
          {institution.shortName}
        </Text>
        <Text variant="caption" className="text-brand-soft">
          {days !== null && days >= 0 ? `Exam in ${pluralize(days, 'day')}` : 'Exam date not confirmed'}
        </Text>
        <View className="mt-2 flex-row items-baseline gap-2">
          <Text variant="title" className="text-white">
            {percent(readiness.score)}
          </Text>
          <Text variant="caption" className="text-brand-soft">
            academic readiness
          </Text>
        </View>
        <ProgressBar value={readiness.score} track="onDark" accessibilityLabel="Academic readiness" />
      </View>
      <View className="gap-1 px-4 pb-4">
        <Text variant="caption">
          Based on {pluralize(readiness.questionsAnswered, 'question')} · weights from{' '}
          {pluralize(institution.papersAnalysed, 'paper')}
        </Text>
        {weak.length > 0 ? (
          <Text variant="label" className="text-accent-deep">
            Work on: {weak.map((t) => t.name).join(', ')}
          </Text>
        ) : null}
      </View>
    </Card>
  );
}
