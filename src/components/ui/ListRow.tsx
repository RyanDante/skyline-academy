import { Ionicons } from '@expo/vector-icons';
import type { ComponentProps, ReactNode } from 'react';
import { Pressable, View } from 'react-native';

import { cn } from '@/lib/cn';
import { useThemeColors } from '@/theme/tokens';

import { Text } from './Text';

interface ListRowProps {
  title: string;
  subtitle?: string;
  icon?: ComponentProps<typeof Ionicons>['name'];
  trailing?: ReactNode;
  onPress?: () => void;
  className?: string;
  destructive?: boolean;
}

export function ListRow({ title, subtitle, icon, trailing, onPress, className, destructive }: ListRowProps) {
  const colors = useThemeColors();
  return (
    <Pressable
      accessibilityRole={onPress ? 'button' : undefined}
      onPress={onPress}
      disabled={!onPress}
      className={cn('min-h-14 flex-row items-center gap-3 py-3 active:opacity-70', className)}
    >
      {icon ? (
        <View className="h-10 w-10 items-center justify-center rounded-control bg-brand-soft">
          <Ionicons name={icon} size={20} color={colors.brandDeep} />
        </View>
      ) : null}
      <View className="flex-1">
        <Text variant="bodyStrong" className={destructive ? 'text-danger' : undefined}>
          {title}
        </Text>
        {subtitle ? <Text variant="caption">{subtitle}</Text> : null}
      </View>
      {trailing ?? (onPress ? <Ionicons name="chevron-forward" size={18} color={colors.muted} /> : null)}
    </Pressable>
  );
}
