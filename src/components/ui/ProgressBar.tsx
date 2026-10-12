import { View } from 'react-native';

import { cn } from '@/lib/cn';

interface ProgressBarProps {
  /** 0..1 */
  value: number;
  tone?: 'accent' | 'brand' | 'skyler';
  /** Track colour; use "onDark" inside the teal hero. */
  track?: 'default' | 'onDark';
  className?: string;
  accessibilityLabel?: string;
}

export function ProgressBar({
  value,
  tone = 'accent',
  track = 'default',
  className,
  accessibilityLabel,
}: ProgressBarProps) {
  const pct = Math.round(Math.max(0, Math.min(1, value)) * 100);
  return (
    <View
      accessibilityRole="progressbar"
      accessibilityLabel={accessibilityLabel}
      accessibilityValue={{ min: 0, max: 100, now: pct }}
      className={cn(
        'h-2 overflow-hidden rounded-full',
        track === 'onDark' ? 'bg-brand' : 'bg-surface-alt',
        className,
      )}
    >
      <View
        className={cn(
          'h-full rounded-full',
          tone === 'accent' ? 'bg-accent' : tone === 'skyler' ? 'bg-skyler' : 'bg-brand-deep',
        )}
        style={{ width: `${pct}%` }}
      />
    </View>
  );
}
