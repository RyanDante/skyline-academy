import { useQueryClient } from '@tanstack/react-query';
import { router } from 'expo-router';
import { useCallback, useEffect } from 'react';
import { Alert, View } from 'react-native';

import { QuestionCard } from '@/components/study/QuestionCard';
import { Button, EmptyState, ProgressBar, Screen, ScreenHeader, Text } from '@/components/ui';
import { isCorrect } from '@/domain/quiz';
import { queryKeys } from '@/hooks/queries';
import { useCountdown } from '@/hooks/useCountdown';
import { formatDuration } from '@/lib/dates';
import { createId } from '@/lib/id';
import { attemptsService } from '@/services/attempts';
import { useQuizStore } from '@/stores/quizStore';
import { useSessionStore } from '@/stores/sessionStore';
import type { Attempt } from '@/types/models';

export default function QuizSession() {
  const quiz = useQuizStore();
  const queryClient = useQueryClient();
  const setLastPaper = useSessionStore((s) => s.setLastPaper);
  const lastPaper = useSessionStore((s) => s.lastPaper);

  const timed = quiz.timeLimitMs !== null;
  const endsAt = timed && quiz.startedAt ? quiz.startedAt + quiz.timeLimitMs! : null;
  const remaining = useCountdown(endsAt);

  const question = quiz.questions[quiz.index];
  const selected = question ? (quiz.answers[question.id] ?? null) : null;
  const revealed = !timed && selected !== null;
  const isLast = quiz.index === quiz.questions.length - 1;

  const finish = useCallback(async () => {
    const state = useQuizStore.getState();
    state.finish();
    const { answers, timeSpent, questions, source } = useQuizStore.getState();
    const now = Date.now();
    // Timed attempts count unanswered questions as wrong; practice only records what was answered.
    const attempts: Attempt[] = questions
      .filter((q) => source === 'mock' || answers[q.id] != null)
      .map((q) => ({
        id: createId(),
        questionId: q.id,
        subjectId: q.subjectId,
        topicIds: q.topicIds,
        selectedKey: answers[q.id] ?? null,
        correct: isCorrect(q, answers[q.id] ?? null),
        timeMs: Math.round(timeSpent[q.id] ?? 0),
        source,
        createdAt: now,
      }));
    await attemptsService.record(attempts);
    await queryClient.invalidateQueries({ queryKey: queryKeys.attempts });
    router.replace('/quiz/results');
  }, [queryClient]);

  // Auto-submit when the timer runs out.
  useEffect(() => {
    if (remaining === 0 && !quiz.finishedAt) void finish();
  }, [remaining, quiz.finishedAt, finish]);

  // Keep "Continue" on Home pointing at the current question for paper practice.
  useEffect(() => {
    if (lastPaper && quiz.source !== 'quiz' && lastPaper.title === quiz.title) {
      setLastPaper({ ...lastPaper, position: quiz.index + 1 });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [quiz.index]);

  const confirmExit = () =>
    Alert.alert('Leave this quiz?', 'Your answers so far will be saved and marked.', [
      { text: 'Keep going', style: 'cancel' },
      { text: 'Finish now', onPress: () => void finish() },
    ]);

  if (!question) {
    return (
      <View className="flex-1 bg-bg">
        <ScreenHeader title="Quiz" />
        <EmptyState
          icon="flash-outline"
          title="No quiz in progress"
          body="Pick a subject and topics to start practising."
          actionLabel="Set up a quiz"
          onAction={() => router.replace('/quiz/setup')}
        />
      </View>
    );
  }

  return (
    <Screen
      topBar={
        <ScreenHeader
          title={quiz.title}
          subtitle={`${quiz.index + 1} of ${quiz.questions.length}`}
          onBack={confirmExit}
          closeIcon
          right={
            remaining !== null ? (
              <Text
                variant="bodyStrong"
                className={remaining < 60_000 ? 'text-accent-deep' : 'text-ink'}
                accessibilityLabel={`Time left ${formatDuration(remaining)}`}
              >
                {formatDuration(remaining)}
              </Text>
            ) : undefined
          }
        />
      }
      footer={
        <View className="flex-row gap-2">
          {quiz.index > 0 ? (
            <Button label="Back" variant="secondary" className="flex-1" onPress={() => quiz.goTo(quiz.index - 1)} />
          ) : null}
          {isLast ? (
            <Button label="Finish" className="flex-1" onPress={() => void finish()} />
          ) : (
            <Button
              label={revealed || timed ? 'Next' : 'Skip'}
              variant={revealed || timed ? 'primary' : 'ghost'}
              className="flex-1"
              onPress={() => quiz.goTo(quiz.index + 1)}
            />
          )}
        </View>
      }
    >
      <ProgressBar value={(quiz.index + 1) / quiz.questions.length} tone="brand" />
      <QuestionCard
        question={question}
        selected={selected}
        reveal={revealed}
        onSelect={(key) => quiz.answer(question.id, key)}
      />
      {revealed ? (
        <Button
          label="See the marked solution"
          variant="ghost"
          iconRight="arrow-forward"
          onPress={() => router.push({ pathname: '/solution/[questionId]', params: { questionId: question.id } })}
        />
      ) : null}
    </Screen>
  );
}
