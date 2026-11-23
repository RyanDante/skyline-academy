import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Pressable, View } from 'react-native';

import { palette } from '@/theme/tokens';

import { Text } from '../ui/Text';

interface ContinueCardProps {
  title: string;
  line1: string;
  line2?: string;
  actionLabel: string;
  onPress: () => void;
}

/** "Continue your preparation" gradient card (mockup 6). */
export function ContinueCard({ title, line1, line2, actionLabel, onPress }: ContinueCardProps) {
  return (
    <LinearGradient
      colors={[palette.teal, '#3CCFC6']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={{ borderRadius: 20, overflow: 'hidden' }}
    >
      <View className="flex-row items-center p-5">
        <View className="flex-1 gap-1">
          <Text variant="heading" className="text-white">{title}</Text>
          <Text variant="bodyStrong" className="text-white">{line1}</Text>
          {line2 ? <Text variant="body" className="text-white/90">{line2}</Text> : null}
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={actionLabel}
            onPress={onPress}
            className="mt-3 min-h-12 self-start justify-center rounded-full bg-white px-7 active:opacity-80"
          >
            <Text variant="button" className="text-brand-deep">{actionLabel}</Text>
          </Pressable>
        </View>
        <View className="h-24 w-24 items-center justify-center rounded-full bg-white/20" accessibilityElementsHidden>
          <Ionicons name="library" size={48} color={palette.white} />
        </View>
      </View>
    </LinearGradient>
  );
}
