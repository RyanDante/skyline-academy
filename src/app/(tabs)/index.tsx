import { Ionicons } from '@expo/vector-icons';
import { type Href, router } from 'expo-router';
import { useMemo, type ComponentProps } from 'react';
import { Pressable, View } from 'react-native';

import { ReadinessCard } from '@/components/concours/ReadinessCard';
import { ContinueCard } from '@/components/home/ContinueCard';
import { CountdownCard } from '@/components/home/CountdownCard';
import { DailyChallengeCard } from '@/components/home/DailyChallengeCard';
import { HomeHeader } from '@/components/home/HomeHeader';
import { KeyDatesCard } from '@/components/home/KeyDatesCard';
import { StudyProgressRow } from '@/components/home/StudyProgressRow';
import { WeeklyGoalCard } from '@/components/home/WeeklyGoalCard';
import { Card, Screen, SectionHeader, Text } from '@/components/ui';
import { GCE_KEY_DATES, type KeyDate } from '@/data/calendar';
import { nextFocusTopic } from '@/domain/readiness';
import { getSeason } from '@/domain/season';
import { currentStreak, overallAccuracy, weekSummary } from '@/domain/stats';
import {
  useAttempts,
  useHighlights,
  useInstitutions,
  usePapers,
  useSubject,
  useTopics,
} from '@/hooks/queries';
import { useReadiness, useTopicMastery } from '@/hooks/useReadiness';
import { config } from '@/lib/config';
import { useGceTutorStore } from '@/stores/gceTutorStore';
import { useSessionStore } from '@/stores/sessionStore';

type IconName = ComponentProps<typeof Ionicons>['name'];

/** Home (design mockup 6) plus the web version's weekly goal and key dates. */
export default function Home() {
  const profile = useSessionStore((s) => s.profile);
  const lastPaper = useSessionStore((s) => s.lastPaper);
  const targets = useSessionStore((s) => s.targets);
  const dailyGoal = useSessionStore((s) => s.settings.dailyGoal);
  const tutorSession = useGceTutorStore((s) => s.session);

  const season = useMemo(() => getSeason(config.gceExamStart), []);
  const primarySubjectId = profile?.subjectIds[0];

  const { data: attempts = [] } = useAttempts();
  const highlights = useHighlights();
  const institutions = useInstitutions();
  const papers = usePapers(primarySubjectId);
  const topics = useTopics(primarySubjectId);
  const primarySubject = useSubject(primarySubjectId);
  const mastery = useTopicMastery();

  const stats = useMemo(
    () => ({
      streak: currentStreak(attempts),
      overall: overallAccuracy(attempts),
      week: weekSummary(attempts),
    }),
    [attempts],
  );

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

  // Continue card: an open GCE Tutor session, else the last paper, else a suggested first paper.
  const suggestedPaper = papers.data?.find((p) => p.questionCount > 0);
  const levelLabel = profile ? `${profile.level} Level` : 'GCE';
  const cont = tutorSession && !tutorSession.finishedAt
    ? {
        line1: `${levelLabel} • GCE Tutor`,
        line2: tutorSession.title,
        onPress: () => router.push('/tutor/gce/session'),
      }
    : lastPaper
      ? {
          line1: `${levelLabel} • ${lastPaper.title}`,
          line2: `Question ${lastPaper.position} of ${lastPaper.total}`,
          onPress: () => router.push({ pathname: '/paper/[paperId]', params: { paperId: lastPaper.paperId } }),
        }
      : suggestedPaper
        ? {
            line1: `${levelLabel} • ${primarySubject.data?.name ?? 'Your subject'}`,
            line2: `${suggestedPaper.year} Paper ${suggestedPaper.paperNumber}`,
            onPress: () => router.push({ pathname: '/paper/[paperId]', params: { paperId: suggestedPaper.id } }),
          }
        : null;

  const keyDates: KeyDate[] = [
    ...GCE_KEY_DATES,
    ...targetInstitutions.flatMap((i) => {
      const dates: KeyDate[] = [];
      if (i.applicationDeadline)
        dates.push({ id: `${i.id}-d`, title: `${i.shortName} application deadline`, date: i.applicationDeadline, kind: 'concours' });
      if (i.examDate) dates.push({ id: `${i.id}-e`, title: `${i.shortName} exam`, date: i.examDate, kind: 'concours' });
      return dates;
    }),
  ];

  return (
    <Screen
      hero={<HomeHeader sampleData={__DEV__ && config.useMocks} />}
      onRefresh={() => void highlights.refetch()}
      contentClassName="pt-2"
    >
      {cont ? (
        <ContinueCard
          title={lastPaper || tutorSession ? 'Continue your preparation' : 'Start your preparation'}
          line1={cont.line1}
          line2={cont.line2}
          actionLabel={lastPaper || tutorSession ? 'Resume' : 'Start'}
          onPress={cont.onPress}
        />
      ) : null}

      <QuickTiles />

      <CountdownCard season={season} />

      <DailyChallengeCard subjectId={primarySubjectId} />

      <SectionHeader title="Your Study Progress" />
      <StudyProgressRow streak={stats.streak} questions={attempts.length} overall={stats.overall} />

      <WeeklyGoalCard week={stats.week} dailyGoal={dailyGoal} />

      {focus ? (
        <Card
          tone="highlight"
          onPress={() =>
            router.push({ pathname: '/quiz/setup', params: { subjectId: focus.subjectId ?? '', topicId: focus.topicId } })
          }
          accessibilityLabel={`Weak topic of the day: ${focus.name}`}
        >
          <Text variant="overline" className="text-accent-deep">Weak topic of the day</Text>
          <Text variant="h3" className="mt-1">{focus.name}</Text>
          <Text variant="small">{focus.reason}</Text>
        </Card>
      ) : null}

      <KeyDatesCard dates={keyDates} />

      {firstTarget && firstReadiness ? (
        <>
          <SectionHeader title="My Concours" actionLabel="See all" onAction={() => router.push('/(tabs)/concours')} />
          <ReadinessCard
            institution={firstTarget}
            readiness={firstReadiness}
            onPress={() => router.push({ pathname: '/concours/[institutionId]', params: { institutionId: firstTarget.id } })}
          />
        </>
      ) : null}

      {(highlights.data ?? []).length > 0 ? (
        <>
          <SectionHeader title="From Skyline" />
          {highlights.data!.map((h) => (
            <Card key={h.id} tone="alt" onPress={h.ctaRoute ? () => router.push(h.ctaRoute as Href) : undefined}>
              <Text variant="h3">{h.title}</Text>
              <Text variant="body" className="mt-1 text-muted">{h.body}</Text>
              {h.ctaLabel ? <Text variant="label" className="mt-2 text-brand-deep">{h.ctaLabel}</Text> : null}
            </Card>
          ))}
        </>
      ) : null}
    </Screen>
  );
}

const TILES: { label: string; icon: IconName; href: Href; bg: string; iconBg: string; iconColor: string }[] = [
  { label: 'GCE Papers', icon: 'document-text', href: '/(tabs)/gce', bg: '#EEF3FF', iconBg: '#5B8DEF', iconColor: '#FFFFFF' },
  { label: 'AI Tutor', icon: 'chatbubble-ellipses', href: '/(tabs)/tutor', bg: '#FFF8E6', iconBg: '#FFC53D', iconColor: '#7A4B00' },
  { label: 'Concours', icon: 'stopwatch', href: '/(tabs)/concours', bg: '#E6F8F5', iconBg: '#6FD8C8', iconColor: '#06635F' },
];

/** Three shortcut tiles (mockup 6). Colours are fixed so they read the same in dark mode. */
function QuickTiles() {
  return (
    <View className="flex-row gap-3">
      {TILES.map((t) => (
        <Pressable
          key={t.label}
          accessibilityRole="button"
          accessibilityLabel={t.label}
          onPress={() => router.push(t.href)}
          className="min-h-[104px] flex-1 items-center justify-center gap-2 rounded-card p-2 active:opacity-80"
          style={{ backgroundColor: t.bg }}
        >
          <View className="h-14 w-14 items-center justify-center rounded-control" style={{ backgroundColor: t.iconBg }}>
            <Ionicons name={t.icon} size={28} color={t.iconColor} />
          </View>
          <Text variant="label" className="text-center text-[#173A43]" numberOfLines={2}>
            {t.label}
          </Text>
        </Pressable>
      ))}
    </View>
  );
}
