import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import type { ReactNode } from 'react';
import { Alert, Platform, Pressable, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { cn } from '@/lib/cn';
import { product } from '@/lib/config';
import { useSessionStore } from '@/stores/sessionStore';
import { useThemeColors } from '@/theme/tokens';

import { Text } from '../ui/Text';
import { AiAvatar, type AiPersona } from './AiAvatar';

const PERSONAS: Record<AiPersona, { name: string; subtitle: string }> = {
  tutor: { name: 'GCE Tutor', subtitle: 'Past-paper study' },
  skyler: { name: 'Skyler', subtitle: 'Concours Pathway Guide' },
};

/**
 * Every AI screen repeats the avatar, name and accent colour (design brief, section 9),
 * so students always know which guide they are with.
 */
export function AiHeader({
  persona,
  onBack,
  showCounter = false,
  right,
}: {
  persona: AiPersona;
  onBack?: () => void;
  /** Shows "N free left today" (tap to explain the limit). */
  showCounter?: boolean;
  right?: ReactNode;
}) {
  const insets = useSafeAreaInsets();
  const colors = useThemeColors();
  const left = useSessionStore((s) => s.tutorQuestionsLeftToday());
  const p = PERSONAS[persona];
  const goBack = onBack ?? (() => (router.canGoBack() ? router.back() : router.replace('/(tabs)/tutor')));

  return (
    <View
      className={cn(
        'flex-row items-center gap-3 border-b px-2 pb-3',
        persona === 'skyler' ? 'border-skyler/20 bg-skyler-soft' : 'border-line bg-bg',
      )}
      style={{ paddingTop: insets.top + (Platform.OS === 'ios' ? 4 : 8) }}
    >
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Back"
        onPress={goBack}
        hitSlop={8}
        className="h-12 w-12 items-center justify-center rounded-full active:bg-surface-alt"
      >
        <Ionicons name="arrow-back" size={22} color={colors.ink} />
      </Pressable>
      <AiAvatar persona={persona} size={40} />
      <View className="flex-1">
        <Text variant="h3" accessibilityRole="header" numberOfLines={1}>
          {p.name}
        </Text>
        <Text variant="caption" numberOfLines={1}>
          {p.subtitle}
        </Text>
      </View>
      {showCounter && Number.isFinite(left) ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`${left} free AI replies left today. Tap for details.`}
          onPress={() =>
            Alert.alert(
              'Free AI replies',
              `You get ${product.freeTutorQuestionsPerDay} free AI replies a day: each Hint, Explain, answer check or AI explanation uses one. Multiple-choice marking and Skyline solutions are always free. The count resets at midnight.`,
            )
          }
          className="min-h-12 justify-center rounded-full bg-brand-soft px-3"
        >
          <Text variant="caption" className="text-brand-deep">
            {left} free left today
          </Text>
        </Pressable>
      ) : null}
      {right}
    </View>
  );
}
