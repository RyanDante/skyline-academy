import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { View } from 'react-native';

import { AiHeader } from '@/components/tutor/AiHeader';
import { Badge, Button, Card, EmptyState, Screen, SectionHeader, Text } from '@/components/ui';
import { useTopics } from '@/hooks/queries';
import { formatDuration } from '@/lib/dates';
import { percent, pluralize } from '@/lib/format';
import { useGceTutorStore } from '@/stores/gceTutorStore';
import { useSessionStore } from '@/stores/sessionStore';

interface TopicResult {
  topicId: string;
  name: string;
  correct: number;
  marked: number;
  strong: boolean;
}

/** Session summary (design brief 6.4). */
export default function GceTutorSummary() {
  const session = useGceTutorStore((s) => s.session);
  const clear = useGceTutorStore((s) => s.clear);
  const lastLevel = useGceTutorStore((s) => s.lastLevel);
  const addToRevisionPlan = useSessionStore((s) => s.addToRevisionPlan);
  const topics = useTopics(session?.subjectId);
  const [saved, setSaved] = useState(false);

  const { correct, marked, topicResults } = useMemo(() => {
    if (!session) return { correct: 0, marked: 0, topicResults: [] as TopicResult[] };
    const byTopic = new Map<string, { correct: number; marked: number }>();
    let c = 0;
    let m = 0;
    for (const q of session.questions) {
      const a = session.answers[q.id];
      if (!a || a.correct === null) continue;
      m += 1;
      if (a.correct) c += 1;
      for (const t of q.topicIds) {
        const entry = byTopic.get(t) ?? { correct: 0, marked: 0 };
        entry.marked += 1;
        if (a.correct) entry.correct += 1;
        byTopic.set(t, entry);
      }
    }
    const names = new Map((topics.data ?? []).map((t) => [t.id, t.name]));
    const results = [...byTopic.entries()].map(([topicId, v]) => ({
      topicId,
      name: names.get(topicId) ?? topicId,
      ...v,
      strong: v.correct / v.marked >= 0.7,
    }));
    results.sort((a, b) => Number(a.strong) - Number(b.strong));
    return { correct: c, marked: m, topicResults: results };
  }, [session, topics.data]);

  if (!session) {
    return (
      <View className="flex-1 bg-bg">
        <AiHeader persona="tutor" />
        <EmptyState icon="stats-chart-outline" title="No session to show" body="Start a session with the GCE Tutor." />
      </View>
    );
  }

  const weak = topicResults.filter((t) => !t.strong);
  const duration = (session.finishedAt ?? Date.now()) - session.startedAt;

  const done = () => {
    clear();
    router.replace('/(tabs)/tutor');
  };

  return (
    <Screen
      topBar={<AiHeader persona="tutor" onBack={done} />}
      footer={<Button label="Done" onPress={done} />}
    >
      <Card tone="alt" className="items-center gap-1 py-6">
        {marked > 0 ? (
          <>
            <Text variant="hero" className="text-brand-deep" accessibilityLabel={`Score ${percent(correct / marked)}`}>
              {percent(correct / marked)}
            </Text>
            <Text variant="h3">
              {correct} of {pluralize(marked, 'marked question')} correct
            </Text>
          </>
        ) : (
          <Text variant="h3">No marked answers this time</Text>
        )}
        <Text variant="small">Time {formatDuration(duration)}</Text>
      </Card>

      {topicResults.length > 0 ? (
        <>
          <SectionHeader title="Topics" />
          {topicResults.map((t) => (
            <View key={t.topicId} className="min-h-12 flex-row items-center justify-between gap-3">
              <View className="flex-1">
                <Text variant="body">{t.name}</Text>
                <Text variant="caption">
                  {t.correct} of {t.marked} correct
                </Text>
              </View>
              <Badge label={t.strong ? '✓ Strong' : '! Needs work'} tone={t.strong ? 'success' : 'accent'} />
            </View>
          ))}
        </>
      ) : null}

      {weak.length > 0 ? (
        <View className="gap-2">
          <Button
            label="Practise weak topics"
            variant="go"
            icon="refresh"
            onPress={() => {
              const subjectId = session.subjectId;
              clear();
              router.replace({
                pathname: '/tutor/gce/setup',
                params: {
                  subjectId,
                  level: lastLevel ?? 'A',
                  topicIds: weak.map((t) => t.topicId).join(','),
                },
              });
            }}
          />
          <Button
            label={saved ? 'Saved to your revision plan' : 'Save to revision plan'}
            variant="secondary"
            icon={saved ? 'checkmark' : 'bookmark-outline'}
            disabled={saved}
            onPress={() => {
              addToRevisionPlan(
                weak.map((t) => ({ subjectId: session.subjectId, topicId: t.topicId, name: t.name })),
              );
              setSaved(true);
            }}
          />
        </View>
      ) : null}
    </Screen>
  );
}
