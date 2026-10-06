import { Pressable, View } from 'react-native';

import { Text } from './Text';

interface SectionHeaderProps {
  title: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function SectionHeader({ title, actionLabel, onAction }: SectionHeaderProps) {
  return (
    <View className="mt-2 flex-row items-center justify-between">
      <Text variant="heading" accessibilityRole="header">
        {title}
      </Text>
      {actionLabel && onAction ? (
        <Pressable accessibilityRole="link" onPress={onAction} hitSlop={12}>
          <Text variant="label" className="text-brand-deep">
            {actionLabel}
          </Text>
        </Pressable>
      ) : null}
    </View>
  );
}
