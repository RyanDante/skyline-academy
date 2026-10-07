import { View } from 'react-native';

import { cn } from '@/lib/cn';

import { Text } from './Text';

type Tone = 'brand' | 'accent' | 'success' | 'danger' | 'neutral';

const TONES: Record<Tone, { box: string; text: string }> = {
  brand: { box: 'bg-brand-soft', text: 'text-brand-deep' },
  accent: { box: 'bg-accent-soft', text: 'text-accent-deep' },
  success: { box: 'bg-success/15', text: 'text-success' },
  danger: { box: 'bg-danger/10', text: 'text-danger' },
  neutral: { box: 'bg-surface-alt', text: 'text-muted' },
};

export function Badge({
  label,
  tone = 'brand',
  className,
}: {
  label: string;
  tone?: Tone;
  className?: string;
}) {
  return (
    <View className={cn('self-start rounded-full px-2.5 py-1', TONES[tone].box, className)}>
      <Text variant="caption" className={cn('font-body-semibold', TONES[tone].text)}>
        {label}
      </Text>
    </View>
  );
}
