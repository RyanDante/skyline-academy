import Constants from 'expo-constants';
import { useQueryClient } from '@tanstack/react-query';
import { Alert, Switch, View } from 'react-native';

import { Chip, ListRow, Screen, ScreenHeader, SectionHeader, Text } from '@/components/ui';
import { attemptsRepo } from '@/db/attemptsRepo';
import { queryKeys } from '@/hooks/queries';
import { ensureReminderPermission, syncReminders } from '@/services/reminders';
import { applyTheme } from '@/services/theme';
import {
  REMINDER_TIMES,
  useSessionStore,
  type ReminderSlot,
  type ThemeMode,
} from '@/stores/sessionStore';
import { useThemeColors } from '@/theme/tokens';

const THEMES: { id: ThemeMode; label: string }[] = [
  { id: 'system', label: 'System' },
  { id: 'light', label: 'Light' },
  { id: 'dark', label: 'Dark' },
];
const GOALS = [5, 10, 20, 30];

/** Settings (from the web version's settings panel). */
export default function Settings() {
  const colors = useThemeColors();
  const queryClient = useQueryClient();
  const settings = useSessionStore((s) => s.settings);
  const update = useSessionStore((s) => s.updateSettings);
  const clearHistory = useSessionStore((s) => s.clearPracticeHistory);

  const setTheme = (theme: ThemeMode) => {
    update({ theme });
    applyTheme(theme);
  };

  const setReminders = async (patch: Partial<typeof settings.reminders>) => {
    const next = { ...settings.reminders, ...patch };
    if (next.enabled && !settings.reminders.enabled) {
      const ok = await ensureReminderPermission().catch(() => false);
      if (!ok) {
        Alert.alert('Notifications are off', 'Allow notifications for Skyline in your phone settings to get study reminders.');
        return;
      }
    }
    update({ reminders: next });
    await syncReminders(next).catch(() => undefined);
  };

  const reset = () =>
    Alert.alert(
      'Reset practice history?',
      'This clears your answers, streak, weekly goal and quiz history on this phone. It cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: async () => {
            await attemptsRepo.clear();
            clearHistory();
            await queryClient.invalidateQueries({ queryKey: queryKeys.attempts });
          },
        },
      ],
    );

  const toggle = (value: boolean, onChange: (v: boolean) => void, label: string) => (
    <Switch
      value={value}
      onValueChange={onChange}
      accessibilityLabel={label}
      trackColor={{ true: colors.brand, false: colors.line }}
      thumbColor="#FFFFFF"
    />
  );

  return (
    <Screen topBar={<ScreenHeader title="Settings" />}>
      <SectionHeader title="Appearance" />
      <View className="flex-row gap-2">
        {THEMES.map((t) => (
          <Chip key={t.id} label={t.label} selected={settings.theme === t.id} onPress={() => setTheme(t.id)} />
        ))}
      </View>

      <SectionHeader title="Daily goal" />
      <Text variant="small" className="-mt-2">Questions per day. Your weekly goal is 7 times this.</Text>
      <View className="flex-row flex-wrap gap-2">
        {GOALS.map((g) => (
          <Chip key={g} label={`${g} a day`} selected={settings.dailyGoal === g} onPress={() => update({ dailyGoal: g })} />
        ))}
      </View>

      <SectionHeader title="Study reminders" />
      <ListRow
        icon="notifications-outline"
        title="Remind me to study"
        subtitle={settings.reminders.enabled ? REMINDER_TIMES[settings.reminders.slot].label : 'Off'}
        trailing={toggle(settings.reminders.enabled, (v) => void setReminders({ enabled: v }), 'Study reminders')}
      />
      {settings.reminders.enabled ? (
        <View className="gap-3">
          <View className="flex-row flex-wrap gap-2">
            {(Object.keys(REMINDER_TIMES) as ReminderSlot[]).map((slot) => (
              <Chip
                key={slot}
                label={REMINDER_TIMES[slot].label}
                selected={settings.reminders.slot === slot}
                onPress={() => void setReminders({ slot })}
              />
            ))}
          </View>
          <View className="flex-row gap-2">
            <Chip label="Every day" selected={settings.reminders.frequency === 'daily'} onPress={() => void setReminders({ frequency: 'daily' })} />
            <Chip label="Weekdays" selected={settings.reminders.frequency === 'weekdays'} onPress={() => void setReminders({ frequency: 'weekdays' })} />
          </View>
        </View>
      ) : null}

      <SectionHeader title="Practice" />
      <View>
        <ListRow
          icon="eye-outline"
          title="Show answers straight away"
          subtitle="Mark each practice question as soon as you answer"
          trailing={toggle(settings.showExplanationsImmediately, (v) => update({ showExplanationsImmediately: v }), 'Show answers straight away')}
          className="border-b border-line"
        />
        <ListRow
          icon="timer-outline"
          title="Countdown in timed papers"
          trailing={toggle(settings.countdownTimer, (v) => update({ countdownTimer: v }), 'Countdown in timed papers')}
          className="border-b border-line"
        />
        <ListRow
          icon="phone-portrait-outline"
          title="Vibration feedback"
          trailing={toggle(settings.haptics, (v) => update({ haptics: v }), 'Vibration feedback')}
          className="border-b border-line"
        />
        <ListRow
          icon="cellular-outline"
          title="Low-data mode"
          subtitle="Don’t load images or PDFs until you tap them"
          trailing={toggle(settings.lowData, (v) => update({ lowData: v }), 'Low-data mode')}
        />
      </View>

      <SectionHeader title="Data" />
      <ListRow icon="trash-outline" title="Reset practice history" destructive onPress={reset} />

      <Text variant="caption" className="mt-4 text-center">
        Skyline Academy {Constants.expoConfig?.version ?? ''}
      </Text>
    </Screen>
  );
}
