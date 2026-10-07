import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';

import { Button, Chip, Screen, ScreenHeader, Text } from '@/components/ui';
import { buildQuiz } from '@/domain/quiz';
import { useSubjectQuestions, useSubjects, useTopics } from '@/hooks/queries';
import { useRequireAccount } from '@/hooks/useRequireAccount';
import { useQuizStore } from '@/stores/quizStore';
import { useSessionStore } from '@/stores/sessionStore';
import type { Difficulty } from '@/types/models';

const COUNTS = [5, 10, 20];
const DIFFICULTIES: { id: Difficulty | 'any'; label: string }[] = [
  { id: 'any', label: 'Any' },
  { id: 1, label: 'Easy' },
  { id: 2, label: 'Medium' },
  { id: 3, label: 'Hard' },
];
/** Seconds allowed per MCQ in timed mode (GCE Paper 1 pace is roughly 1.8 min per question). */
const SECONDS_PER_QUESTION = 108;

export default function QuizSetup() {
  const params = useLocalSearchParams<{ subjectId?: string; topicId?: string }>();
  const profile = useSessionStore((s) => s.profile);
  const requireAccount = useRequireAccount();
  const startQuiz = useQuizStore((s) => s.start);

  const subjects = useSubjects(profile?.level ?? 'A');
  const mySubjects = (subjects.data ?? []).filter(
    (s) => !profile?.subjectIds.length || profile.subjectIds.includes(s.id) || s.id === params.subjectId,
  );

  const [chosenSubjectId, setSubjectId] = useState<string | undefined>(
    params.subjectId || profile?.subjectIds[0],
  );
  // Falls back to the first available subject once the list loads.
  const subjectId = chosenSubjectId ?? mySubjects[0]?.id;
  const [topicIds, setTopicIds] = useState<string[]>(params.topicId ? [params.topicId] : []);
  const [difficulty, setDifficulty] = useState<Difficulty | 'any'>('any');
  const [count, setCount] = useState(10);
  const [timed, setTimed] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const topics = useTopics(subjectId);
  const pool = useSubjectQuestions(subjectId);

  const toggleTopic = (id: string) =>
    setTopicIds((ids) => (ids.includes(id) ? ids.filter((t) => t !== id) : [...ids, id]));

  const start = () => {
    if (!subjectId || !requireAccount('quiz')) return;
    const questions = buildQuiz(pool.data ?? [], { subjectId, topicIds, difficulty, count });
    if (questions.length === 0) {
      setMessage('No questions match yet. Try "Any" difficulty or fewer topics.');
      return;
    }
    const subjectName = mySubjects.find((s) => s.id === subjectId)?.name ?? 'Quiz';
    startQuiz({
      title: `${subjectName} quiz`,
      source: timed ? 'mock' : 'quiz',
      questions,
      timeLimitMs: timed ? questions.length * SECONDS_PER_QUESTION * 1000 : null,
    });
    router.replace('/quiz/session');
  };

  return (
    <Screen
      topBar={<ScreenHeader title="Set up a quiz" />}
      footer={<Button label="Start quiz" variant="go" onPress={start} loading={pool.isLoading} disabled={!subjectId} />}
    >
      <Text variant="label">Subject</Text>
      <View className="flex-row flex-wrap gap-2">
        {mySubjects.map((s) => (
          <Chip
            key={s.id}
            label={s.name}
            selected={subjectId === s.id}
            onPress={() => {
              setSubjectId(s.id);
              setTopicIds([]);
              setMessage(null);
            }}
          />
        ))}
      </View>

      <Text variant="label">Topics {topicIds.length === 0 ? '(all)' : `(${topicIds.length})`}</Text>
      <View className="flex-row flex-wrap gap-2">
        {(topics.data ?? []).map((t) => (
          <Chip key={t.id} label={t.name} selected={topicIds.includes(t.id)} onPress={() => toggleTopic(t.id)} />
        ))}
      </View>

      <Text variant="label">Difficulty</Text>
      <View className="flex-row flex-wrap gap-2">
        {DIFFICULTIES.map((d) => (
          <Chip key={String(d.id)} label={d.label} selected={difficulty === d.id} onPress={() => setDifficulty(d.id)} />
        ))}
      </View>

      <Text variant="label">Number of questions</Text>
      <View className="flex-row gap-2">
        {COUNTS.map((c) => (
          <Chip key={c} label={String(c)} selected={count === c} onPress={() => setCount(c)} />
        ))}
      </View>

      <Text variant="label">Mode</Text>
      <View className="flex-row gap-2">
        <Chip label="Instant marking" selected={!timed} onPress={() => setTimed(false)} />
        <Chip label="Timed, exam pace" selected={timed} onPress={() => setTimed(true)} />
      </View>

      {message ? (
        <Text variant="body" className="text-accent-deep" accessibilityLiveRegion="polite">
          {message}
        </Text>
      ) : null}
    </Screen>
  );
}
