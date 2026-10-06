import { useEffect } from 'react';
import { View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

import { cn } from '@/lib/cn';

/** Pulsing placeholder. Prefer skeletons over spinners so screens never look blank on slow data. */
export function Skeleton({ className }: { className?: string }) {
  const opacity = useSharedValue(0.5);

  useEffect(() => {
    opacity.value = withRepeat(withTiming(1, { duration: 800 }), -1, true);
  }, [opacity]);

  const style = useAnimatedStyle(() => ({ opacity: opacity.value }));

  return (
    <Animated.View style={style}>
      <View className={cn('rounded-control bg-surface-alt', className)} />
    </Animated.View>
  );
}

export function SkeletonList({ rows = 4 }: { rows?: number }) {
  return (
    <View className="gap-3" accessibilityLabel="Loading">
      {Array.from({ length: rows }, (_, i) => (
        <Skeleton key={i} className="h-20 w-full rounded-card" />
      ))}
    </View>
  );
}
