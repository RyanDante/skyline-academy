import { router } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Pressable, View } from 'react-native';

import { AiAvatar } from '@/components/tutor/AiAvatar';
import { AiHeader } from '@/components/tutor/AiHeader';
import { ProgressBar, Screen, Text } from '@/components/ui';
import { skylerQuestions } from '@/data/skyler';
import { cn } from '@/lib/cn';
import { useSkylerStore } from '@/stores/skylerStore';
import { useThemeColors } from '@/theme/tokens';
import type { OptionKey } from '@/types/models';

const ADVANCE_MS = 300;
const THINKING_MS = 1500;

/** Skyler's quiz (brief 7.3): one question per screen, auto-advance, Back always available. */
export default function SkylerQuiz() {
  const { answers, index, answer, back, complete } = useSkylerStore();
  const colors = useThemeColors();
  const [picked, setPicked] = useState<OptionKey | null>(null);
  const [thinking, setThinking] = useState(false);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  const question = skylerQuestions[index]!;
  const total = skylerQuestions.length;
  const isLast = index === total - 1;
  const current = picked ?? answers[index];

  const choose = (key: OptionKey) => {
    if (picked || thinking) return;
    setPicked(key);
    timers.current.push(
      setTimeout(() => {
        answer(key); // saved immediately, so a closed app resumes here
        setPicked(null);
        if (isLast) {
          setThinking(true);
          timers.current.push(
            setTimeout(() => {
              complete();
              router.replace('/skyler/result');
            }, THINKING_MS),
          );
        }
      }, ADVANCE_MS),
    );
  };

  const goBack = () => (index === 0 ? router.back() : back());

  if (thinking) {
    return (
      <View className="flex-1 items-center justify-center gap-4 bg-skyler-soft px-6">
        <AiAvatar persona="skyler" size={96} />
        <Text variant="heading" className="text-center" accessibilityLiveRegion="polite">
          Skyler is thinking…
        </Text>
        <ActivityIndicator color={colors.skyler} />
      </View>
    );
  }

  return (
    <Screen topBar={<AiHeader persona="skyler" onBack={goBack} />}>
      <View className="gap-2">
        <ProgressBar value={(index + 1) / total} tone="skyler" accessibilityLabel="Quiz progress" />
        <Text variant="caption">
          {index + 1} of {total}
        </Text>
      </View>

      <Text variant="heading" accessibilityRole="header">
        {question.text}
      </Text>

      <View className="gap-3" accessibilityRole="radiogroup">
        {question.options.map((o) => {
          const selected = current === o.key;
          return (
            <Pressable
              key={o.key}
              accessibilityRole="radio"
              accessibilityState={{ checked: selected }}
              accessibilityLabel={`${o.key}. ${o.text}`}
              onPress={() => choose(o.key)}
              className={cn(
                'min-h-14 flex-row items-center gap-3 rounded-card border px-4 py-3',
                selected ? 'border-2 border-skyler bg-skyler-soft' : 'border-line bg-surface active:bg-skyler-soft',
              )}
            >
              <View
                className={cn(
                  'h-8 w-8 items-center justify-center rounded-full border',
                  selected ? 'border-skyler bg-skyler' : 'border-line',
                )}
              >
                <Text variant="label" className={selected ? 'text-on-brand' : 'text-ink'}>
                  {o.key}
                </Text>
              </View>
              <Text variant="body" className="flex-1">
                {o.text}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </Screen>
  );
}
