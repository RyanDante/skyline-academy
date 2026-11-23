import { router } from 'expo-router';
import { Pressable, View } from 'react-native';

import type { KeyDate } from '@/data/calendar';
import { daysUntil, formatDate } from '@/lib/dates';
import { pluralize } from '@/lib/format';

import { Badge } from '../ui/Badge';
import { Text } from '../ui/Text';

/** Upcoming GCE and Concours dates (from the web version's exam calendar). */
export function KeyDatesCard({ dates }: { dates: KeyDate[] }) {
  const upcoming = dates
    .filter((d) => daysUntil(d.date) >= 0)
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, 4);
  if (upcoming.length === 0) return null;

  return (
    <View className="gap-2 rounded-card border border-line bg-surface p-4">
      <View className="flex-row items-center justify-between">
        <Text variant="h3">Key dates</Text>
        <Pressable accessibilityRole="link" hitSlop={10} onPress={() => router.push('/concours/calendar')}>
          <Text variant="label" className="text-brand-deep">Calendar</Text>
        </Pressable>
      </View>
      {upcoming.map((d) => {
        const days = daysUntil(d.date);
        return (
          <View key={d.id} className="min-h-12 flex-row items-center gap-3">
            <View className="w-12 items-center rounded-control bg-surface-alt py-1">
              <Text variant="h3">{formatDate(d.date).split(' ')[0]}</Text>
              <Text variant="caption">{formatDate(d.date).split(' ')[1]}</Text>
            </View>
            <View className="flex-1">
              <Text variant="body">{d.title}</Text>
              <Text variant="caption">{days === 0 ? 'Today' : `In ${pluralize(days, 'day')}`}</Text>
            </View>
            <Badge label={d.kind === 'gce' ? 'GCE' : 'Concours'} tone={d.kind === 'gce' ? 'brand' : 'accent'} />
          </View>
        );
      })}
      <Text variant="caption">Dates to confirm with the official timetable.</Text>
    </View>
  );
}
