import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

import { REMINDER_TIMES, type AppSettings } from '@/stores/sessionStore';

/**
 * Local study reminders (replaces the web version's browser alerts). Scheduled on the device,
 * so they work offline and need no server.
 */

const CHANNEL_ID = 'study-reminders';

const MESSAGES = [
  { title: 'Time to study 📚', body: 'A few questions keep your streak alive. Tap to practise.' },
  { title: 'Your GCE is getting closer', body: 'Answer today’s questions and fix one weak topic.' },
];

let handlerSet = false;

function ensureHandler() {
  if (handlerSet) return;
  handlerSet = true;
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });
}

/** Asks for permission if needed. Returns true when reminders can be shown. */
export async function ensureReminderPermission(): Promise<boolean> {
  ensureHandler();
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync(CHANNEL_ID, {
      name: 'Study reminders',
      importance: Notifications.AndroidImportance.DEFAULT,
    });
  }
  const current = await Notifications.getPermissionsAsync();
  if (current.granted) return true;
  const asked = await Notifications.requestPermissionsAsync();
  return asked.granted;
}

/** Re-schedules reminders to match settings. Safe to call on every settings change. */
export async function syncReminders(settings: AppSettings['reminders']): Promise<void> {
  ensureHandler();
  await Notifications.cancelAllScheduledNotificationsAsync();
  if (!settings.enabled) return;

  const { hour, minute } = REMINDER_TIMES[settings.slot];
  const message = MESSAGES[0]!;

  if (settings.frequency === 'daily') {
    await Notifications.scheduleNotificationAsync({
      content: { ...message, data: { route: '/(tabs)' } },
      trigger: { type: Notifications.SchedulableTriggerInputTypes.DAILY, hour, minute, channelId: CHANNEL_ID },
    });
    return;
  }
  // Weekdays: Monday (2) to Friday (6); 1 = Sunday.
  for (const weekday of [2, 3, 4, 5, 6]) {
    await Notifications.scheduleNotificationAsync({
      content: { ...MESSAGES[weekday % MESSAGES.length]!, data: { route: '/(tabs)' } },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.WEEKLY,
        weekday,
        hour,
        minute,
        channelId: CHANNEL_ID,
      },
    });
  }
}
