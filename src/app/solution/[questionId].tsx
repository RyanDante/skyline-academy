import { router, useLocalSearchParams } from 'expo-router';

import { QuestionCard } from '@/components/study/QuestionCard';
import { SolutionView } from '@/components/study/SolutionView';
import { Button, EmptyState, ErrorState, Screen, ScreenHeader, SkeletonList } from '@/components/ui';
import { useQuestion, useSolution } from '@/hooks/queries';
import { hasFullAccess, useSessionStore } from '@/stores/sessionStore';

export default function SolutionScreen() {
  const { questionId } = useLocalSearchParams<{ questionId: string }>();
  const question = useQuestion(questionId);
  const solution = useSolution(questionId);
  const entitlement = useSessionStore((s) => s.entitlement);

  const q = question.data;
  const s = solution.data;
  const unlocked = !!s && (s.tier === 'free' || hasFullAccess(entitlement, q?.subjectId));

  return (
    <Screen
      topBar={<ScreenHeader title={q ? `Question ${q.label}` : 'Solution'} />}
      footer={
        q ? (
          <Button
            label="Ask the Tutor about this"
            variant="secondary"
            icon="chatbubbles-outline"
            onPress={() => router.push({ pathname: '/(tabs)/tutor', params: { questionId } })}
          />
        ) : undefined
      }
    >
      {question.isLoading || solution.isLoading ? (
        <SkeletonList rows={3} />
      ) : question.isError ? (
        <ErrorState onRetry={() => void question.refetch()} />
      ) : !q ? (
        <EmptyState icon="help-circle-outline" title="Question not found" body="It may have been moved." />
      ) : (
        <>
          <QuestionCard question={q} selected={q.correctKey ?? null} reveal={q.type === 'mcq'} />
          {s ? (
            <SolutionView solution={s} unlocked={unlocked} onUnlock={() => router.push('/paywall')} />
          ) : (
            <EmptyState
              icon="create-outline"
              title="Solution coming soon"
              body="A Skyline teacher is writing this one. Meanwhile, the Tutor can walk you through it."
            />
          )}
        </>
      )}
    </Screen>
  );
}
