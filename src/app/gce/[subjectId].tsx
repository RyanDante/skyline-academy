import { router, useLocalSearchParams } from 'expo-router';
import { useMemo } from 'react';
import { Pressable, View } from 'react-native';

import {
  Button,
  Card,
  EmptyState,
  ErrorState,
  ProgressBar,
  Screen,
  ScreenHeader,
  SectionHeader,
  SkeletonList,
  Text,
} from '@/components/ui';
import { usePapers, useSubject, useTopics } from '@/hooks/queries';
import { useTopicMastery } from '@/hooks/useReadiness';
import { cn } from '@/lib/cn';
import type { Paper } from '@/types/models';

export default function SubjectScreen() {
  const { subjectId } = useLocalSearchParams<{ subjectId: string }>();
  const subject = useSubject(subjectId);
  const papers = usePapers(subjectId);
  const topics = useTopics(subjectId);
  const mastery = useTopicMastery();

  const byYear = useMemo(() => {
    const groups = new Map<number, Paper[]>();
    for (const p of papers.data ?? []) groups.set(p.year, [...(groups.get(p.year) ?? []), p]);
    return [...groups.entries()].sort((a, b) => b[0] - a[0]);
  }, [papers.data]);

  const title = subject.data ? `${subject.data.level} Level ${subject.data.name}` : 'Subject';

  return (
    <Screen
      topBar={<ScreenHeader title={title} subtitle={subject.data?.code ? `Code ${subject.data.code}` : undefined} />}
      footer={
        <Button
          label="Practise this subject"
          icon="flash-outline"
          onPress={() => router.push({ pathname: '/quiz/setup', params: { subjectId } })}
        />
      }
    >
      <SectionHeader title="Past papers" />
      {papers.isLoading ? (
        <SkeletonList rows={3} />
      ) : papers.isError ? (
        <ErrorState onRetry={() => void papers.refetch()} />
      ) : byYear.length === 0 ? (
        <EmptyState icon="document-outline" title="Papers are on the way" body="Skyline teachers are adding this subject's papers now." />
      ) : (
        byYear.map(([year, list]) => (
          <View key={year} className="gap-2">
            <Text variant="overline">{year}</Text>
            <View className="flex-row flex-wrap gap-2">
              {list.map((paper) => (
                <Pressable
                  key={paper.id}
                  accessibilityRole="button"
                  accessibilityLabel={`${year} Paper ${paper.paperNumber}`}
                  onPress={() => router.push({ pathname: '/paper/[paperId]', params: { paperId: paper.id } })}
                  className={cn(
                    'min-w-[30%] flex-1 rounded-card border px-3 py-3 active:bg-surface-alt',
                    paper.questionCount > 0 ? 'border-brand-deep bg-surface' : 'border-line bg-surface',
                  )}
                >
                  <Text variant="bodyStrong">Paper {paper.paperNumber}</Text>
                  <Text variant="caption">
                    {paper.questionCount > 0 ? `${paper.questionCount} interactive` : 'PDF only'}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>
        ))
      )}

      <SectionHeader title="Topics" />
      {(topics.data ?? []).map((topic) => {
        const m = mastery.get(topic.id);
        return (
          <Card
            key={topic.id}
            onPress={() => router.push({ pathname: '/quiz/setup', params: { subjectId, topicId: topic.id } })}
            accessibilityLabel={`Practise ${topic.name}`}
          >
            <View className="flex-row items-center justify-between">
              <Text variant="bodyStrong" className="flex-1">
                {topic.name}
              </Text>
              <Text variant="caption">
                {m?.mastery != null ? `${Math.round(m.mastery * 100)}%` : m ? `${m.attempts} answered` : 'Untested'}
              </Text>
            </View>
            {m?.mastery != null ? <ProgressBar value={m.mastery} tone="brand" className="mt-2" /> : null}
          </Card>
        );
      })}
    </Screen>
  );
}
