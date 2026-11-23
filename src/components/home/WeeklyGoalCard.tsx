import { router } from 'expo-router';
import { View } from 'react-native';

import type { WeekSummary } from '@/domain/stats';
import { cn } from '@/lib/cn';
import { percent } from '@/lib/format';

import { Button } from '../ui/Button';
import { ProgressBar } from '../ui/ProgressBar';
import { Text } from '../ui/Text';

/**
 * Weekly study goal (from the web version's WeeklyGoalTracker): questions this week against
 * 7 × the daily goal from Settings, a bar per day, active days and accuracy.
 */
export function WeeklyGoalCard({ week, dailyGoal }: { week: WeekSummary; dailyGoal: number }) {
  const target = dailyGoal * 7;
  const met = week.total >= target;
  const peak = Math.max(dailyGoal, ...week.days.map((d) => d.answered));

  return (
    <View className="gap-3 rounded-card border border-line bg-surface p-4">
      <View className="flex-row items-center justify-between">
        <Text variant="h3">Weekly goal</Text>
        <Text variant="label" className={met ? 'text-success' : 'text-muted'}>
          {met ? '✓ Goal met' : `${Math.max(0, target - week.total)} to go`}
        </Text>
      </View>
      <View className="gap-1">
        <ProgressBar value={week.total / target} tone="brand" accessibilityLabel="Weekly goal progress" />
        <Text variant="caption">
          {week.total} of {target} questions this week
        </Text>
      </View>

      <View className="h-20 flex-row items-end justify-between" accessibilityElementsHidden>
        {week.days.map((d) => (
          <View key={d.label} className="flex-1 items-center gap-1">
            <View
              className={cn('w-4 rounded-full', d.answered >= dailyGoal ? 'bg-brand' : d.answered > 0 ? 'bg-brand/50' : 'bg-line')}
              style={{ height: Math.max(6, (d.answered / peak) * 56) }}
            />
            <Text variant="caption" className={d.isToday ? 'font-body-semibold text-ink' : undefined}>
              {d.label.slice(0, 1)}
            </Text>
          </View>
        ))}
      </View>

      <View className="flex-row gap-4">
        <Text variant="small">Active days: {week.activeDays}/7</Text>
        <Text variant="small">Accuracy: {week.accuracy === null ? '—' : percent(week.accuracy)}</Text>
      </View>
      {!met ? (
        <Button label={`Practise ${dailyGoal} questions`} variant="secondary" size="sm" onPress={() => router.push('/quiz/setup')} />
      ) : null}
    </View>
  );
}
