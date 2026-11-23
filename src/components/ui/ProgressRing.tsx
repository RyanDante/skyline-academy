import { View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

import { useThemeColors } from '@/theme/tokens';

import { Text } from './Text';

/** Circular progress (Home "Overall Progress" mockup). `value` is 0..1, or null for "—". */
export function ProgressRing({ value, size = 56, stroke = 6 }: { value: number | null; size?: number; stroke?: number }) {
  const colors = useThemeColors();
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const v = value === null ? 0 : Math.max(0, Math.min(1, value));
  return (
    <View
      style={{ width: size, height: size }}
      className="items-center justify-center"
      accessibilityRole="progressbar"
      accessibilityValue={{ min: 0, max: 100, now: Math.round(v * 100) }}
    >
      <Svg width={size} height={size} style={{ position: 'absolute', transform: [{ rotate: '-90deg' }] }}>
        <Circle cx={size / 2} cy={size / 2} r={r} stroke={colors.line} strokeWidth={stroke} fill="none" />
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke={colors.brand}
          strokeWidth={stroke}
          fill="none"
          strokeDasharray={`${c} ${c}`}
          strokeDashoffset={c * (1 - v)}
          strokeLinecap="round"
        />
      </Svg>
      <Text variant="label" className="font-body-semibold">
        {value === null ? '—' : `${Math.round(v * 100)}%`}
      </Text>
    </View>
  );
}
