import type { ReactNode } from 'react';
import { Pressable, View, type ViewProps } from 'react-native';

import { cn } from '@/lib/cn';

type Tone = 'default' | 'alt' | 'highlight' | 'soft' | 'warning';

const TONES: Record<Tone, string> = {
  default: 'bg-surface border border-line',
  alt: 'bg-surface-alt',
  highlight: 'bg-surface border-2 border-accent',
  soft: 'bg-brand-soft',
  warning: 'bg-accent-soft',
};

interface CardProps extends ViewProps {
  tone?: Tone;
  onPress?: () => void;
  accessibilityLabel?: string;
  className?: string;
  children: ReactNode;
}

export function Card({ tone = 'default', onPress, className, children, ...props }: CardProps) {
  const classes = cn('rounded-card p-4', TONES[tone], className);

  if (onPress) {
    return (
      <Pressable
        accessibilityRole="button"
        onPress={onPress}
        className={cn(classes, 'active:opacity-80')}
        {...props}
      >
        {children}
      </Pressable>
    );
  }
  return (
    <View className={classes} {...props}>
      {children}
    </View>
  );
}
