import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { router, useLocalSearchParams } from 'expo-router';
import { useRef, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { renderInlineMath } from '@/components/study/latex';
import { Button, Chip, OfflineBanner, Text } from '@/components/ui';
import { useNetwork } from '@/hooks/useNetwork';
import { useQuestion } from '@/hooks/queries';
import { useRequireAccount } from '@/hooks/useRequireAccount';
import { cn } from '@/lib/cn';
import { createId } from '@/lib/id';
import { leadsService } from '@/services/leads';
import { tutorService } from '@/services/tutor';
import { useSessionStore } from '@/stores/sessionStore';
import { useTutorStore, type TutorMessage } from '@/stores/tutorStore';
import { useThemeColors } from '@/theme/tokens';

const STARTERS = ['Explain a topic', 'Solve with me', 'Quiz me', 'Make me a revision plan'];
/** Only the last few turns go to the server: enough context, small payload on slow data. */
const HISTORY_TURNS = 8;

export default function Tutor() {
  const { questionId } = useLocalSearchParams<{ questionId?: string }>();
  const linkedQuestion = useQuestion(questionId);
  const insets = useSafeAreaInsets();
  const colors = useThemeColors();
  const { isOffline } = useNetwork();
  const requireAccount = useRequireAccount();

  const { messages, mode, add, update, setMode } = useTutorStore();
  const profile = useSessionStore((s) => s.profile);
  const left = useSessionStore((s) => s.tutorQuestionsLeftToday());
  const recordQuestion = useSessionStore((s) => s.recordTutorQuestion);

  const [draft, setDraft] = useState('');
  const [image, setImage] = useState<{ uri: string; base64: string } | null>(null);
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<ScrollView>(null);

  // Prefill once per linked question ("Ask the Tutor about this" from a solution).
  // Adjusting state during render is React's recommended alternative to an effect here.
  const [prefilledFor, setPrefilledFor] = useState<string | undefined>();
  if (questionId && linkedQuestion.data && prefilledFor !== questionId) {
    setPrefilledFor(questionId);
    setDraft(`Help me understand this question: ${renderInlineMath(linkedQuestion.data.stem)}`);
  }

  const pickImage = () => {
    const options = { mediaTypes: ['images'] as ImagePicker.MediaType[], allowsEditing: true, quality: 0.5, base64: true };
    const handle = (result: ImagePicker.ImagePickerResult) => {
      const asset = result.canceled ? null : result.assets[0];
      if (asset?.base64) setImage({ uri: asset.uri, base64: asset.base64 });
    };
    Alert.alert('Add a photo of your question', undefined, [
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

  const send = async (text = draft) => {
    const message = text.trim();
    if ((!message && !image) || sending) return;
    if (!requireAccount('tutor')) return;
    if (left <= 0) {
      router.push('/paywall');
      return;
    }

    const history = messages
      .filter((m) => !m.pending && !m.error)
      .slice(-HISTORY_TURNS)
      .map((m) => ({ role: m.role, text: m.text }));

    const userMsg: TutorMessage = { id: createId(), role: 'user', text: message || 'Help me with this question.', imageUri: image?.uri };
    const replyId = createId();
    add(userMsg);
    add({ id: replyId, role: 'assistant', text: '', pending: true });
    setDraft('');
    const imageBase64 = image?.base64;
    setImage(null);
    setSending(true);

    try {
      const res = await tutorService.ask({
        message: userMsg.text,
        history,
        mode,
        level: profile?.level,
        imageBase64,
      });
      recordQuestion();
      update(replyId, {
        text: res.reply,
        pending: false,
        relatedQuestionIds: res.relatedQuestionIds,
        suggestTeacher: res.suggestTeacher,
      });
    } catch (e) {
      // The server is the source of truth for the daily limit (e.g. after reinstalling the app).
      if (String((e as { code?: string })?.code ?? '').includes('resource-exhausted')) {
        update(replyId, {
          pending: false,
          error: true,
          text: "You've used today's free Tutor questions. They reset at midnight, or unlock more with the Season Pass.",
        });
        router.push('/paywall');
        return;
      }
      update(replyId, {
        pending: false,
        error: true,
        text: isOffline
          ? "You're offline. The Tutor needs a connection; your downloaded papers and solutions still work."
          : "The Tutor couldn't answer just now. Try again in a moment.",
      });
    } finally {
      setSending(false);
    }
  };

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-bg"
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={{ paddingTop: insets.top }}
    >
      <OfflineBanner />
      <View className="gap-3 border-b border-line px-4 pb-3 pt-2">
        <View className="flex-row items-center justify-between">
          <Text variant="title" accessibilityRole="header">
            Skyline Tutor
          </Text>
          {Number.isFinite(left) ? (
            <Text variant="caption">{left} free left today</Text>
          ) : null}
        </View>
        <View className="flex-row gap-2">
          <Chip label="Explain" selected={mode === 'explain'} onPress={() => setMode('explain')} />
          <Chip label="Solve with me" selected={mode === 'solve-with-me'} onPress={() => setMode('solve-with-me')} />
        </View>
      </View>

      <ScrollView
        ref={scrollRef}
        className="flex-1"
        contentContainerClassName="gap-3 p-4"
        onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: true })}
        keyboardShouldPersistTaps="handled"
      >
        {messages.length === 0 ? (
          <View className="gap-4 pt-6">
            <Text variant="heading">What are you working on?</Text>
            <Text variant="body" className="text-muted">
              Ask about any GCE topic, or snap a photo of a question. The Tutor teaches step by step and shows
              Skyline’s own solutions when a past question matches.
            </Text>
            <View className="flex-row flex-wrap gap-2">
              {STARTERS.map((s) => (
                <Chip
                  key={s}
                  label={s}
                  onPress={() => {
                    if (s === 'Solve with me') setMode('solve-with-me');
                    setDraft(`${s}: `);
                  }}
                />
              ))}
            </View>
          </View>
        ) : (
          messages.map((m, i) => (
            <Bubble
              key={m.id}
              message={m}
              studentName={profile?.firstName ?? 'a student'}
              studentQuestion={messages.slice(0, i).reverse().find((x) => x.role === 'user')?.text ?? ''}
            />
          ))
        )}
      </ScrollView>

      {image ? (
        <View className="flex-row items-center gap-2 px-4 pb-2">
          <Image source={{ uri: image.uri }} className="h-14 w-14 rounded-control" accessibilityLabel="Attached photo" />
          <Button label="Remove" variant="ghost" size="sm" onPress={() => setImage(null)} />
        </View>
      ) : null}

      <View
        className="flex-row items-end gap-2 border-t border-line bg-surface px-3 pt-2"
        style={{ paddingBottom: 8 }}
      >
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Add a photo of a question"
          onPress={pickImage}
          className="h-12 w-12 items-center justify-center rounded-full active:bg-surface-alt"
        >
          <Ionicons name="camera-outline" size={24} color={colors.brandDeep} />
        </Pressable>
        <TextInput
          value={draft}
          onChangeText={setDraft}
          placeholder="Ask a question…"
          placeholderTextColor={colors.muted}
          multiline
          accessibilityLabel="Your question"
          className="max-h-32 min-h-12 flex-1 rounded-control bg-surface-alt px-3 py-3 font-body text-body text-ink"
        />
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Send"
          disabled={sending}
          onPress={() => void send()}
          className={cn('h-12 w-12 items-center justify-center rounded-full bg-accent', sending && 'opacity-50')}
        >
          <Ionicons name="arrow-up" size={22} color="#111111" />
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

function Bubble({
  message,
  studentName,
  studentQuestion,
}: {
  message: TutorMessage;
  studentName: string;
  studentQuestion: string;
}) {
  const mine = message.role === 'user';
  return (
    <View className={cn('max-w-[88%] gap-2', mine ? 'self-end' : 'self-start')}>
      <View
        className={cn(
          'rounded-card px-4 py-3',
          mine ? 'bg-brand-deep' : message.error ? 'bg-accent-soft' : 'border border-line bg-surface',
        )}
      >
        {message.imageUri ? (
          <Image source={{ uri: message.imageUri }} className="mb-2 h-40 w-56 rounded-control" accessibilityLabel="Your photo" />
        ) : null}
        <Text variant="body" className={mine ? 'text-on-brand' : message.error ? 'text-accent-deep' : 'text-ink'}>
          {message.pending ? 'Thinking…' : renderInlineMath(message.text)}
        </Text>
      </View>
      {message.relatedQuestionIds?.length ? (
        <View className="flex-row flex-wrap gap-2">
          {message.relatedQuestionIds.map((id, i) => (
            <Chip
              key={id}
              label={`Skyline solution ${i + 1}`}
              onPress={() => router.push({ pathname: '/solution/[questionId]', params: { questionId: id } })}
            />
          ))}
        </View>
      ) : null}
      {message.suggestTeacher ? (
        <Button
          label="Ask a Skyline teacher"
          variant="secondary"
          size="sm"
          icon="logo-whatsapp"
          className="self-start"
          onPress={() => void leadsService.askTeacher(studentName, studentQuestion.slice(0, 300))}
        />
      ) : null}
    </View>
  );
}
