import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, View } from 'react-native';

import { subjectIcon } from '@/components/study/subjectIcons';
import { AiHeader } from '@/components/tutor/AiHeader';
import {
  Button,
  Card,
  Chip,
  ProgressBar,
  Screen,
  SkeletonList,
  Text,
  TextField,
} from '@/components/ui';
import { countByTopic, pickTutorQuestions } from '@/domain/quiz';
import { usePapers, useSubjectQuestions, useSubjects, useTopics } from '@/hooks/queries';
import { cn } from '@/lib/cn';
import { pluralize } from '@/lib/format';
import { useGceTutorStore, type TutorScope, type TutorSource } from '@/stores/gceTutorStore';
import { useThemeColors } from '@/theme/tokens';
import type { Level } from '@/types/models';

type Step = 'level' | 'subject' | 'scope' | 'topics' | 'ready';
const STEPS: Step[] = ['level', 'subject', 'scope', 'topics', 'ready'];
const COUNTS = [5, 10, 20] as const;

/**
 * GCE Tutor setup (design brief 6.2): level → subject → scope → topics → ready.
 * `level`, `subjectId` and `topicIds` params pre-fill and skip steps.
 */
export default function GceTutorSetup() {
  const params = useLocalSearchParams<{ level?: Level; subjectId?: string; topicIds?: string }>();
  const colors = useThemeColors();
  const rememberLevel = useGceTutorStore((s) => s.rememberLevel);
  const startSession = useGceTutorStore((s) => s.startSession);

  const [level, setLevel] = useState<Level | undefined>(params.level);
  const [subjectId, setSubjectId] = useState<string | undefined>(params.subjectId);
  const presetTopics = params.topicIds ? params.topicIds.split(',').filter(Boolean) : [];
  const [scope, setScope] = useState<TutorScope | undefined>(presetTopics.length ? 'topics' : undefined);
  const [topicIds, setTopicIds] = useState<string[]>(presetTopics);
  const [source, setSource] = useState<TutorSource>('mix');
  const [paperId, setPaperId] = useState<string | undefined>();
  const [count, setCount] = useState<(typeof COUNTS)[number]>(10);
  const [search, setSearch] = useState('');

  const initialStep: Step = presetTopics.length
    ? 'ready'
    : params.subjectId
      ? 'scope'
      : params.level
        ? 'subject'
        : 'level';
  const [step, setStep] = useState<Step>(initialStep);

  const subjects = useSubjects(level ?? 'A');
  const topics = useTopics(subjectId);
  const pool = useSubjectQuestions(subjectId);
  const papers = usePapers(subjectId);

  const subject = subjects.data?.find((s) => s.id === subjectId);
  const topicCounts = useMemo(() => countByTopic(pool.data ?? []), [pool.data]);
  const papersWithQuestions = (papers.data ?? []).filter((p) => p.questionCount > 0);
  const visibleTopics = (topics.data ?? []).filter((t) =>
    t.name.toLowerCase().includes(search.trim().toLowerCase()),
  );

  const available = useMemo(
    () =>
      subjectId
        ? pickTutorQuestions(pool.data ?? [], {
            subjectId,
            topicIds: scope === 'topics' ? topicIds : [],
            paperId: source === 'paper' ? paperId : undefined,
            count: 1000,
          }).length
        : 0,
    [pool.data, subjectId, scope, topicIds, source, paperId],
  );

  const topicNames = (topics.data ?? []).filter((t) => topicIds.includes(t.id)).map((t) => t.name);

  const back = () => {
    const i = STEPS.indexOf(step);
    if (i <= 0) return router.back();
    const prev = STEPS[i - 1]!;
    setStep(prev === 'topics' && scope === 'whole' ? 'scope' : prev);
  };

  const start = (mode: 'quiz' | 'explain' = 'quiz') => {
    if (!subjectId || !level) return;
    rememberLevel(level);
    const questions =
      mode === 'explain'
        ? []
        : pickTutorQuestions(pool.data ?? [], {
            subjectId,
            topicIds: scope === 'topics' ? topicIds : [],
            paperId: source === 'paper' ? paperId : undefined,
            count,
          });
    startSession({
      subjectId,
      title: `${subject?.name ?? 'GCE'} · ${scope === 'topics' ? topicNames.join(', ') : 'Whole subject'}`,
      questions,
      mode,
      topicNames: scope === 'topics' ? topicNames : [subject?.name ?? 'this subject'],
    });
    router.replace('/tutor/gce/session');
  };

  const stepIndex = STEPS.indexOf(step);

  return (
    <Screen
      topBar={<AiHeader persona="tutor" onBack={back} showCounter />}
      footer={
        step === 'topics' ? (
          <Button
            label="Continue"
            disabled={topicIds.length === 0}
            onPress={() => setStep('ready')}
          />
        ) : step === 'ready' ? (
          <Button
            label="Start session"
            variant="go"
            icon="play"
            disabled={available === 0 || (source === 'paper' && !paperId)}
            onPress={() => start('quiz')}
          />
        ) : undefined
      }
    >
      <ProgressBar value={(stepIndex + 1) / STEPS.length} tone="brand" />

      {step === 'level' ? (
        <View className="gap-4">
          <Text variant="heading">Which level are you studying?</Text>
          {(['O', 'A'] as Level[]).map((l) => (
            <Card
              key={l}
              onPress={() => {
                setLevel(l);
                setSubjectId(undefined);
                setStep('subject');
              }}
              className={cn('min-h-20 justify-center', level === l && 'border-2 border-brand-deep')}
            >
              <Text variant="heading">{l} Level</Text>
              <Text variant="small">{l === 'O' ? 'Form 4 and Form 5' : 'Lower and Upper Sixth'}</Text>
            </Card>
          ))}
        </View>
      ) : null}

      {step === 'subject' ? (
        <View className="gap-4">
          <Text variant="heading">Pick a subject.</Text>
          {subjects.isLoading ? (
            <SkeletonList rows={4} />
          ) : (
            <View className="flex-row flex-wrap gap-3">
              {(subjects.data ?? []).map((s) => {
                const comingSoon = s.paperCount === 0;
                return (
                  <Pressable
                    key={s.id}
                    accessibilityRole="button"
                    accessibilityState={{ disabled: comingSoon }}
                    accessibilityLabel={comingSoon ? `${s.name}, coming soon` : s.name}
                    disabled={comingSoon}
                    onPress={() => {
                      setSubjectId(s.id);
                      setTopicIds([]);
                      setPaperId(undefined);
                      setStep('scope');
                    }}
                    className={cn(
                      'min-h-28 w-[47%] items-center justify-center gap-2 rounded-card border border-line bg-surface p-3 active:bg-surface-alt',
                      comingSoon && 'opacity-40',
                    )}
                  >
                    <View className="h-12 w-12 items-center justify-center rounded-control bg-brand-soft">
                      <Ionicons name={subjectIcon(s.name)} size={24} color={colors.brandDeep} />
                    </View>
                    <Text variant="h3" className="text-center">
                      {s.name}
                    </Text>
                    {comingSoon ? <Text variant="caption">Coming soon</Text> : null}
                  </Pressable>
                );
              })}
            </View>
          )}
        </View>
      ) : null}

      {step === 'scope' ? (
        <View className="gap-4">
          <Text variant="heading">What would you like to study?</Text>
          <Card
            onPress={() => {
              setScope('topics');
              setStep('topics');
            }}
            className="min-h-20 justify-center"
          >
            <Text variant="h3">Choose topics</Text>
            <Text variant="small">Focus on the topics you pick.</Text>
          </Card>
          <Card
            onPress={() => {
              setScope('whole');
              setTopicIds([]);
              setStep('ready');
            }}
            className="min-h-20 justify-center"
          >
            <Text variant="h3">Whole subject</Text>
            <Text variant="small">A general review across every topic.</Text>
          </Card>
        </View>
      ) : null}

      {step === 'topics' ? (
        <View className="gap-3">
          <Text variant="heading">Select the topics</Text>
          <TextField
            label="Search topics"
            value={search}
            onChangeText={setSearch}
            placeholder="Mechanics"
          />
          <Button
            label="Select all"
            variant="ghost"
            size="sm"
            className="self-start px-0"
            onPress={() =>
              setTopicIds((topics.data ?? []).filter((t) => (topicCounts.get(t.id) ?? 0) > 0).map((t) => t.id))
            }
          />
          {visibleTopics.map((t) => {
            const n = topicCounts.get(t.id) ?? 0;
            const checked = topicIds.includes(t.id);
            return (
              <Pressable
                key={t.id}
                accessibilityRole="checkbox"
                accessibilityState={{ checked, disabled: n === 0 }}
                disabled={n === 0}
                onPress={() =>
                  setTopicIds((ids) => (checked ? ids.filter((x) => x !== t.id) : [...ids, t.id]))
                }
                className={cn(
                  'min-h-14 flex-row items-center gap-3 rounded-control border border-line bg-surface px-3 py-2',
                  n === 0 && 'opacity-40',
                )}
              >
                <Ionicons
                  name={checked ? 'checkbox' : 'square-outline'}
                  size={24}
                  color={checked ? colors.brandDeep : colors.muted}
                />
                <Text variant="body" className="flex-1">
                  {t.name}
                </Text>
                <Text variant="caption">{pluralize(n, 'question')}</Text>
              </Pressable>
            );
          })}
        </View>
      ) : null}

      {step === 'ready' ? (
        <View className="gap-4">
          <Text variant="heading">Ready?</Text>
          <Card className="gap-0 p-0">
            <SummaryRow first label="Level" value={`${level} Level`} onEdit={() => setStep('level')} />
            <SummaryRow label="Subject" value={subject?.name ?? '—'} onEdit={() => setStep('subject')} />
            <SummaryRow
              label="Topics"
              value={scope === 'topics' ? topicNames.join(', ') || '—' : 'Whole subject'}
              onEdit={() => setStep('scope')}
            />
            <View className="gap-2 border-t border-line p-4">
              <Text variant="label">Questions from</Text>
              <View className="flex-row flex-wrap gap-2">
                <Chip
                  label="Mix of all past papers"
                  selected={source === 'mix'}
                  onPress={() => {
                    setSource('mix');
                    setPaperId(undefined);
                  }}
                />
                <Chip
                  label="A specific paper"
                  selected={source === 'paper'}
                  disabled={papersWithQuestions.length === 0}
                  onPress={() => setSource('paper')}
                />
              </View>
              {source === 'paper' ? (
                <View className="flex-row flex-wrap gap-2">
                  {papersWithQuestions.map((p) => (
                    <Chip
                      key={p.id}
                      label={`${p.year} · Paper ${p.paperNumber}`}
                      selected={paperId === p.id}
                      onPress={() => setPaperId(p.id)}
                    />
                  ))}
                </View>
              ) : null}
            </View>
            <View className="gap-2 border-t border-line p-4">
              <Text variant="label">Number of questions</Text>
              <View className="flex-row gap-2">
                {COUNTS.map((c) => (
                  <Chip key={c} label={String(c)} selected={count === c} onPress={() => setCount(c)} />
                ))}
              </View>
            </View>
          </Card>

          {pool.isLoading ? null : available === 0 ? (
            <Card tone="warning" className="gap-3">
              <Text variant="body" className="text-accent-deep">
                There are no past-paper questions for this choice yet.
              </Text>
              <Button label="Learn it in Explain mode instead" variant="secondary" onPress={() => start('explain')} />
            </Card>
          ) : available < count ? (
            <Card tone="warning" className="gap-3">
              <Text variant="body" className="text-accent-deep">
                Only {pluralize(available, 'question')} available for this choice. You can start with those, or
                learn the topic in Explain mode.
              </Text>
              <Button label="Use Explain mode instead" variant="secondary" onPress={() => start('explain')} />
            </Card>
          ) : null}
        </View>
      ) : null}
    </Screen>
  );
}

function SummaryRow({
  label,
  value,
  onEdit,
  first,
}: {
  label: string;
  value: string;
  onEdit: () => void;
  first?: boolean;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${label}: ${value}. Edit`}
      onPress={onEdit}
      className={cn(
        'min-h-14 flex-row items-center gap-3 px-4 py-3 active:bg-surface-alt',
        !first && 'border-t border-line',
      )}
    >
      <Text variant="label" className="w-20 text-muted">
        {label}
      </Text>
      <Text variant="body" className="flex-1" numberOfLines={2}>
        {value}
      </Text>
      <Text variant="label" className="text-brand-deep">
        Edit
      </Text>
    </Pressable>
  );
}
