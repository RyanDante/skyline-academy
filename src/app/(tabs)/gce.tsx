import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, View } from 'react-native';

import { Logo } from '@/components/brand/Logo';
import { SubjectTile } from '@/components/study/SubjectTile';
import { Button, Chip, ErrorState, Screen, SectionHeader, SkeletonList, Text } from '@/components/ui';
import { useSubjects } from '@/hooks/queries';
import { useSessionStore } from '@/stores/sessionStore';
import { palette, useThemeColors } from '@/theme/tokens';
import type { Level } from '@/types/models';

const FIRST_ROW = 6;

/** GCE tab (design mockup 7). */
export default function Gce() {
  const profile = useSessionStore((s) => s.profile);
  const colors = useThemeColors();
  const [level, setLevel] = useState<Level>(profile?.level ?? 'A');
  const [showAll, setShowAll] = useState(false);
  const subjects = useSubjects(level);

  // The student's own subjects first, then subjects with papers, then coming soon.
  const sorted = useMemo(() => {
    const mine = new Set(profile?.subjectIds ?? []);
    return [...(subjects.data ?? [])].sort(
      (a, b) =>
        Number(mine.has(b.id)) - Number(mine.has(a.id)) ||
        Number(b.paperCount > 0) - Number(a.paperCount > 0),
    );
  }, [subjects.data, profile?.subjectIds]);
  const visible = showAll ? sorted : sorted.slice(0, FIRST_ROW);
  const firstWithPapers = sorted.find((s) => s.paperCount > 0);

  return (
    <Screen onRefresh={() => void subjects.refetch()}>
      <Logo size="sm" />

      <LinearGradient
        colors={[palette.teal, '#3CCFC6']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ borderRadius: 20, overflow: 'hidden' }}
      >
        <View className="flex-row items-center p-5">
          <View className="flex-1 gap-1">
            <Text variant="title" className="text-white" accessibilityRole="header">GCE Past Questions</Text>
            <Text variant="body" className="text-white/90">Practice • Improve • Excel</Text>
            <Pressable
              accessibilityRole="button"
              onPress={() => router.push('/quiz/setup')}
              className="mt-3 min-h-12 flex-row items-center gap-1 self-start rounded-full bg-white px-5 active:opacity-80"
            >
              <Text variant="button" className="text-brand-deep">Explore Questions</Text>
              <Ionicons name="chevron-forward" size={18} color={palette.tealDeep} />
            </Pressable>
          </View>
          <View className="h-20 w-20 items-center justify-center rounded-card bg-white/20" accessibilityElementsHidden>
            <Text variant="heading" className="text-white">GCE</Text>
          </View>
        </View>
      </LinearGradient>

      <View className="flex-row items-center justify-between">
        <SectionHeader title="Subjects" />
        <View className="flex-row gap-2">
          {(['O', 'A'] as Level[]).map((l) => (
            <Chip key={l} label={`${l} Level`} selected={level === l} onPress={() => setLevel(l)} />
          ))}
        </View>
      </View>

      {subjects.isLoading ? (
        <SkeletonList rows={2} />
      ) : subjects.isError ? (
        <ErrorState onRetry={() => void subjects.refetch()} />
      ) : (
        <View className="flex-row flex-wrap justify-between gap-y-3">
          {visible.map((s) => (
            <SubjectTile
              key={s.id}
              subject={s}
              onPress={() => router.push({ pathname: '/gce/[subjectId]', params: { subjectId: s.id } })}
            />
          ))}
          {visible.length % 3 === 2 ? <View className="w-[31%]" /> : null}
        </View>
      )}

      {sorted.length > FIRST_ROW ? (
        <Button
          label={showAll ? 'Show fewer subjects' : 'View all Subjects'}
          variant="secondary"
          iconRight={showAll ? 'chevron-up' : 'chevron-forward'}
          onPress={() => setShowAll((v) => !v)}
        />
      ) : null}

      <View className="gap-3 rounded-card bg-brand-soft p-4">
        <View className="flex-row items-center gap-2">
          <View className="h-9 w-9 items-center justify-center rounded-control bg-brand">
            <Ionicons name="flash" size={20} color={palette.white} />
          </View>
          <Text variant="h3">Quick Access</Text>
        </View>
        <View className="flex-row gap-3">
          <QuickLink
            icon="document-text"
            label="Past Questions"
            onPress={() =>
              firstWithPapers
                ? router.push({ pathname: '/gce/[subjectId]', params: { subjectId: firstWithPapers.id } })
                : router.push('/quiz/setup')
            }
            color={colors.brandDeep}
          />
          <QuickLink
            icon="school"
            label="AI Tutor"
            onPress={() => router.push({ pathname: '/tutor/gce/setup', params: { level } })}
            color={colors.brandDeep}
          />
        </View>
      </View>
    </Screen>
  );
}

function QuickLink({
  icon,
  label,
  onPress,
  color,
}: {
  icon: 'document-text' | 'school';
  label: string;
  onPress: () => void;
  color: string;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      className="min-h-14 flex-1 flex-row items-center gap-2 rounded-control bg-surface px-3 active:opacity-80"
    >
      <Ionicons name={icon} size={22} color={color} />
      <Text variant="label" className="flex-1">{label}</Text>
      <Ionicons name="chevron-forward" size={16} color={color} />
    </Pressable>
  );
}
