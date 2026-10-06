import { View } from 'react-native';
import Svg, { Line, Path } from 'react-native-svg';

import { cn } from '@/lib/cn';
import { palette } from '@/theme/tokens';

import { Text } from '../ui/Text';

/** Placeholder wordmark until the refreshed Skyline logo is supplied. */
export function Logo({ onDark = false, className }: { onDark?: boolean; className?: string }) {
  return (
    <View className={cn('flex-row items-center gap-2', className)} accessibilityLabel="Skyline Academy">
      <Svg width={28} height={22} viewBox="0 0 28 22">
        <Path
          d="M0 22 L0 14 L5 14 L5 8 L9 8 L9 12 L13 12 L13 2 L17 2 L17 10 L21 10 L21 6 L25 6 L25 14 L28 14 L28 22 Z"
          fill={onDark ? palette.white : palette.tealDeep}
        />
        <Line x1="0" y1="21" x2="28" y2="21" stroke={palette.orange} strokeWidth={2} />
      </Svg>
      <Text
        variant="label"
        className={cn('font-display tracking-[2px]', onDark ? 'text-white' : 'text-brand-deep')}
      >
        SKYLINE
      </Text>
    </View>
  );
}
