import { Pressable } from 'react-native';

import { cn } from '@/lib/cn';

import { Text } from './Text';

interface ChipProps {
  label: string;
  selected?: boolean;
  onPress?: () => void;
  className?: string;
}

/** Selectable pill for filters and setup choices. */
export function Chip({ label, selected, onPress, className }: ChipProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected: !!selected }}
      onPress={onPress}
      className={cn(
        'h-10 flex-row items-center rounded-full border px-4',
        selected ? 'border-brand-deep bg-brand-deep' : 'border-line bg-surface active:bg-surface-alt',
        className,
      )}
    >
      <Text variant="label" className={selected ? 'text-on-brand' : 'text-ink'}>
        {label}
      </Text>
    </Pressable>
  );
}
