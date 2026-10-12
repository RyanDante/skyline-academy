import { Image } from 'expo-image';
import { useEffect, useState } from 'react';
import { View } from 'react-native';

import { cn } from '@/lib/cn';
import type { ThreadItem } from '@/stores/gceTutorStore';

import { renderInlineMath } from '../study/latex';
import { Badge } from '../ui/Badge';
import { Text } from '../ui/Text';

/** Three-dot typing indicator shown before an AI reply arrives (design brief, 4.6). */
function TypingDots() {
  const [step, setStep] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setStep((s) => (s + 1) % 4), 350);
    return () => clearInterval(id);
  }, []);
  return (
    <Text variant="body" accessibilityLabel="GCE Tutor is typing">
      {'•'.repeat(step || 1).padEnd(3, ' ')}
    </Text>
  );
}

export function ChatBubble({ item }: { item: ThreadItem }) {
  const mine = item.kind === 'student';

  if (item.kind === 'note') {
    return (
      <Text variant="small" className="self-center text-center" accessibilityLiveRegion="polite">
        {item.text}
      </Text>
    );
  }

  return (
    <View className={cn('max-w-[90%] gap-1.5', mine ? 'self-end' : 'self-start')}>
      {item.kind === 'ai-solution' ? (
        <Badge label="AI explanation: check with your teacher" tone="accent" />
      ) : null}
      <View
        className={cn(
          'rounded-card px-4 py-3',
          mine
            ? 'bg-brand-deep'
            : item.error
              ? 'bg-accent-soft'
              : 'border border-line bg-surface',
        )}
      >
        {item.imageUri ? (
          <Image
            source={{ uri: item.imageUri }}
            className="mb-2 h-40 w-56 rounded-control"
            accessibilityLabel="Your photo"
          />
        ) : null}
        {item.pending ? (
          <TypingDots />
        ) : (
          <Text
            variant="body"
            className={mine ? 'text-on-brand' : item.error ? 'text-accent-deep' : 'text-ink'}
          >
            {renderInlineMath(item.text)}
          </Text>
        )}
      </View>
    </View>
  );
}
