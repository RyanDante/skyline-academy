import React, { useState } from 'react';
import { useAppStore } from '@/stores/appStore';
import { useDailyReminder } from '@/hooks/useDailyReminder';
import {
  Bell,
  Clock,
  Volume2,
  VolumeX,
  Send,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Calendar,
  Flame,
  Check,
} from 'lucide-react';

export const DailyGoalNotificationCard: React.FC = () => {
  const {
    settings,
    updateNotificationSettings,
    attempts,
  } = useAppStore();

  const { notifications, requestBrowserPermission, sendTestNotification } = useDailyReminder();
  const [testSent, setTestSent] = useState(false);
  const [permissionMsg, setPermissionMsg] = useState<string | null>(null);

  // Compute today's attempts count
  const now = new Date();
  const todayKey = `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}`;
  const todayAttempts = attempts.filter((att) => {
    const d = new Date(att.createdAt);
    return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}` === todayKey;
  });
  const todayCount = todayAttempts.length;
  const target = settings.dailyGoalQuestions;
  const isGoalMet = todayCount >= target;

  const quickTimes = [
    { label: 'Morning', time: '07:30' },
    { label: 'Afternoon', time: '13:30' },
    { label: 'Evening', time: '18:30' },
    { label: 'Night', time: '20:30' },
  ];

  const handleToggle = (checked: boolean) => {
    updateNotificationSettings({ enabled: checked });
    // If enabling and permission is default, prompt for permission
    if (checked && typeof window !== 'undefined' && 'Notification' in window) {
      if (Notification.permission === 'default') {
        requestBrowserPermission();
      }
    }
  };

  const handleRequestPermission = async () => {
    const res = await requestBrowserPermission();
    if (res === 'granted') {
      setPermissionMsg('System notifications enabled successfully! 🔔');
    } else if (res === 'denied') {
      setPermissionMsg('Browser notifications blocked in settings. In-app alerts will be used.');
    } else {
      setPermissionMsg('System notifications unsupported in this browser; in-app alerts active.');
    }
    setTimeout(() => setPermissionMsg(null), 4000);
  };

  const handleTestNotification = () => {
    sendTestNotification();
    setTestSent(true);
    setTimeout(() => setTestSent(false), 2500);
  };

  const hasSystemPerm =
    typeof window !== 'undefined' &&
    'Notification' in window &&
    Notification.permission === 'granted';

  return (
    <div className="p-5 rounded-3xl bg-white dark:bg-[#121D20] border border-[#D5EAE9] dark:border-[#263A3E] shadow-xs space-y-4">
      {/* Top Header with Enable Toggle */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div
            className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-colors ${
              notifications.enabled
                ? 'bg-[#00B8B0]/15 text-[#00B8B0]'
                : 'bg-[#D5EAE9] dark:bg-[#1F2F33] text-[#55737B] dark:text-[#A8B6BA]'
            }`}
          >
            <Bell className="w-5 h-5 stroke-[2.2]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-display font-bold text-sm text-[#173A43] dark:text-[#EDF3F4]">
                Daily Study Goal Reminders
              </h3>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  notifications.enabled
                    ? 'bg-[#00B8B0]/15 text-[#087F7A] dark:text-[#6ECDD0]'
                    : 'bg-[#D5EAE9] dark:bg-[#1F2F33] text-[#55737B] dark:text-[#A8B6BA]'
                }`}
              >
                {notifications.enabled ? 'Active' : 'Muted'}
              </span>
            </div>
            <p className="text-[11px] text-[#55737B] dark:text-[#A8B6BA] mt-0.5">
              Receive a daily prompt at your preferred study time to keep your streak alive.
            </p>
          </div>
        </div>

        {/* Master Switch */}
        <label className="relative inline-flex items-center cursor-pointer shrink-0">
          <input
            type="checkbox"
            checked={notifications.enabled}
            onChange={(e) => handleToggle(e.target.checked)}
            className="sr-only peer"
          />
          <div className="w-11 h-6 bg-[#D5EAE9] dark:bg-[#263A3E] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-[#D5EAE9] after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#00B8B0]" />
        </label>
      </div>

      {/* Goal Progress Banner */}
      <div className="p-3 rounded-2xl bg-[#F5FAFA] dark:bg-[#0B1618] border border-[#D5EAE9] dark:border-[#263A3E] flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-[#00B8B0]/15 text-[#00B8B0] flex items-center justify-center shrink-0">
            {isGoalMet ? (
              <CheckCircle2 className="w-4 h-4 text-[#00B8B0]" />
            ) : (
              <Flame className="w-4 h-4 text-[#FF8A00] fill-current" />
            )}
          </div>
          <div>
            <div className="text-xs font-bold text-[#173A43] dark:text-[#EDF3F4]">
              {isGoalMet ? "Today's Goal Achieved! 🎉" : "Today's Study Progress"}
            </div>
            <div className="text-[11px] text-[#55737B] dark:text-[#A8B6BA]">
              {todayCount} of {target} questions completed today
            </div>
          </div>
        </div>

        <div className="text-right">
          <span className="font-display font-extrabold text-xs text-[#00B8B0]">
            {Math.min(100, Math.round((todayCount / target) * 100))}%
          </span>
          <span className="text-[10px] text-[#55737B] dark:text-[#A8B6BA] block">
            {Math.max(0, target - todayCount)} left
          </span>
        </div>
      </div>

      {notifications.enabled ? (
        <div className="space-y-3.5 pt-1">
          {/* Preferred Time Picker */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-[#173A43] dark:text-[#EDF3F4] flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-[#00B8B0]" />
                <span>Preferred Reminder Time</span>
              </label>
              <input
                type="time"
                value={notifications.reminderTime}
                onChange={(e) => updateNotificationSettings({ reminderTime: e.target.value })}
                className="px-2.5 py-1 text-xs font-mono font-bold bg-[#F5FAFA] dark:bg-[#0B1618] text-[#173A43] dark:text-[#EDF3F4] border border-[#D5EAE9] dark:border-[#263A3E] rounded-xl focus:outline-none focus:border-[#00B8B0]"
              />
            </div>

            {/* Quick Preset Buttons */}
            <div className="grid grid-cols-4 gap-1.5">
              {quickTimes.map((preset) => {
                const isSelected = notifications.reminderTime === preset.time;
                return (
                  <button
                    key={preset.time}
                    type="button"
                    onClick={() => updateNotificationSettings({ reminderTime: preset.time })}
                    className={`py-1.5 px-2 rounded-xl text-center transition-all ${
                      isSelected
                        ? 'bg-[#00B8B0] text-white font-bold shadow-xs'
                        : 'bg-[#F5FAFA] dark:bg-[#0B1618] border border-[#D5EAE9] dark:border-[#263A3E] text-[#55737B] dark:text-[#A8B6BA] hover:text-[#173A43] dark:hover:text-[#EDF3F4]'
                    }`}
                  >
                    <div className="text-[10px] leading-tight opacity-90">{preset.label}</div>
                    <div className="text-[11px] font-mono font-semibold">{preset.time}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Schedule Frequency & Sound Options */}
          <div className="grid grid-cols-2 gap-2 pt-1 border-t border-[#D5EAE9] dark:border-[#263A3E]">
            {/* Days selector */}
            <div className="p-2.5 rounded-2xl bg-[#F5FAFA] dark:bg-[#0B1618] border border-[#D5EAE9] dark:border-[#263A3E]">
              <div className="text-[10px] font-semibold text-[#55737B] dark:text-[#A8B6BA] mb-1 flex items-center gap-1">
                <Calendar className="w-3 h-3 text-[#00B8B0]" />
                <span>Frequency</span>
              </div>
              <div className="flex gap-1">
                <button
                  type="button"
                  onClick={() => updateNotificationSettings({ reminderDays: 'daily' })}
                  className={`flex-1 py-1 text-[11px] font-bold rounded-lg transition-colors ${
                    notifications.reminderDays === 'daily'
                      ? 'bg-[#00B8B0] text-white shadow-2xs'
                      : 'text-[#55737B] dark:text-[#A8B6BA]'
                  }`}
                >
                  Every Day
                </button>
                <button
                  type="button"
                  onClick={() => updateNotificationSettings({ reminderDays: 'weekdays' })}
                  className={`flex-1 py-1 text-[11px] font-bold rounded-lg transition-colors ${
                    notifications.reminderDays === 'weekdays'
                      ? 'bg-[#00B8B0] text-white shadow-2xs'
                      : 'text-[#55737B] dark:text-[#A8B6BA]'
                  }`}
                >
                  Mon-Fri
                </button>
              </div>
            </div>

            {/* Sound toggle */}
            <div className="p-2.5 rounded-2xl bg-[#F5FAFA] dark:bg-[#0B1618] border border-[#D5EAE9] dark:border-[#263A3E] flex items-center justify-between">
              <div>
                <div className="text-[10px] font-semibold text-[#55737B] dark:text-[#A8B6BA] flex items-center gap-1">
                  {notifications.soundEnabled ? (
                    <Volume2 className="w-3 h-3 text-[#00B8B0]" />
                  ) : (
                    <VolumeX className="w-3 h-3 text-[#55737B]" />
                  )}
                  <span>Alert Chime</span>
                </div>
                <div className="text-xs font-bold text-[#173A43] dark:text-[#EDF3F4] mt-0.5">
                  {notifications.soundEnabled ? 'Enabled' : 'Muted'}
                </div>
              </div>
              <button
                type="button"
                onClick={() =>
                  updateNotificationSettings({ soundEnabled: !notifications.soundEnabled })
                }
                className={`p-1.5 rounded-xl border transition-colors ${
                  notifications.soundEnabled
                    ? 'bg-[#00B8B0]/15 border-[#00B8B0]/30 text-[#00B8B0]'
                    : 'bg-white dark:bg-[#121D20] border-[#D5EAE9] dark:border-[#263A3E] text-[#55737B]'
                }`}
                title={notifications.soundEnabled ? 'Disable chime' : 'Enable chime'}
              >
                {notifications.soundEnabled ? (
                  <Check className="w-3.5 h-3.5" />
                ) : (
                  <VolumeX className="w-3.5 h-3.5" />
                )}
              </button>
            </div>
          </div>

          {/* System Notification & Test Button Row */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2 pt-1 border-t border-[#D5EAE9] dark:border-[#263A3E]">
            {!hasSystemPerm ? (
              <button
                type="button"
                onClick={handleRequestPermission}
                className="w-full sm:w-auto text-xs font-semibold text-[#00B8B0] hover:text-[#087F7A] inline-flex items-center justify-center gap-1 py-1"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Enable System Browser Alerts</span>
              </button>
            ) : (
              <span className="text-[11px] font-medium text-[#087F7A] dark:text-[#6ECDD0] inline-flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#00B8B0]" />
                <span>System alerts active on this device</span>
              </span>
            )}

            <button
              type="button"
              onClick={handleTestNotification}
              className={`w-full sm:w-auto px-3.5 py-1.5 rounded-full text-xs font-display font-bold transition-all inline-flex items-center justify-center gap-1.5 active:scale-95 ${
                testSent
                  ? 'bg-emerald-600 text-white'
                  : 'bg-[#F5FAFA] dark:bg-[#0B1618] hover:bg-[#EAFBF9] border border-[#D5EAE9] dark:border-[#263A3E] text-[#173A43] dark:text-[#EDF3F4]'
              }`}
            >
              <Send className="w-3 h-3" />
              <span>{testSent ? 'Reminder Sent!' : 'Send Test Reminder'}</span>
            </button>
          </div>

          {permissionMsg && (
            <div className="text-[11px] p-2 rounded-xl bg-[#EAFBF9] dark:bg-[#14282B] text-[#087F7A] dark:text-[#6ECDD0] font-medium">
              {permissionMsg}
            </div>
          )}
        </div>
      ) : (
        <div className="text-xs text-[#55737B] dark:text-[#A8B6BA] bg-[#F5FAFA] dark:bg-[#0B1618] p-3 rounded-2xl border border-[#D5EAE9] dark:border-[#263A3E]">
          Daily reminders are currently paused. Switch on above to receive scheduled study reminders at your preferred time.
        </div>
      )}
    </div>
  );
};
