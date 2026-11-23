import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Pressable, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { greetingFor } from '@/lib/dates';
import { useSessionStore } from '@/stores/sessionStore';
import { useThemeColors } from '@/theme/tokens';

import { Logo } from '../brand/Logo';
import { Badge } from '../ui/Badge';
import { Text } from '../ui/Text';

/** Home header (mockup 6): logo, avatar with greeting, notifications bell. */
export function HomeHeader({ sampleData }: { sampleData?: boolean }) {
  const insets = useSafeAreaInsets();
  const colors = useThemeColors();
  const name = useSessionStore((s) => s.profile?.firstName);
  const unread = useSessionStore((s) => s.notifications.some((n) => !n.read));
  const initials = (name ?? '').trim().slice(0, 2).toUpperCase() || '🙂';

  return (
    <View className="gap-4 px-4 pb-2" style={{ paddingTop: insets.top + 8 }}>
      <View className="flex-row items-center justify-between">
        <Logo size="sm" />
        <View className="flex-row items-center gap-2">
          {sampleData ? <Badge label="Sample data" tone="accent" /> : null}
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={unread ? 'Notifications, unread' : 'Notifications'}
            onPress={() => router.push('/notifications')}
            hitSlop={8}
            className="h-12 w-12 items-center justify-center rounded-full active:bg-surface-alt"
          >
            <Ionicons name="notifications-outline" size={26} color={colors.ink} />
            {unread ? <View className="absolute right-2.5 top-2.5 h-3 w-3 rounded-full border-2 border-bg bg-accent" /> : null}
          </Pressable>
        </View>
      </View>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Your profile"
        onPress={() => router.push('/(tabs)/me')}
        className="flex-row items-center gap-3"
      >
        <View className="h-14 w-14 items-center justify-center rounded-full bg-brand">
          <Text variant="h3" className="text-white">{initials}</Text>
        </View>
        <View className="flex-1">
          <Text variant="small">{greetingFor()},</Text>
          <Text variant="heading" numberOfLines={1}>{name ? `${name}!` : 'Welcome!'}</Text>
          <Text variant="caption" className="text-brand-deep">Keep going, you’re doing great!</Text>
        </View>
      </Pressable>
    </View>
  );
}
