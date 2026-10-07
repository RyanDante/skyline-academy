import { Pressable } from 'react-native';

import { cn } from '@/lib/cn';

import { Text } from './Text';

interface ChipProps {
  label: string;
  selected?: boolean;
  onPress?: () => void;
  /** Selected colour: teal by default, indigo on Skyler screens. */
  tone?: 'brand' | 'skyler';
  disabled?: boolean;
  className?: string;
}

/** Selectable pill for filters and setup choices. 48 dp minimum tap target. */
export function Chip({ label, selected, onPress, tone = 'brand', disabled, className }: ChipProps) {
  const selectedBox =
    tone === 'skyler' ? 'border-skyler bg-skyler' : 'border-brand-deep bg-brand-deep';
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected: !!selected, disabled: !!disabled }}
      disabled={disabled}
      onPress={onPress}
      className={cn(
        'min-h-12 flex-row items-center rounded-full border px-4',
        selected ? selectedBox : 'border-line bg-surface active:bg-surface-alt',
        disabled && 'opacity-40',
        className,
      )}
    >
      <Text variant="label" className={selected ? 'text-on-brand' : 'text-ink'}>
        {label}
      </Text>
    </Pressable>
  );
}
