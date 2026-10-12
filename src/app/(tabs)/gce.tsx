import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { View } from 'react-native';

import { subjectIcon } from '@/components/study/subjectIcons';
import {
  Badge,
  Button,
  Card,
  Chip,
  ErrorState,
  ProgressBar,
  Screen,
  SkeletonList,
  Text,
} from '@/components/ui';
import { accuracy } from '@/domain/mastery';
import { useAttempts, useSubjects } from '@/hooks/queries';
import { cn } from '@/lib/cn';
import { formatYearRange, pluralize } from '@/lib/format';
import { useSessionStore } from '@/stores/sessionStore';
import { useThemeColors } from '@/theme/tokens';
import type { Level } from '@/types/models';

export default function Gce() {
  const profile = useSessionStore((s) => s.profile);
  const [level, setLevel] = useState<Level>(profile?.level ?? 'A');
  const subjects = useSubjects(level);
  const { data: attempts } = useAttempts();
  const colors = useThemeColors();

  const accuracyBySubject = useMemo(() => {
    const map = new Map<string, number | null>();
    for (const s of subjects.data ?? []) {
      map.set(s.id, accuracy((attempts ?? []).filter((a) => a.subjectId === s.id)));
    }
    return map;
  }, [subjects.data, attempts]);

  // The student's own subjects first.
  const sorted = useMemo(() => {
    const mine = new Set(profile?.subjectIds ?? []);
    return [...(subjects.data ?? [])].sort(
      (a, b) => Number(mine.has(b.id)) - Number(mine.has(a.id)),
    );
  }, [subjects.data, profile?.subjectIds]);

  return (
    <Screen onRefresh={() => void subjects.refetch()}>
      <Text variant="title" accessibilityRole="header">
        GCE revision
      </Text>
      <View className="flex-row gap-2">
        {(['O', 'A'] as Level[]).map((l) => (
          <Chip key={l} label={`${l} Level`} selected={level === l} onPress={() => setLevel(l)} />
        ))}
      </View>

      <View className="gap-2">
        <Button
          label="Practise by topic"
          icon="flash-outline"
          onPress={() => router.push('/quiz/setup')}
        />
        <Button
          label="Study with GCE Tutor"
          icon="chatbubbles-outline"
          variant="secondary"
          onPress={() => router.push({ pathname: '/tutor/gce/setup', params: { level } })}
        />
      </View>

      {subjects.isLoading ? (
        <SkeletonList />
      ) : subjects.isError ? (
        <ErrorState onRetry={() => void subjects.refetch()} />
      ) : (
        <View className="gap-3">
          {sorted.map((subject) => {
            const acc = accuracyBySubject.get(subject.id) ?? null;
            const comingSoon = subject.paperCount === 0;
            return (
              <Card
                key={subject.id}
                onPress={
                  comingSoon
                    ? undefined
                    : () =>
                        router.push({
                          pathname: '/gce/[subjectId]',
                          params: { subjectId: subject.id },
                        })
                }
                accessibilityLabel={`${subject.name}, ${
                  comingSoon ? 'coming soon' : pluralize(subject.paperCount, 'paper')
                }`}
              >
                <View className={cn('flex-row items-center gap-3', comingSoon && 'opacity-50')}>
                  <View className="h-12 w-12 items-center justify-center rounded-control bg-brand-soft">
                    <Ionicons name={subjectIcon(subject.name)} size={24} color={colors.brandDeep} />
                  </View>
                  <View className="flex-1">
                    <Text variant="h3">
                      {subject.code ? `${subject.code} ` : ''}
                      {subject.name}
                    </Text>
                    <Text variant="small">
                      {comingSoon
                        ? 'Coming soon'
                        : `${pluralize(subject.paperCount, 'paper')}${
                            subject.yearRange ? ` · ${formatYearRange(subject.yearRange)}` : ''
                          }`}
                    </Text>
                  </View>
                  {profile?.subjectIds.includes(subject.id) ? (
                    <Badge label="Your subject" />
                  ) : null}
                </View>
                {acc !== null ? (
                  <View className="mt-3 gap-1">
                    <ProgressBar
                      value={acc}
                      tone="brand"
                      accessibilityLabel={`${subject.name} accuracy`}
                    />
                    <Text variant="caption">{Math.round(acc * 100)}% correct so far</Text>
                  </View>
                ) : null}
              </Card>
            );
          })}
        </View>
      )}
    </Screen>
  );
}
