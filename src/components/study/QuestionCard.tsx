import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { Pressable, View } from 'react-native';

import { cn } from '@/lib/cn';
import { pluralize } from '@/lib/format';
import { useThemeColors } from '@/theme/tokens';
import type { OptionKey, Question } from '@/types/models';

import { Badge } from '../ui/Badge';
import { Text } from '../ui/Text';
import { MathText } from './MathText';

interface QuestionCardProps {
  question: Question;
  selected: OptionKey | null;
  onSelect?: (key: OptionKey) => void;
  /** After answering in practice mode, colour the correct and wrong choices. */
  reveal?: boolean;
  heading?: string;
}

export function QuestionCard({ question, selected, onSelect, reveal = false, heading }: QuestionCardProps) {
  const colors = useThemeColors();

  return (
    <View className="gap-4">
      <View className="flex-row items-center justify-between">
        <Text variant="overline">{heading ?? `Question ${question.label}`}</Text>
        <Badge label={pluralize(question.marks, 'mark')} tone="neutral" />
      </View>

      <MathText variant="lead">{question.stem}</MathText>

      {question.imageUrl ? (
        <Image
          source={{ uri: question.imageUrl }}
          contentFit="contain"
          className="h-48 w-full rounded-control bg-surface-alt"
          accessibilityLabel="Diagram for this question"
        />
      ) : null}

      {question.options ? (
        <View className="gap-2.5" accessibilityRole="radiogroup">
          {question.options.map((option) => {
            const isSelected = selected === option.key;
            const isCorrect = question.correctKey === option.key;
            const showCorrect = reveal && isCorrect;
            const showWrong = reveal && isSelected && !isCorrect;

            return (
              <Pressable
                key={option.key}
                accessibilityRole="radio"
                accessibilityState={{ checked: isSelected, disabled: reveal }}
                accessibilityLabel={`Option ${option.key}: ${option.text}`}
                disabled={reveal || !onSelect}
                onPress={() => onSelect?.(option.key)}
                className={cn(
                  'min-h-14 flex-row items-center gap-3 rounded-control border px-3 py-3',
                  showCorrect
                    ? 'border-success bg-success/10'
                    : showWrong
                      ? 'border-danger bg-danger/10'
                      : isSelected
                        ? 'border-brand-deep bg-brand-soft'
                        : 'border-line bg-surface active:bg-surface-alt',
                )}
              >
                <View
                  className={cn(
                    'h-8 w-8 items-center justify-center rounded-full border',
                    isSelected ? 'border-brand-deep bg-brand-deep' : 'border-line',
                  )}
                >
                  <Text variant="label" className={isSelected ? 'text-on-brand' : 'text-ink'}>
                    {option.key}
                  </Text>
                </View>
                <MathText variant="body" className="flex-1">
                  {option.text}
                </MathText>
                {showCorrect ? <Ionicons name="checkmark-circle" size={22} color={colors.success} /> : null}
                {showWrong ? <Ionicons name="close-circle" size={22} color={colors.accentDeep} /> : null}
              </Pressable>
            );
          })}
        </View>
      ) : null}
    </View>
  );
}
