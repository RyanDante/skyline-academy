import { View } from 'react-native';

import { cn } from '@/lib/cn';

import { Text } from './Text';

export type Difficulty = 1 | 2 | 3 | 4 | 5;

export function difficultyWord(level: Difficulty): string {
  if (level >= 5) return 'Very competitive';
  if (level >= 3) return 'Competitive';
  return 'Moderate';
}

/**
 * Five dots plus a word (design brief 4.7). Meaning is carried by the count and the word,
 * never by colour alone.
 */
export function DifficultyDots({
  level,
  tone = 'brand',
  className,
}: {
  level: Difficulty;
  tone?: 'brand' | 'skyler';
  className?: string;
}) {
  const on = tone === 'skyler' ? 'bg-skyler' : 'bg-brand-deep';
  const word = difficultyWord(level);
  return (
    <View
      className={cn('flex-row items-center gap-2', className)}
      accessible
      accessibilityLabel={`Difficulty ${level} of 5, ${word}`}
    >
      <View className="flex-row gap-1">
        {[1, 2, 3, 4, 5].map((i) => (
          <View
            key={i}
            className={cn(
              'h-2 w-2 rounded-full',
              i <= level ? on : 'border border-muted bg-transparent',
            )}
          />
        ))}
      </View>
      <Text variant="caption">{word}</Text>
    </View>
  );
}
