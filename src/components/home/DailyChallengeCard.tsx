import { Ionicons } from '@expo/vector-icons';
import { useQueryClient } from '@tanstack/react-query';
import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, View } from 'react-native';

import { isCorrect } from '@/domain/quiz';
import { queryKeys, useAttempts, useSubject, useSubjectQuestions } from '@/hooks/queries';
import { cn } from '@/lib/cn';
import { createId } from '@/lib/id';
import { todayKey } from '@/lib/dates';
import { attemptsService } from '@/services/attempts';
import { useThemeColors } from '@/theme/tokens';
import type { OptionKey } from '@/types/models';

import { MathText } from '../study/MathText';
import { Text } from '../ui/Text';

/** Same question for everyone on the same day: a stable hash of the date. */
function dailyIndex(n: number): number {
  const key = todayKey();
  let h = 0;
  for (const ch of key) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return n ? h % n : 0;
}

/**
 * "Today's Challenge" (mockup 6): one real past-paper MCQ a day from the student's main
 * subject, answered right on Home.
 */
export function DailyChallengeCard({ subjectId }: { subjectId: string | undefined }) {
  const colors = useThemeColors();
  const queryClient = useQueryClient();
  const subject = useSubject(subjectId);
  const pool = useSubjectQuestions(subjectId);
  const { data: attempts } = useAttempts();
  const [open, setOpen] = useState(false);
  const [picked, setPicked] = useState<OptionKey | null>(null);

  const question = useMemo(() => {
    const mcqs = (pool.data ?? []).filter((q) => q.type === 'mcq').sort((a, b) => a.id.localeCompare(b.id));
    return mcqs[dailyIndex(mcqs.length)];
  }, [pool.data]);

  const today = todayKey();
  const previous = (attempts ?? []).find(
    (a) => a.questionId === question?.id && todayKey(new Date(a.createdAt)) === today,
  );
  const answer = picked ?? previous?.selectedKey ?? null;
  const done = answer !== null;

  if (!subjectId || !question) return null;

  const choose = async (key: OptionKey) => {
    if (done) return;
    setPicked(key);
    await attemptsService.record([
      {
        id: createId(),
        questionId: question.id,
        subjectId: question.subjectId,
        topicIds: question.topicIds,
        selectedKey: key,
        correct: isCorrect(question, key),
        timeMs: 0,
        source: 'quiz',
        createdAt: Date.now(),
      },
    ]);
    await queryClient.invalidateQueries({ queryKey: queryKeys.attempts });
  };

  return (
    <View className="gap-3 rounded-card bg-accent-soft p-4">
      <View className="flex-row items-start gap-3">
        <Ionicons name="star" size={26} color={colors.accent} />
        <View className="flex-1">
          <Text variant="h3">Today’s Challenge</Text>
          <Text variant="small">Answer a quick question and keep your streak going!</Text>
        </View>
      </View>

      <Pressable
        accessibilityRole="button"
        accessibilityState={{ expanded: open }}
        onPress={() => setOpen((o) => !o)}
        className="min-h-12 flex-row items-center gap-3 rounded-control bg-surface px-3 active:opacity-80"
      >
        <Ionicons name="bar-chart" size={20} color={colors.brandDeep} />
        <Text variant="bodyStrong" className="flex-1 text-brand-deep">
          {subject.data?.name ?? 'Your subject'}
          {done ? (isCorrect(question, answer) ? '  ✓ Done' : '  · Answered') : ''}
        </Text>
        <Ionicons name={open ? 'chevron-up' : 'chevron-forward'} size={20} color={colors.muted} />
      </Pressable>

      {open ? (
        <View className="gap-2.5">
          <MathText variant="body">{question.stem}</MathText>
          {question.options?.map((o) => {
            const correct = question.correctKey === o.key;
            const chosen = answer === o.key;
            return (
              <Pressable
                key={o.key}
                accessibilityRole="radio"
                accessibilityState={{ checked: chosen, disabled: done }}
                disabled={done}
                onPress={() => void choose(o.key)}
                className={cn(
                  'min-h-12 flex-row items-center gap-3 rounded-control border px-3 py-2',
                  done && correct
                    ? 'border-success bg-success/10'
                    : done && chosen
                      ? 'border-danger bg-danger/10'
                      : 'border-line bg-surface',
                )}
              >
                <Text variant="label" className="w-5">{o.key}</Text>
                <MathText variant="body" className="flex-1">{o.text}</MathText>
                {done && correct ? <Ionicons name="checkmark-circle" size={20} color={colors.success} /> : null}
                {done && chosen && !correct ? <Ionicons name="close-circle" size={20} color={colors.danger} /> : null}
              </Pressable>
            );
          })}
          {done ? (
            <Pressable
              accessibilityRole="link"
              onPress={() => router.push({ pathname: '/solution/[questionId]', params: { questionId: question.id } })}
              className="min-h-11 justify-center"
            >
              <Text variant="label" className="text-brand-deep">See the marked solution →</Text>
            </Pressable>
          ) : null}
        </View>
      ) : null}
    </View>
  );
}
