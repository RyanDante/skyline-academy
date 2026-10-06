import { Ionicons } from '@expo/vector-icons';
import { View } from 'react-native';

import { useThemeColors } from '@/theme/tokens';
import type { Solution } from '@/types/models';

import { Button } from '../ui/Button';
import { Text } from '../ui/Text';
import { MathText } from './MathText';
import { TeacherCredit } from './TeacherCredit';

interface SolutionViewProps {
  solution: Solution;
  /** When false, only the first step is shown and the rest sits behind the Season Pass. */
  unlocked: boolean;
  onUnlock?: () => void;
}

/**
 * The "marked script": each step sits beside an orange marking-pen line, with examiner-style
 * mark annotations (✓ M1 …) in the text-safe deep orange.
 */
export function SolutionView({ solution, unlocked, onUnlock }: SolutionViewProps) {
  const colors = useThemeColors();
  const visibleSteps = unlocked ? solution.steps : solution.steps.slice(0, 1);
  const hiddenCount = solution.steps.length - visibleSteps.length;

  return (
    <View className="gap-5">
      <View className="gap-4 border-l-[3px] border-accent pl-4">
        {visibleSteps.map((step, index) => (
          <View key={index} className="gap-1.5">
            <MathText variant="body">{step.body}</MathText>
            {step.working ? (
              <MathText variant="lead" className="font-body-medium text-ink">
                {step.working}
              </MathText>
            ) : null}
            {step.markPoints.map((mark) => (
              <Text
                key={`${mark.code}-${mark.text}`}
                variant="label"
                className="italic text-accent-deep"
                accessibilityLabel={`Mark ${mark.code}: ${mark.text}`}
              >
                ✓ {mark.code} {mark.text}
              </Text>
            ))}
          </View>
        ))}
      </View>

      {hiddenCount > 0 ? (
        <View className="gap-3 rounded-card bg-surface-alt p-4">
          <View className="flex-row items-center gap-2">
            <Ionicons name="lock-closed-outline" size={18} color={colors.brandDeep} />
            <Text variant="bodyStrong">
              {hiddenCount} more {hiddenCount === 1 ? 'step' : 'steps'} with mark points
            </Text>
          </View>
          <Text variant="body" className="text-muted">
            See every step and how examiners award each mark with the Season Pass.
          </Text>
          {onUnlock ? <Button label="See Season Pass" onPress={onUnlock} /> : null}
        </View>
      ) : (
        <View className="gap-1 rounded-card bg-brand-soft p-4">
          <Text variant="overline" className="text-brand-deep">
            Answer
          </Text>
          <MathText variant="bodyStrong">{solution.finalAnswer}</MathText>
        </View>
      )}

      {solution.commonSlip && unlocked ? (
        <View className="flex-row gap-3 rounded-card bg-accent-soft p-4">
          <Ionicons name="warning-outline" size={20} color={colors.accentDeep} />
          <Text variant="body" className="flex-1 text-accent-deep">
            <Text variant="bodyStrong" className="text-accent-deep">
              Common slip:{' '}
            </Text>
            {solution.commonSlip}
          </Text>
        </View>
      ) : null}

      <TeacherCredit author={solution.author} />
    </View>
  );
}
