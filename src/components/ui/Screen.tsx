import type { ReactNode } from 'react';
import { KeyboardAvoidingView, RefreshControl, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { cn } from '@/lib/cn';
import { useThemeColors } from '@/theme/tokens';

import { OfflineBanner } from './OfflineBanner';

interface ScreenProps {
  children: ReactNode;
  /** Scrollable by default; pass false for screens that manage their own list. */
  scroll?: boolean;
  /** Fixed bar above the content (e.g. <ScreenHeader />). It handles the safe area itself. */
  topBar?: ReactNode;
  /** Full-bleed content that scrolls with the body (e.g. a hero). It handles the safe area itself. */
  hero?: ReactNode;
  /** Pinned action area at the bottom (e.g. a primary button). */
  footer?: ReactNode;
  onRefresh?: () => void;
  refreshing?: boolean;
  contentClassName?: string;
}

export function Screen({
  children,
  scroll = true,
  topBar,
  hero,
  footer,
  onRefresh,
  refreshing = false,
  contentClassName,
}: ScreenProps) {
  const insets = useSafeAreaInsets();
  const colors = useThemeColors();
  const topPad = topBar || hero ? 0 : insets.top;

  const body = <View className={cn('gap-4 px-4 pb-8 pt-4', contentClassName)}>{children}</View>;

  return (
    <View className="flex-1 bg-bg" style={{ paddingTop: topPad }}>
      {topBar}
      <OfflineBanner />
      {/*
        Apps are edge-to-edge (Expo SDK 57), so Android no longer resizes the window for the
        keyboard. Padding on both platforms lifts the inputs and the pinned footer above it.
      */}
      <KeyboardAvoidingView className="flex-1" behavior="padding">
        {scroll ? (
          <ScrollView
            className="flex-1"
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="on-drag"
            refreshControl={
              onRefresh ? (
                <RefreshControl
                  refreshing={refreshing}
                  onRefresh={onRefresh}
                  tintColor={colors.brand}
                />
              ) : undefined
            }
          >
            {hero}
            {body}
          </ScrollView>
        ) : (
          <View className="flex-1">
            {hero}
            {body}
          </View>
        )}
        {footer ? (
          <View
            className="border-t border-line bg-surface px-4 pt-3"
            style={{ paddingBottom: Math.max(insets.bottom, 12) }}
          >
            {footer}
          </View>
        ) : null}
      </KeyboardAvoidingView>
    </View>
  );
}
