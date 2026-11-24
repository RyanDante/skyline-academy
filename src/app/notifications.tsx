import { Ionicons } from '@expo/vector-icons';
import { type Href, router } from 'expo-router';
import { useEffect, type ComponentProps } from 'react';
import { Pressable, View } from 'react-native';

import { EmptyState, Screen, ScreenHeader, Text } from '@/components/ui';
import { cn } from '@/lib/cn';
import { useSessionStore, type NotificationKind } from '@/stores/sessionStore';
import { useThemeColors } from '@/theme/tokens';

type IconName = ComponentProps<typeof Ionicons>['name'];

const ICONS: Record<NotificationKind, IconName> = {
  info: 'information-circle',
  streak: 'flame',
  payment: 'card',
  deadline: 'calendar',
  content: 'document-text',
};

function timeAgo(ts: number): string {
  const mins = Math.round((Date.now() - ts) / 60_000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins} min ago`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours} h ago`;
  return `${Math.round(hours / 24)} d ago`;
}

/** In-app notifications (from the web version's notification centre). */
export default function Notifications() {
  const colors = useThemeColors();
  const notifications = useSessionStore((s) => s.notifications);
  const markRead = useSessionStore((s) => s.markNotificationsRead);

  // Opening the list marks everything as read; unread ones stay highlighted this visit.
  useEffect(() => {
    return () => markRead();
  }, [markRead]);

  return (
    <Screen topBar={<ScreenHeader title="Notifications" />}>
      {notifications.length === 0 ? (
        <EmptyState icon="notifications-outline" title="You’re all caught up" body="Payments, streak milestones and new content show up here." />
      ) : (
        notifications.map((n) => (
          <Pressable
            key={n.id}
            accessibilityRole={n.route ? 'button' : undefined}
            disabled={!n.route}
            onPress={() => n.route && router.push(n.route as Href)}
            className={cn('flex-row gap-3 rounded-card border p-4', n.read ? 'border-line bg-surface' : 'border-brand/40 bg-brand-soft/50')}
          >
            <View className="h-10 w-10 items-center justify-center rounded-full bg-surface-alt">
              <Ionicons name={ICONS[n.kind]} size={22} color={n.kind === 'streak' || n.kind === 'payment' ? colors.accent : colors.brandDeep} />
            </View>
            <View className="flex-1 gap-0.5">
              <Text variant="h3">{n.title}</Text>
              <Text variant="body" className="text-muted">{n.body}</Text>
              <Text variant="caption">{timeAgo(n.createdAt)}</Text>
            </View>
          </Pressable>
        ))
      )}
    </Screen>
  );
}
