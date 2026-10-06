import { useQueryClient } from '@tanstack/react-query';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Alert, View } from 'react-native';

import {
  Badge,
  Button,
  Card,
  ErrorState,
  ListRow,
  Screen,
  ScreenHeader,
  SectionHeader,
  SkeletonList,
  Text,
} from '@/components/ui';
import { queryKeys, useDownload, usePaper, usePaperQuestions, useSubject } from '@/hooks/queries';
import { useRequireAccount } from '@/hooks/useRequireAccount';
import { downloadsService } from '@/services/downloads';
import { useQuizStore } from '@/stores/quizStore';
import { useSessionStore } from '@/stores/sessionStore';

export default function PaperScreen() {
  const { paperId } = useLocalSearchParams<{ paperId: string }>();
  const paper = usePaper(paperId);
  const subject = useSubject(paper.data?.subjectId);
  const questions = usePaperQuestions(paperId);
  const download = useDownload(paperId);
  const queryClient = useQueryClient();
  const requireAccount = useRequireAccount();
  const startQuiz = useQuizStore((s) => s.start);
  const setLastPaper = useSessionStore((s) => s.setLastPaper);
  const [downloading, setDownloading] = useState(false);

  const p = paper.data;
  const title = p && subject.data ? `${subject.data.name} ${p.year} · Paper ${p.paperNumber}` : 'Paper';
  const mcqs = (questions.data ?? []).filter((q) => q.type === 'mcq');

  const practise = (timed: boolean) => {
    if (!p || mcqs.length === 0 || !requireAccount('quiz')) return;
    // Timed mode keeps the real exam pace: the paper's time, pro-rated to the questions available.
    const examPaceMs = p.durationMinutes * 60_000 * Math.min(1, mcqs.length / Math.max(p.questionCount, 1));
    startQuiz({
      title,
      source: timed ? 'mock' : 'paper',
      questions: mcqs,
      timeLimitMs: timed ? examPaceMs : null,
    });
    setLastPaper({ paperId, title, position: 1, total: mcqs.length });
    router.push('/quiz/session');
  };

  const toggleDownload = async () => {
    if (!p) return;
    setDownloading(true);
    try {
      if (download.data) await downloadsService.remove(p.id);
      else await downloadsService.download(p);
      await queryClient.invalidateQueries({ queryKey: queryKeys.downloads });
    } catch (e) {
      Alert.alert('Download failed', e instanceof Error ? e.message : 'Try again on a stronger connection.');
    } finally {
      setDownloading(false);
    }
  };

  if (paper.isError) return <ErrorState onRetry={() => void paper.refetch()} />;

  return (
    <Screen topBar={<ScreenHeader title={title} />}>
      {p ? (
        <Card tone="alt" className="gap-1">
          <Text variant="caption">
            {p.durationMinutes} minutes · {p.totalMarks} marks
          </Text>
          <View className="mt-1 flex-row flex-wrap gap-2">
            {mcqs.length > 0 ? <Badge label={`${mcqs.length} interactive questions`} /> : null}
            {download.data ? <Badge label="Saved offline" tone="success" /> : null}
          </View>
        </Card>
      ) : null}

      {mcqs.length > 0 ? (
        <View className="gap-2">
          <Button label="Practise with instant marking" icon="flash-outline" onPress={() => practise(false)} />
          <Button label="Timed attempt" variant="secondary" icon="timer-outline" onPress={() => practise(true)} />
        </View>
      ) : null}

      {p?.pdfPath ? (
        <View className="flex-row gap-2">
          <Button
            label="View PDF"
            variant="secondary"
            icon="document-text-outline"
            className="flex-1"
            onPress={() => router.push({ pathname: '/pdf/[paperId]', params: { paperId } })}
          />
          <Button
            label={download.data ? 'Remove' : 'Download'}
            variant="ghost"
            icon={download.data ? 'trash-outline' : 'download-outline'}
            loading={downloading}
            className="flex-1"
            onPress={toggleDownload}
          />
        </View>
      ) : null}

      <SectionHeader title="Questions and solutions" />
      {questions.isLoading ? (
        <SkeletonList rows={3} />
      ) : (questions.data ?? []).length === 0 ? (
        <Text variant="body" className="text-muted">
          This paper is available as a PDF. Skyline teachers are adding worked solutions.
        </Text>
      ) : (
        <View>
          {questions.data!.map((q) => (
            <ListRow
              key={q.id}
              title={`Question ${q.label}`}
              subtitle={q.type === 'mcq' ? 'Multiple choice' : 'Structured'}
              trailing={<Badge label={`${q.marks} ${q.marks === 1 ? 'mark' : 'marks'}`} tone="neutral" />}
              onPress={() => router.push({ pathname: '/solution/[questionId]', params: { questionId: q.id } })}
              className="border-b border-line"
            />
          ))}
          <Text variant="caption" className="mt-2">
            Tap a question to see the marked solution.
          </Text>
        </View>
      )}
    </Screen>
  );
}
