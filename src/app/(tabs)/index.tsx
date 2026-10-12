import { Ionicons } from '@expo/vector-icons';
import { type Href, router } from 'expo-router';
import type { ComponentProps } from 'react';
import { useMemo } from 'react';
import { Pressable, View } from 'react-native';

import { ReadinessCard } from '@/components/concours/ReadinessCard';
import { CountdownHero } from '@/components/home/CountdownHero';
import { Card, Screen, SectionHeader, Skeleton, Text } from '@/components/ui';
import { nextFocusTopic } from '@/domain/readiness';
import { getSeason } from '@/domain/season';
import { useHighlights, useInstitutions, usePapers, useTopics } from '@/hooks/queries';
import { useReadiness, useTopicMastery } from '@/hooks/useReadiness';
import { config } from '@/lib/config';
import { useSessionStore } from '@/stores/sessionStore';
import { useThemeColors } from '@/theme/tokens';

export default function Home() {
  const profile = useSessionStore((s) => s.profile);
  const lastPaper = useSessionStore((s) => s.lastPaper);
  const targets = useSessionStore((s) => s.targets);

  const season = useMemo(() => getSeason(config.gceExamStart), []);
  const primarySubjectId = profile?.subjectIds[0];

  const highlights = useHighlights();
  const institutions = useInstitutions();
  const papers = usePapers(primarySubjectId);
  const topics = useTopics(primarySubjectId);
  const mastery = useTopicMastery();

  const targetInstitutions = useMemo(
    () => (institutions.data ?? []).filter((i) => targets.includes(i.id)),
    [institutions.data, targets],
  );
  const readiness = useReadiness(targetInstitutions);
  const firstTarget = targetInstitutions[0];
  const firstReadiness = firstTarget ? readiness.get(firstTarget.id) : undefined;

  // Weak topic: from the first Concours target if any, else the weakest topic in the main subject.
  const focus = useMemo(() => {
    if (firstReadiness && firstTarget) {
      const topic = nextFocusTopic(firstReadiness);
      const section = firstTarget.sections.find((s) => s.topics.some((t) => t.topicId === topic?.topicId));
      if (topic) {
        return {
          name: topic.name,
          reason: `${topic.status === 'untested' ? 'Not practised yet' : 'Needs work'} · counts for ${firstTarget.shortName}`,
          subjectId: section?.subjectId ?? primarySubjectId,
          topicId: topic.topicId,
        };
      }
    }
    const list = topics.data ?? [];
    const scored = list.map((t) => ({ t, m: mastery.get(t.id) }));
    const weakest =
      scored.filter((x) => x.m?.mastery != null).sort((a, b) => a.m!.mastery! - b.m!.mastery!)[0] ??
      scored.find((x) => !x.m);
    if (!weakest) return null;
    return {
      name: weakest.t.name,
      reason: weakest.m?.mastery != null ? 'Your lowest score recently' : 'Not practised yet',
      subjectId: weakest.t.subjectId,
      topicId: weakest.t.id,
    };
  }, [firstReadiness, firstTarget, topics.data, mastery, primarySubjectId]);

  const suggestedPaper = papers.data?.find((p) => p.questionCount > 0);

  return (
    <Screen
      hero={
        <CountdownHero
          firstName={profile?.firstName || undefined}
          subtitle={profile ? `${profile.form} · ${profile.level} Level` : 'GCE'}
          season={season}
          // Demo only: hidden in release builds, including EAS tester builds.
          sampleData={__DEV__ && config.useMocks}
        />
      }
      onRefresh={() => void highlights.refetch()}
    >
      {lastPaper ? (
        <Card
          onPress={() => router.push({ pathname: '/paper/[paperId]', params: { paperId: lastPaper.paperId } })}
          accessibilityLabel={`Continue ${lastPaper.title}`}
        >
          <Text variant="overline">Continue</Text>
          <Text variant="bodyStrong" className="mt-1">
            {lastPaper.title}
          </Text>
          <Text variant="caption">
            Question {lastPaper.position} of {lastPaper.total}
          </Text>
        </Card>
      ) : suggestedPaper ? (
        <Card
          onPress={() => router.push({ pathname: '/paper/[paperId]', params: { paperId: suggestedPaper.id } })}
        >
          <Text variant="overline">Start here</Text>
          <Text variant="bodyStrong" className="mt-1">
            {suggestedPaper.year} Paper {suggestedPaper.paperNumber}
          </Text>
          <Text variant="caption">
            {suggestedPaper.questionCount} questions with worked solutions
          </Text>
        </Card>
      ) : null}

      {topics.isLoading ? (
        <Skeleton className="h-24 w-full rounded-card" />
      ) : focus ? (
        <Card
          tone="highlight"
          onPress={() =>
            router.push({
              pathname: '/quiz/setup',
              params: { subjectId: focus.subjectId ?? '', topicId: focus.topicId },
            })
          }
          accessibilityLabel={`Weak topic of the day: ${focus.name}`}
        >
          <Text variant="overline" className="text-accent-deep">
            Weak topic of the day
          </Text>
          <Text variant="bodyStrong" className="mt-1">
            {focus.name}
          </Text>
          <Text variant="caption">{focus.reason}</Text>
        </Card>
      ) : null}

      <QuickActions />

      {firstTarget && firstReadiness ? (
        <>
          <SectionHeader title="My Concours" actionLabel="See all" onAction={() => router.push('/(tabs)/concours')} />
          <ReadinessCard
            institution={firstTarget}
            readiness={firstReadiness}
            onPress={() =>
              router.push({ pathname: '/concours/[institutionId]', params: { institutionId: firstTarget.id } })
            }
          />
        </>
      ) : profile?.level === 'A' ? (
        <Card tone="soft" onPress={() => router.push('/(tabs)/concours')}>
          <Text variant="bodyStrong">What can you do after your GCE?</Text>
          <Text variant="body" className="mt-1 text-muted">
            Pick up to 3 Concours and see how ready you are for each.
          </Text>
        </Card>
      ) : null}

      {(highlights.data ?? []).length > 0 ? (
        <>
          <SectionHeader title="From Skyline" />
          {highlights.data!.map((h) => (
            <Card
              key={h.id}
              tone="alt"
              onPress={h.ctaRoute ? () => router.push(h.ctaRoute as Href) : undefined}
            >
              <Text variant="bodyStrong">{h.title}</Text>
              <Text variant="body" className="mt-1 text-muted">
                {h.body}
              </Text>
              {h.ctaLabel ? (
                <Text variant="label" className="mt-2 text-brand-deep">
                  {h.ctaLabel}
                </Text>
              ) : null}
            </Card>
          ))}
        </>
      ) : null}
    </Screen>
  );
}

type IconName = ComponentProps<typeof Ionicons>['name'];

const ACTIONS: { label: string; icon: IconName; href: Href }[] = [
  { label: 'Past papers', icon: 'document-text-outline', href: '/(tabs)/gce' },
  { label: 'Quick quiz', icon: 'flash-outline', href: '/quiz/setup' },
  { label: 'Ask GCE Tutor', icon: 'chatbubbles-outline', href: '/tutor/gce/setup' },
  { label: 'Calendar', icon: 'calendar-outline', href: '/concours/calendar' },
];

function QuickActions() {
  const colors = useThemeColors();
  return (
    <View className="flex-row gap-2">
      {ACTIONS.map((a) => (
        <Pressable
          key={a.label}
          accessibilityRole="button"
          accessibilityLabel={a.label}
          onPress={() => router.push(a.href)}
          // Brief: 76 dp minimum height, 8 dp padding, 12 sp labels that may wrap to two lines.
          className="min-h-[76px] flex-1 items-center justify-center gap-1.5 rounded-card border border-line bg-surface p-2 active:bg-surface-alt"
        >
          <Ionicons name={a.icon} size={24} color={colors.brandDeep} />
          <Text variant="caption" className="text-center text-ink" numberOfLines={2}>
            {a.label}
          </Text>
        </Pressable>
      ))}
    </View>
  );
}
