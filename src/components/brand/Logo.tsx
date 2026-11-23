import { View } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';

import { cn } from '@/lib/cn';
import { palette } from '@/theme/tokens';

import { Text } from '../ui/Text';

/** The mountain-and-sun mark from the design mockups. */
export function LogoMark({ size = 44, onDark = false }: { size?: number; onDark?: boolean }) {
  const back = onDark ? 'rgba(255,255,255,0.65)' : '#5FD3CB';
  const front = onDark ? '#FFFFFF' : palette.teal;
  const ridge = onDark ? 'rgba(255,255,255,0.85)' : palette.tealDeep;
  return (
    <Svg width={size} height={size * 0.72} viewBox="0 0 100 72" accessibilityElementsHidden>
      <Circle cx="58" cy="26" r="20" fill={palette.sun} />
      <Path d="M0 72 L30 30 L46 50 L58 36 L82 72 Z" fill={back} />
      <Path d="M18 72 L52 18 L86 72 Z" fill={front} />
      <Path d="M52 18 L60 31 L54 29 L49 36 L45 31 Z" fill={ridge} />
      <Path d="M62 72 L80 46 L100 72 Z" fill={back} />
    </Svg>
  );
}

interface LogoProps {
  /** White text and mark, for teal backgrounds (splash, welcome). */
  onDark?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const SIZES = {
  sm: { mark: 34, word: 'text-[15px] leading-[16px]', sub: 'text-[15px] leading-[16px]' },
  md: { mark: 46, word: 'text-[22px] leading-[22px]', sub: 'text-[22px] leading-[22px]' },
  lg: { mark: 88, word: 'text-[36px] leading-[38px]', sub: 'text-[16px] leading-[20px] tracking-[6px]' },
} as const;

/** SKYLINE (teal) / ACADEMY (orange), stacked next to the mark. "lg" stacks under it, for splash. */
export function Logo({ onDark = false, size = 'md', className }: LogoProps) {
  const s = SIZES[size];
  const word = onDark ? 'text-white' : 'text-brand';
  const sub = onDark ? 'text-white' : 'text-accent';

  if (size === 'lg') {
    return (
      <View className={cn('items-center gap-2', className)} accessibilityLabel="Skyline Academy" accessible>
        <LogoMark size={s.mark} onDark={onDark} />
        <Text className={cn('font-display', s.word, word)}>SKYLINE</Text>
        <Text className={cn('font-display-semibold', s.sub, onDark ? 'text-white' : 'text-ink')}>ACADEMY</Text>
      </View>
    );
  }
  return (
    <View className={cn('flex-row items-center gap-2', className)} accessibilityLabel="Skyline Academy" accessible>
      <LogoMark size={s.mark} onDark={onDark} />
      <View>
        <Text className={cn('font-display', s.word, word)}>SKYLINE</Text>
        <Text className={cn('font-display', s.sub, sub)}>ACADEMY</Text>
      </View>
    </View>
  );
}
