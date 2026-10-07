import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import type { ComponentProps, ReactNode } from 'react';
import { ActivityIndicator, Pressable, View, type PressableProps } from 'react-native';

import { cn } from '@/lib/cn';
import { palette, useThemeColors } from '@/theme/tokens';

import { Text } from './Text';

/**
 * Button roles from the design brief (section 4.4):
 * - primary: teal fill, white text (default).
 * - go: orange fill, dark text. One per screen, for the main "go" action (Send, Start session).
 * - skyler: indigo fill, white text. Skyler screens only.
 * - secondary: white with a teal border. ghost: teal text only. danger: destructive outline.
 * `brand` is kept as an alias of primary.
 */
type Variant = 'primary' | 'brand' | 'go' | 'skyler' | 'secondary' | 'ghost' | 'danger';
type Size = 'md' | 'lg' | 'sm';

const CONTAINER: Record<Variant, string> = {
  primary: 'bg-brand-deep active:bg-brand-pressed',
  brand: 'bg-brand-deep active:bg-brand-pressed',
  go: 'bg-accent active:bg-accent/85',
  skyler: 'bg-skyler active:bg-skyler/85',
  secondary: 'border-[1.5px] border-brand-deep bg-surface active:bg-brand-soft/40',
  ghost: 'bg-transparent active:bg-surface-alt',
  danger: 'border-[1.5px] border-danger bg-transparent active:bg-danger/10',
};

const LABEL: Record<Variant, string> = {
  primary: 'text-on-brand',
  brand: 'text-on-brand',
  go: 'text-on-accent',
  skyler: 'text-on-brand',
  secondary: 'text-brand-deep',
  ghost: 'text-brand-deep',
  danger: 'text-danger',
};

const SIZE: Record<Size, string> = {
  sm: 'min-h-12 px-3 rounded-control',
  md: 'h-[52px] px-4 rounded-control',
  lg: 'h-14 px-5 rounded-control',
};

export interface ButtonProps extends Omit<PressableProps, 'children'> {
  label: string;
  variant?: Variant;
  size?: Size;
  icon?: ComponentProps<typeof Ionicons>['name'];
  iconRight?: ComponentProps<typeof Ionicons>['name'];
  loading?: boolean;
  fullWidth?: boolean;
  className?: string;
  accessory?: ReactNode;
}

export function Button({
  label,
  variant = 'primary',
  size = 'md',
  icon,
  iconRight,
  loading,
  fullWidth,
  disabled,
  className,
  onPress,
  accessory,
  ...props
}: ButtonProps) {
  const colors = useThemeColors();
  const iconColor =
    variant === 'go'
      ? palette.black
      : variant === 'primary' || variant === 'brand' || variant === 'skyler'
        ? palette.white
        : variant === 'danger'
          ? colors.danger
          : colors.brandDeep;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: !!disabled, busy: !!loading }}
      disabled={disabled || loading}
      onPress={(e) => {
        void Haptics.selectionAsync();
        onPress?.(e);
      }}
      className={cn(
        // Press feedback from the brief: scale to 0.98.
        'flex-row items-center justify-center gap-2 active:scale-[0.98]',
        SIZE[size],
        CONTAINER[variant],
        fullWidth && 'w-full',
        (disabled || loading) && 'opacity-40',
        className,
      )}
      {...props}
    >
      {loading ? (
        <ActivityIndicator color={iconColor} />
      ) : (
        <>
          {icon ? <Ionicons name={icon} size={20} color={iconColor} /> : null}
          <Text
            variant={size === 'sm' ? 'label' : 'button'}
            className={cn(LABEL[variant], size === 'sm' && 'font-display-semibold')}
            numberOfLines={1}
          >
            {label}
          </Text>
          {iconRight ? <Ionicons name={iconRight} size={20} color={iconColor} /> : null}
          {accessory ? <View>{accessory}</View> : null}
        </>
      )}
    </Pressable>
  );
}
