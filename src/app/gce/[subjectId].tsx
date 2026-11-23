import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useMemo, useState } from 'react';
import { View } from 'react-native';

import { PaperRow } from '@/components/study/PaperRow';
import {
  Button,
  Card,
  Chip,
  EmptyState,
  ErrorState,
  ProgressBar,
  Screen,
  ScreenHeader,
  SectionHeader,
  SkeletonList,
  Text,
} from '@/components/ui';
import { useDownloads, usePapers, useSubject, useSubjects, useTopics } from '@/hooks/queries';
import { useTopicMastery } from '@/hooks/useReadiness';
import { formatCFA } from '@/lib/format';
import { product } from '@/lib/config';
import { useThemeColors } from '@/theme/tokens';
import type { Level } from '@/types/models';

/** Subject page (design mockup 8): level switch, year chips, papers with answer unlocks. */
export default function SubjectScreen() {
  const { subjectId } = useLocalSearchParams<{ subjectId: string }>();
  const colors = useThemeColors();
  const subject = useSubject(subjectId);
  const papers = usePapers(subjectId);
  const topics = useTopics(subjectId);
  const downloads = useDownloads();
  const mastery = useTopicMastery();

  // The O/A switch moves to the same subject at the other level, when it exists.
  const level = subject.data?.level ?? 'A';
  const otherLevel: Level = level === 'A' ? 'O' : 'A';
  const otherSubjects = useSubjects(otherLevel);
  const counterpart = otherSubjects.data?.find((s) => s.name === subject.data?.name || s.id === subjectId?.replace(/^[ao]-/, `${otherLevel.toLowerCase()}-`));

  const years = useMemo(
    () => [...new Set((papers.data ?? []).map((p) => p.year))].sort((a, b) => b - a),
    [papers.data],
  );
  const [year, setYear] = useState<number | null>(null);
  const activeYear = year ?? years[0] ?? null;
  const yearPapers = (papers.data ?? []).filter((p) => p.year === activeYear);
  const downloadedIds = new Set((downloads.data ?? []).map((d) => d.paperId));

  return (
    <Screen
      topBar={<ScreenHeader title={subject.data?.name ?? 'Subject'} subtitle={subject.data?.code ? `Code ${subject.data.code}` : undefined} />}
      footer={
        <Button
          label="Practise this subject"
          variant="go"
          icon="flash-outline"
          onPress={() => router.push({ pathname: '/quiz/setup', params: { subjectId } })}
        />
      }
    >
      <View className="flex-row gap-2 rounded-full bg-surface-alt p-1">
        {(['O', 'A'] as Level[]).map((l) => {
          const active = l === level;
          return (
            <Chip
              key={l}
              label={`${l} Level`}
              selected={active}
              disabled={!active && !counterpart}
              className="flex-1 justify-center border-0"
              onPress={() =>
                !active && counterpart && router.replace({ pathname: '/gce/[subjectId]', params: { subjectId: counterpart.id } })
              }
            />
          );
        })}
      </View>

      {years.length > 0 ? (
        <View className="flex-row flex-wrap gap-2">
          {years.map((y) => (
            <Chip key={y} label={String(y)} selected={y === activeYear} onPress={() => setYear(y)} />
          ))}
        </View>
      ) : null}

      {papers.isLoading ? (
        <SkeletonList rows={3} />
      ) : papers.isError ? (
        <ErrorState onRetry={() => void papers.refetch()} />
      ) : yearPapers.length === 0 ? (
        <EmptyState icon="document-outline" title="Papers are on the way" body="Skyline teachers are adding this subject’s papers now." />
      ) : (
        <View>
          {yearPapers.map((p) => (
            <PaperRow key={p.id} paper={p} downloaded={downloadedIds.has(p.id)} />
          ))}
        </View>
      )}

      <View className="flex-row items-center gap-3 rounded-card border border-line bg-surface p-4">
        <Ionicons name="information-circle-outline" size={26} color={colors.brandDeep} />
        <Text variant="body" className="flex-1 text-brand-deep">
          Answers can be unlocked for {formatCFA(product.prices.paperAnswers).replace(' CFA', ' FCFA')} each, or all
          at once with the Season Pass.
        </Text>
      </View>

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
              <Text variant="h3" className="flex-1">{topic.name}</Text>
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
