import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import type { ReactNode } from 'react';
import { Platform, Pressable, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useThemeColors } from '@/theme/tokens';

import { Text } from './Text';

interface ScreenHeaderProps {
  title: string;
  subtitle?: string;
  right?: ReactNode;
  onBack?: () => void;
  /** The screen is presented as a modal sheet (implies a close icon). */
  modal?: boolean;
  /** Close icon instead of a back arrow on a regular screen (e.g. leaving a quiz). */
  closeIcon?: boolean;
}

/** Lightweight in-screen header for pushed routes (native headers are hidden app-wide). */
export function ScreenHeader({ title, subtitle, right, onBack, modal, closeIcon }: ScreenHeaderProps) {
  const showClose = modal || closeIcon;
  const insets = useSafeAreaInsets();
  const colors = useThemeColors();
  const goBack = onBack ?? (() => (router.canGoBack() ? router.back() : router.replace('/(tabs)')));

  return (
    <View
      className="flex-row items-center gap-2 border-b border-line bg-bg px-2 pb-2"
      // iOS modals are sheets below the status bar; Android modals are full screen.
      style={{ paddingTop: modal && Platform.OS === 'ios' ? 12 : insets.top + 4 }}
    >
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={showClose ? 'Close' : 'Back'}
        onPress={goBack}
        hitSlop={8}
        className="h-11 w-11 items-center justify-center rounded-full active:bg-surface-alt"
      >
        <Ionicons name={showClose ? 'close' : 'arrow-back'} size={22} color={colors.ink} />
      </Pressable>
      <View className="flex-1">
        <Text variant="bodyStrong" numberOfLines={1} accessibilityRole="header">
          {title}
        </Text>
        {subtitle ? (
          <Text variant="caption" numberOfLines={1}>
            {subtitle}
          </Text>
        ) : null}
      </View>
      {right ? <View className="pr-2">{right}</View> : null}
    </View>
  );
}
