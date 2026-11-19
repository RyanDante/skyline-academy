import { useEffect, useCallback } from 'react';
import { useAppStore } from '@/stores/appStore';

export function useDailyReminder() {
  const {
    settings,
    updateNotificationSettings,
    triggerStudyReminder,
  } = useAppStore();

  const { notifications } = settings;

  // Request browser notification permission
  const requestBrowserPermission = useCallback(async () => {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      updateNotificationSettings({ browserPermission: 'unsupported' });
      return 'unsupported';
    }

    try {
      const permission = await Notification.requestPermission();
      updateNotificationSettings({ browserPermission: permission });
      return permission;
    } catch {
      return 'denied';
    }
  }, [updateNotificationSettings]);

  // Periodic check for preferred reminder time
  useEffect(() => {
    if (!notifications.enabled) return;

    const checkTimeAndRemind = () => {
      const now = new Date();
      const currentHours = String(now.getHours()).padStart(2, '0');
      const currentMinutes = String(now.getMinutes()).padStart(2, '0');
      const currentTimeStr = `${currentHours}:${currentMinutes}`;

      // Check weekdays if configured
      if (notifications.reminderDays === 'weekdays') {
        const dayOfWeek = now.getDay();
        if (dayOfWeek === 0 || dayOfWeek === 6) return; // Weekend
      }

      if (currentTimeStr === notifications.reminderTime) {
        triggerStudyReminder(false);
      }
    };

    // Check immediately and on interval
    checkTimeAndRemind();
    const interval = setInterval(checkTimeAndRemind, 30000); // Check every 30s
    return () => clearInterval(interval);
  }, [
    notifications.enabled,
    notifications.reminderTime,
    notifications.reminderDays,
    triggerStudyReminder,
  ]);

  return {
    notifications,
    requestBrowserPermission,
    sendTestNotification: () => triggerStudyReminder(true),
  };
}
