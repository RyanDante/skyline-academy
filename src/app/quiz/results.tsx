import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useMemo, useRef } from 'react';
import { View } from 'react-native';

import { ShareableCard, type ShareableCardHandle } from '@/components/share/ShareableCard';
import { MathText } from '@/components/study/MathText';
import { Button, Card, ListRow, Screen, ScreenHeader, SectionHeader, Text } from '@/components/ui';
import { isCorrect, scoreQuiz } from '@/domain/quiz';
import { formatDuration } from '@/lib/dates';
import { percent } from '@/lib/format';
import { useQuizStore } from '@/stores/quizStore';
import { useSessionStore } from '@/stores/sessionStore';
import { useThemeColors } from '@/theme/tokens';

export default function QuizResults() {
  const { questions, answers, startedAt, finishedAt, title, reset } = useQuizStore();
  const firstName = useSessionStore((s) => s.profile?.firstName ?? 'I');
  const colors = useThemeColors();
  const shareRef = useRef<ShareableCardHandle>(null);

  const score = useMemo(() => scoreQuiz(questions, answers), [questions, answers]);
  const duration = startedAt && finishedAt ? finishedAt - startedAt : 0;
  const message =
    score.ratio >= 0.8 ? 'Excellent work.' : score.ratio >= 0.5 ? 'Good progress. Review the ones you missed.' : 'Keep going. Every wrong answer shows you what to fix.';

  const done = () => {
    reset();
    router.replace('/(tabs)');
  };

  return (
    <Screen
      topBar={<ScreenHeader title="Results" onBack={done} closeIcon />}
      footer={
        <View className="flex-row gap-2">
          <Button label="Practise again" variant="secondary" className="flex-1" onPress={() => router.replace('/quiz/setup')} />
          <Button label="Done" className="flex-1" onPress={done} />
        </View>
      }
    >
      <Card tone="alt" className="items-center gap-1 py-6">
        <Text variant="hero" className="text-brand-deep" accessibilityLabel={`Score ${percent(score.ratio)}`}>
          {percent(score.ratio)}
        </Text>
        <Text variant="bodyStrong">
          {score.correct} of {score.total} correct
        </Text>
        <Text variant="caption">Time {formatDuration(duration)}</Text>
        <Text variant="body" className="mt-2 text-center text-muted">
          {message}
        </Text>
      </Card>

      {score.ratio >= 0.6 ? (
        <View className="gap-2">
          <ShareableCard
            ref={shareRef}
            headline={`${firstName} scored ${percent(score.ratio)}`}
            detail={`${title} · ${score.correct}/${score.total} correct`}
          />
          <Button label="Share on WhatsApp" variant="brand" icon="share-social-outline" onPress={() => void shareRef.current?.share()} />
        </View>
      ) : null}

      <SectionHeader title="Review" />
      <View>
        {questions.map((q, i) => {
          const correct = isCorrect(q, answers[q.id] ?? null);
          const answered = answers[q.id] != null;
          return (
            <ListRow
              key={q.id}
              title={`Question ${i + 1}`}
              subtitle={answered ? `You chose ${answers[q.id]} · answer ${q.correctKey}` : 'Not answered'}
              trailing={
                <Ionicons
                  name={correct ? 'checkmark-circle' : 'close-circle'}
                  size={22}
                  color={correct ? colors.success : colors.accentDeep}
                />
              }
              onPress={() => router.push({ pathname: '/solution/[questionId]', params: { questionId: q.id } })}
              className="border-b border-line"
            />
          );
        })}
      </View>
      <MathText variant="caption">Tap any question for the full marked solution.</MathText>
    </Screen>
  );
}
