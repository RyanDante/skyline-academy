import { Ionicons } from '@expo/vector-icons';
import { useQueryClient } from '@tanstack/react-query';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Pressable,
  ScrollView,
  TextInput,
  View,
} from 'react-native';

import { QuestionCard } from '@/components/study/QuestionCard';
import { SolutionView } from '@/components/study/SolutionView';
import { AiHeader } from '@/components/tutor/AiHeader';
import { ChatBubble } from '@/components/tutor/ChatBubble';
import { Badge, Button, Card, Chip, EmptyState, OfflineBanner, Text } from '@/components/ui';
import { checkNumericAnswer, isCorrect } from '@/domain/quiz';
import { queryKeys, usePaper, useSolution } from '@/hooks/queries';
import { useNetwork } from '@/hooks/useNetwork';
import { useRequireAccount } from '@/hooks/useRequireAccount';
import { cn } from '@/lib/cn';
import { createId } from '@/lib/id';
import { attemptsService } from '@/services/attempts';
import { tutorService, type TutorIntent, type TutorMode } from '@/services/tutor';
import { useGceTutorStore, type ThreadItem } from '@/stores/gceTutorStore';
import { hasFullAccess, useSessionStore } from '@/stores/sessionStore';
import { useThemeColors } from '@/theme/tokens';
import type { OptionKey, Question } from '@/types/models';

const MODES: { id: TutorMode; label: string }[] = [
  { id: 'quiz', label: 'Quiz' },
  { id: 'explain', label: 'Explain' },
  { id: 'solve-with-me', label: 'Solve with me' },
];

/** Only the last few turns go to the server: enough context, small payload on slow data. */
const HISTORY_TURNS = 8;

export default function GceTutorSession() {
  const session = useGceTutorStore((s) => s.session);
  const { setMode, goTo, answer, addToThread, updateThread, finish } = useGceTutorStore();
  const profile = useSessionStore((s) => s.profile);
  const left = useSessionStore((s) => s.tutorQuestionsLeftToday());
  const recordUse = useSessionStore((s) => s.recordTutorQuestion);
  const queryClient = useQueryClient();
  const requireAccount = useRequireAccount();
  const { isOffline } = useNetwork();
  const colors = useThemeColors();

  const [draft, setDraft] = useState('');
  const [image, setImage] = useState<{ uri: string; base64: string } | null>(null);
  const [busy, setBusy] = useState(false);
  const scrollRef = useRef<ScrollView>(null);

  const question: Question | undefined = session?.questions[session.index];
  const threadKey = question?.id ?? '';
  const thread = session?.threads[threadKey] ?? [];
  const state = question ? session?.answers[question.id] : undefined;
  const answered = !!state;
  const isLast = !!session && session.index >= session.questions.length - 1;

  if (!session) {
    return (
      <View className="flex-1 bg-bg">
        <AiHeader persona="tutor" />
        <EmptyState
          icon="chatbubbles-outline"
          title="No session in progress"
          body="Pick a level, subject and topics to start studying with the GCE Tutor."
          actionLabel="Set up a session"
          onAction={() => router.replace('/tutor/gce/setup')}
        />
      </View>
    );
  }

  const recordAttempt = async (q: Question, selectedKey: OptionKey | null, correct: boolean) => {
    await attemptsService.record([
      {
        id: createId(),
        questionId: q.id,
        subjectId: q.subjectId,
        topicIds: q.topicIds,
        selectedKey,
        correct,
        timeMs: 0,
        source: 'quiz',
        createdAt: Date.now(),
      },
    ]);
    await queryClient.invalidateQueries({ queryKey: queryKeys.attempts });
  };

  const onSelect = (key: OptionKey) => {
    if (!question || answered) return;
    const correct = isCorrect(question, key);
    answer(question.id, { selectedKey: key, correct });
    addToThread(question.id, {
      id: createId(),
      kind: 'note',
      text: correct ? '✓ Correct' : `✗ Not quite. The answer is ${question.correctKey}.`,
    });
    void recordAttempt(question, key, correct);
  };

  /** One AI request = one free use. Returns false when the student is out of uses. */
  const askAi = async (intent: TutorIntent, message: string, opts: { show?: string; studentAnswer?: string } = {}) => {
    if (!requireAccount('tutor')) return;
    if (left <= 0) {
      Alert.alert(
        'No free AI replies left today',
        'They reset at midnight. Multiple-choice marking and Skyline solutions stay free.',
        [
          { text: 'OK', style: 'cancel' },
          { text: 'See Season Pass', onPress: () => router.push('/paywall') },
        ],
      );
      return;
    }
    const history = thread
      .filter((m) => !m.pending && !m.error && (m.kind === 'student' || m.kind === 'tutor'))
      .slice(-HISTORY_TURNS)
      .map((m) => ({ role: m.kind === 'student' ? ('user' as const) : ('assistant' as const), text: m.text }));

    if (opts.show || image) {
      addToThread(threadKey, { id: createId(), kind: 'student', text: opts.show ?? message, imageUri: image?.uri });
    }
    const replyId = createId();
    const replyKind: ThreadItem['kind'] = intent === 'solution' ? 'ai-solution' : 'tutor';
    addToThread(threadKey, { id: replyId, kind: replyKind, text: '', pending: true });
    const imageBase64 = image?.base64;
    setImage(null);
    setBusy(true);
    try {
      const res = await tutorService.ask({
        intent,
        mode: session.mode,
        message,
        history,
        level: profile?.level,
        questionId: question?.id,
        topicNames: question ? undefined : session.topicNames,
        studentAnswer: opts.studentAnswer,
        imageBase64,
      });
      recordUse();
      updateThread(threadKey, replyId, { text: res.reply, pending: false });
    } catch (e) {
      const exhausted = String((e as { code?: string })?.code ?? '').includes('resource-exhausted');
      updateThread(threadKey, replyId, {
        pending: false,
        error: true,
        text: exhausted
          ? 'You have used today’s free AI replies. They reset at midnight.'
          : isOffline
            ? 'You’re offline. Your question is still here; try again when you reconnect.'
            : 'The Tutor couldn’t answer just now. Try again in a moment.',
      });
    } finally {
      setBusy(false);
    }
  };

  const send = () => {
    const text = draft.trim();
    if ((!text && !image) || busy) return;
    setDraft('');
    // An unanswered structured question: the message is the student's answer.
    if (question && !answered && question.type !== 'mcq') {
      const auto = checkNumericAnswer(question, text);
      answer(question.id, { typed: text, correct: auto });
      if (auto !== null) {
        void recordAttempt(question, null, auto);
        addToThread(question.id, { id: createId(), kind: 'student', text, imageUri: image?.uri });
        addToThread(question.id, {
          id: createId(),
          kind: 'note',
          text: auto
            ? '✓ Your final value matches the mark scheme.'
            : '✗ Your final value doesn’t match. Try Hint or Show solution.',
        });
        setImage(null);
        return;
      }
      void askAi('check', text || 'Please check my working in the photo.', {
        show: text || 'My working',
        studentAnswer: text,
      });
      return;
    }
    void askAi('chat', text || 'Please look at my photo.', { show: text || 'Photo' });
  };

  const showSolution = () => {
    if (!question) return;
    addToThread(question.id, { id: createId(), kind: 'skyline-solution', text: question.id });
  };

  const pickImage = () => {
    const options = {
      mediaTypes: ['images'] as ImagePicker.MediaType[],
      allowsEditing: true,
      quality: 0.5,
      base64: true,
    };
    const handle = (result: ImagePicker.ImagePickerResult) => {
      const asset = result.canceled ? null : result.assets[0];
      if (asset?.base64) setImage({ uri: asset.uri, base64: asset.base64 });
    };
    Alert.alert('Add a photo of your working', undefined, [
      {
        text: 'Take photo',
        onPress: async () => {
          const perm = await ImagePicker.requestCameraPermissionsAsync();
          if (perm.granted) handle(await ImagePicker.launchCameraAsync(options));
        },
      },
      { text: 'Choose from gallery', onPress: async () => handle(await ImagePicker.launchImageLibraryAsync(options)) },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  const end = () => {
    finish();
    router.replace('/tutor/gce/summary');
  };

  const confirmEnd = () =>
    Alert.alert('End this session?', 'You’ll see your score and the topics to work on.', [
      { text: 'Keep going', style: 'cancel' },
      { text: 'End session', onPress: end },
    ]);

  const inputPlaceholder =
    question && !answered && question.type !== 'mcq'
      ? 'Type your answer…'
      : question
        ? 'Ask about this question…'
        : `Ask about ${session.topicNames.join(', ')}…`;

  return (
    <KeyboardAvoidingView className="flex-1 bg-bg" behavior="padding">
      <AiHeader persona="tutor" onBack={confirmEnd} showCounter />
      <OfflineBanner />

      {/* Modes switch mid-session (brief 6.3); Quiz is the default after setup. */}
      <View className="flex-row gap-2 border-b border-line px-4 py-2">
        {MODES.map((m) => (
          <Chip key={m.id} label={m.label} selected={session.mode === m.id} onPress={() => setMode(m.id)} />
        ))}
      </View>

      <ScrollView
        ref={scrollRef}
        className="flex-1"
        contentContainerClassName="gap-4 p-4"
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: true })}
      >
        {question ? (
          <>
            <View className="flex-row items-center justify-between">
              <Text variant="overline">
                Question {session.index + 1} of {session.questions.length}
              </Text>
            </View>
            <SourceChip question={question} />
            <QuestionCard
              question={question}
              selected={state?.selectedKey ?? null}
              reveal={answered && question.type === 'mcq'}
              onSelect={onSelect}
            />
          </>
        ) : (
          <Card tone="soft">
            <Text variant="h3">Explain mode: {session.topicNames.join(', ')}</Text>
            <Text variant="body" className="mt-1">
              Ask the GCE Tutor to teach you anything in this topic. Each reply uses one free AI reply.
            </Text>
          </Card>
        )}

        {thread.map((item) =>
          item.kind === 'skyline-solution' ? (
            <InlineSkylineSolution
              key={item.id}
              questionId={item.text}
              onNoSolution={() => {
                updateThread(threadKey, item.id, { kind: 'note', text: 'No Skyline solution yet. Asking the Tutor…' });
                void askAi('solution', 'Explain the full solution to this question.');
              }}
            />
          ) : (
            <ChatBubble key={item.id} item={item} />
          ),
        )}

        {question ? (
          <View className="gap-2">
            <View className="flex-row flex-wrap gap-2">
              <Button label="Hint" variant="secondary" size="sm" icon="bulb-outline" disabled={busy}
                onPress={() => void askAi('hint', 'Give me a hint for this question.', { show: 'Hint, please' })} />
              <Button label="Explain" variant="secondary" size="sm" icon="school-outline" disabled={busy}
                onPress={() => void askAi('explain', 'Explain the idea behind this question.', { show: 'Explain this, please' })} />
              <Button label="Show solution" variant="secondary" size="sm" icon="document-text-outline" onPress={showSolution} />
            </View>
            <View className="flex-row gap-2">
              <Button label="End session" variant="ghost" className="flex-1" onPress={confirmEnd} />
              {isLast ? (
                <Button label="Finish" className="flex-1" onPress={end} />
              ) : (
                <Button label="Next question" iconRight="arrow-forward" className="flex-1" onPress={() => goTo(session.index + 1)} />
              )}
            </View>
          </View>
        ) : (
          <Button label="End session" variant="ghost" onPress={confirmEnd} />
        )}
      </ScrollView>

      {image ? (
        <View className="flex-row items-center gap-2 px-4 pb-2">
          <Image source={{ uri: image.uri }} className="h-14 w-14 rounded-control" accessibilityLabel="Attached photo" />
          <Button label="Remove" variant="ghost" size="sm" onPress={() => setImage(null)} />
        </View>
      ) : null}

      <View className="flex-row items-end gap-2 border-t border-line bg-surface px-3 py-2">
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Add a photo of your working"
          onPress={pickImage}
          className="h-12 w-12 items-center justify-center rounded-full active:bg-surface-alt"
        >
          <Ionicons name="camera-outline" size={24} color={colors.brandDeep} />
        </Pressable>
        <TextInput
          value={draft}
          onChangeText={setDraft}
          placeholder={inputPlaceholder}
          placeholderTextColor={colors.muted}
          multiline
          accessibilityLabel="Message to the GCE Tutor"
          className="max-h-32 min-h-12 flex-1 rounded-control bg-surface-alt px-3 py-3 font-body text-body text-ink"
        />
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Send"
          disabled={busy}
          onPress={send}
          className={cn('h-12 w-12 items-center justify-center rounded-full bg-accent', busy && 'opacity-40')}
        >
          <Ionicons name="arrow-up" size={22} color="#14202A" />
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

/** "GCE 2024 · Paper 1 · Q3 · 1 mark" */
function SourceChip({ question }: { question: Question }) {
  const paper = usePaper(question.paperId);
  const marks = `${question.marks} ${question.marks === 1 ? 'mark' : 'marks'}`;
  const label = paper.data
    ? `GCE ${paper.data.year} · Paper ${paper.data.paperNumber} · Q${question.label} · ${marks}`
    : `Q${question.label} · ${marks}`;
  return <Badge label={label} tone="brand" />;
}

/** Skyline's own worked solution, shown first and labelled (brief 6.3). */
function InlineSkylineSolution({ questionId, onNoSolution }: { questionId: string; onNoSolution: () => void }) {
  const solution = useSolution(questionId);
  const entitlement = useSessionStore((s) => s.entitlement);
  const missing = !solution.isLoading && !solution.data;

  // No Skyline solution: hand over to an AI explanation (this item then turns into a note).
  useEffect(() => {
    if (missing) onNoSolution();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [missing]);

  if (solution.isLoading) return <Text variant="small">Loading the Skyline solution…</Text>;
  if (!solution.data) return null;
  const s = solution.data;
  return (
    <Card className="gap-3">
      <Badge label="Skyline solution" tone="brand" />
      <SolutionView
        solution={s}
        unlocked={s.tier === 'free' || hasFullAccess(entitlement)}
        onUnlock={() => router.push('/paywall')}
      />
    </Card>
  );
}
