import { router } from 'expo-router';
import { useMemo } from 'react';
import { View } from 'react-native';

import { Badge, Card, EmptyState, Screen, ScreenHeader, SkeletonList, Text } from '@/components/ui';
import { useInstitutions } from '@/hooks/queries';
import { daysUntil, formatDate } from '@/lib/dates';
import { pluralize } from '@/lib/format';
import { useSessionStore } from '@/stores/sessionStore';

interface CalendarEvent {
  key: string;
  date: string;
  kind: 'deadline' | 'exam';
  institutionId: string;
  label: string;
  verified: boolean;
}

/** Upcoming deadlines and exams for the student's targets (or every Concours when none are set). */
export default function ConcoursCalendar() {
  const targets = useSessionStore((s) => s.targets);
  const institutions = useInstitutions();

  const { events, clashes, scope } = useMemo(() => {
    const all = institutions.data ?? [];
    const chosen = targets.length > 0 ? all.filter((i) => targets.includes(i.id)) : all;
    const list: CalendarEvent[] = [];
    for (const inst of chosen) {
      if (inst.applicationDeadline) {
        list.push({ key: `${inst.id}-d`, date: inst.applicationDeadline, kind: 'deadline', institutionId: inst.id, label: `${inst.shortName} application deadline`, verified: !!inst.lastVerified });
      }
      if (inst.examDate) {
        list.push({ key: `${inst.id}-e`, date: inst.examDate, kind: 'exam', institutionId: inst.id, label: `${inst.shortName} exam`, verified: !!inst.lastVerified });
      }
    }
    const upcoming = list.filter((e) => daysUntil(e.date) >= 0).sort((a, b) => a.date.localeCompare(b.date));

    const examsByDate = new Map<string, string[]>();
    for (const e of upcoming.filter((x) => x.kind === 'exam')) {
      examsByDate.set(e.date, [...(examsByDate.get(e.date) ?? []), e.label.replace(' exam', '')]);
    }
    const clashList = [...examsByDate.entries()].filter(([, names]) => names.length > 1);
    return { events: upcoming, clashes: clashList, scope: targets.length > 0 ? 'your targets' : 'all Concours' };
  }, [institutions.data, targets]);

  return (
    <Screen topBar={<ScreenHeader title="Concours calendar" subtitle={`Showing ${scope}`} />}>
      {clashes.map(([date, names]) => (
        <Card key={date} tone="warning">
          <Text variant="bodyStrong" className="text-accent-deep">
            Exam clash on {formatDate(date)}
          </Text>
          <Text variant="body" className="mt-1 text-accent-deep">
            {names.join(' and ')} are on the same day. You’ll need to choose one.
          </Text>
        </Card>
      ))}

      {institutions.isLoading ? (
        <SkeletonList />
      ) : events.length === 0 ? (
        <EmptyState
          icon="calendar-outline"
          title="No dates yet"
          body="Skyline adds dates as soon as institutions publish them."
        />
      ) : (
        events.map((e) => {
          const days = daysUntil(e.date);
          return (
            <Card
              key={e.key}
              onPress={() => router.push({ pathname: '/concours/[institutionId]', params: { institutionId: e.institutionId } })}
              className="flex-row items-center gap-3"
            >
              <View className="w-14 items-center rounded-control bg-surface-alt py-2">
                <Text variant="heading">{formatDate(e.date).split(' ')[0]}</Text>
                <Text variant="caption">{formatDate(e.date).split(' ')[1]}</Text>
              </View>
              <View className="flex-1 gap-1">
                <Text variant="bodyStrong">{e.label}</Text>
                <Text variant="caption">{days === 0 ? 'Today' : `In ${pluralize(days, 'day')}`}</Text>
                {!e.verified ? <Badge label="Not yet verified" tone="accent" /> : null}
              </View>
              {e.kind === 'deadline' && days <= 14 ? <Badge label="Soon" tone="danger" /> : null}
            </Card>
          );
        })
      )}
    </Screen>
  );
}
