import { Ionicons } from '@expo/vector-icons';
import type { ComponentProps } from 'react';
import { View } from 'react-native';

import { useThemeColors } from '@/theme/tokens';

import { Button } from './Button';
import { Text } from './Text';

interface EmptyStateProps {
  icon: ComponentProps<typeof Ionicons>['name'];
  title: string;
  body: string;
  actionLabel?: string;
  onAction?: () => void;
}

/** An invitation, not an apology: say what this space is for and what to do next. */
export function EmptyState({ icon, title, body, actionLabel, onAction }: EmptyStateProps) {
  const colors = useThemeColors();
  return (
    <View className="items-center gap-3 px-6 py-10">
      <View className="h-14 w-14 items-center justify-center rounded-full bg-brand-soft">
        <Ionicons name={icon} size={26} color={colors.brandDeep} />
      </View>
      <Text variant="heading" className="text-center">
        {title}
      </Text>
      <Text variant="body" className="text-center text-muted">
        {body}
      </Text>
      {actionLabel && onAction ? (
        <Button label={actionLabel} variant="secondary" onPress={onAction} className="mt-2" />
      ) : null}
    </View>
  );
}

export function ErrorState({ onRetry, message }: { onRetry?: () => void; message?: string }) {
  return (
    <EmptyState
      icon="cloud-offline-outline"
      title="Couldn't load this"
      body={
        message ??
        'Check your connection and try again. Anything you downloaded still works offline.'
      }
      actionLabel={onRetry ? 'Try again' : undefined}
      onAction={onRetry}
    />
  );
}
