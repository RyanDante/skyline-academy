import { Ionicons } from '@expo/vector-icons';
import * as Linking from 'expo-linking';
import { router, useLocalSearchParams } from 'expo-router';
import { useMemo } from 'react';
import { Alert, Pressable, View } from 'react-native';

import { TopicStatusRow } from '@/components/concours/TopicStatusRow';
import {
  Button,
  Card,
  EmptyState,
  ProgressBar,
  Screen,
  ScreenHeader,
  SectionHeader,
  SkeletonList,
  Text,
} from '@/components/ui';
import { computeReadiness, nextFocusTopic } from '@/domain/readiness';
import { useAttempts, useInstitution } from '@/hooks/queries';
import { useRequireAccount } from '@/hooks/useRequireAccount';
import { daysUntil, formatDate } from '@/lib/dates';
import { percent, pluralize } from '@/lib/format';
import { leadsService } from '@/services/leads';
import { useSessionStore } from '@/stores/sessionStore';
import { useThemeColors } from '@/theme/tokens';

const NO_ITEMS: string[] = [];

export default function InstitutionScreen() {
  const { institutionId } = useLocalSearchParams<{ institutionId: string }>();
  const institution = useInstitution(institutionId);
  const { data: attempts } = useAttempts();
  const colors = useThemeColors();
  const profile = useSessionStore((s) => s.profile);
  const targets = useSessionStore((s) => s.targets);
  const toggleTarget = useSessionStore((s) => s.toggleTarget);
  // A fallback must be a stable reference: a fresh `[]` makes Zustand re-render forever.
  const ticked = useSessionStore((s) => s.checklist[institutionId] ?? NO_ITEMS);
  const toggleItem = useSessionStore((s) => s.toggleChecklistItem);
  const requireAccount = useRequireAccount();

  const inst = institution.data;
  const readiness = useMemo(() => (inst ? computeReadiness(inst, attempts ?? []) : null), [inst, attempts]);
  const focus = readiness ? nextFocusTopic(readiness) : null;
  const focusSubjectId = inst?.sections.find((s) => s.topics.some((t) => t.topicId === focus?.topicId))?.subjectId;
  const tracked = targets.includes(institutionId);

  if (institution.isLoading) {
    return (
      <Screen topBar={<ScreenHeader title="Loading" />}>
        <SkeletonList />
      </Screen>
    );
  }
  if (!inst || !readiness) {
    return (
      <Screen topBar={<ScreenHeader title="Concours" />}>
        <EmptyState icon="school-outline" title="Not found" body="This institution may have been removed." />
      </Screen>
    );
  }

  const examDays = inst.examDate ? daysUntil(inst.examDate) : null;

  const onTrack = () => {
    if (!requireAccount('target')) return;
    const result = toggleTarget(inst.id);
    if (!result.ok && result.reason) Alert.alert('Target limit', result.reason);
  };

  const talk = () =>
    void leadsService.talkToSkyline(
      {
        institutionId: inst.id,
        institutionName: inst.shortName,
        readinessScore: readiness.score,
        weakTopics: readiness.topics.filter((t) => t.status === 'weak').map((t) => t.name),
        source: 'readiness',
      },
      profile?.firstName ?? 'a student',
    );

  return (
    <Screen
      topBar={<ScreenHeader title={inst.shortName} subtitle={inst.city} />}
      hero={
        <View className="gap-1 px-4 py-5" style={{ backgroundColor: colors.heroBg }}>
          <Text variant="caption" className="text-brand-soft">
            {inst.name}
          </Text>
          <Text variant="caption" className="text-brand-soft">
            {examDays !== null && examDays >= 0 ? `Exam in ${pluralize(examDays, 'day')}` : 'Exam date not confirmed'}
          </Text>
          <View className="mt-3 flex-row items-baseline gap-2">
            <Text variant="hero" className="text-white">
              {percent(readiness.score)}
            </Text>
            <Text variant="label" className="text-brand-soft">
              academic readiness
            </Text>
          </View>
          <ProgressBar value={readiness.score} track="onDark" accessibilityLabel="Academic readiness" />
          <Text variant="caption" className="mt-1 text-brand-soft">
            Based on {pluralize(readiness.questionsAnswered, 'question')} · weights from{' '}
            {pluralize(inst.papersAnalysed, 'paper')}. This shows preparation, not your chance of admission.
          </Text>
        </View>
      }
      footer={
        <View className="gap-2">
          {focus && focusSubjectId ? (
            <Button
              label={`Practise ${focus.name}`}
              onPress={() =>
                router.push({ pathname: '/quiz/setup', params: { subjectId: focusSubjectId, topicId: focus.topicId } })
              }
            />
          ) : null}
          <Button label={`Talk to Skyline about ${inst.shortName} prep`} variant="secondary" icon="logo-whatsapp" onPress={talk} />
        </View>
      }
    >
      <Button
        label={tracked ? 'Tracking in My Concours' : 'Add to My Concours'}
        variant={tracked ? 'ghost' : 'brand'}
        icon={tracked ? 'checkmark-circle' : 'add-circle-outline'}
        onPress={onTrack}
      />

      <SectionHeader title="Topics tested" />
      <View className="gap-2">
        {readiness.topics.map((t) => (
          <TopicStatusRow key={t.topicId} topic={t} />
        ))}
      </View>
      {readiness.nonAcademicSections.length > 0 ? (
        <Card tone="warning">
          <Text variant="body" className="text-accent-deep">
            {pluralize(readiness.nonAcademicSections.length, 'section')} not covered by GCE:{' '}
            {readiness.nonAcademicSections.join(', ').toLowerCase()}. Skyline prep covers these.
          </Text>
        </Card>
      ) : null}

      <SectionHeader title="Key dates" />
      <Card className="gap-2">
        <DateRow label="Application deadline" iso={inst.applicationDeadline} />
        <DateRow label="Exam" iso={inst.examDate} />
        <Text variant="caption" className={inst.lastVerified ? undefined : 'text-accent-deep'}>
          {inst.lastVerified
            ? `Checked against the official source on ${formatDate(inst.lastVerified)}`
            : 'Not yet verified for this season. Confirm with the institution.'}
        </Text>
        {inst.sourceUrl ? (
          <Pressable accessibilityRole="link" onPress={() => void Linking.openURL(inst.sourceUrl!)}>
            <Text variant="label" className="text-brand-deep">
              Official source
            </Text>
          </Pressable>
        ) : null}
      </Card>

      <SectionHeader title="Requirements" />
      {inst.requirements.map((r) => (
        <Text key={r} variant="body">
          • {r}
        </Text>
      ))}

      <SectionHeader title="Programmes" />
      <Text variant="body">{inst.programmes.join(' · ')}</Text>

      <SectionHeader title="Application checklist" />
      <View className="gap-1">
        {inst.checklist.map((item) => {
          const done = ticked.includes(item);
          return (
            <Pressable
              key={item}
              accessibilityRole="checkbox"
              accessibilityState={{ checked: done }}
              onPress={() => toggleItem(inst.id, item)}
              className="min-h-12 flex-row items-center gap-3 py-2"
            >
              <Ionicons
                name={done ? 'checkbox' : 'square-outline'}
                size={24}
                color={done ? colors.brandDeep : colors.muted}
              />
              <Text variant="body" className={done ? 'flex-1 text-muted line-through' : 'flex-1'}>
                {item}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </Screen>
  );
}

function DateRow({ label, iso }: { label: string; iso: string | null }) {
  const days = iso ? daysUntil(iso) : null;
  return (
    <View className="flex-row items-center justify-between">
      <Text variant="body">{label}</Text>
      <Text variant="bodyStrong" className={days !== null && days >= 0 && days <= 14 ? 'text-accent-deep' : undefined}>
        {iso ? formatDate(iso) : 'To be announced'}
      </Text>
    </View>
  );
}
