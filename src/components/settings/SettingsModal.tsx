import React, { useState } from 'react';
import { useAppStore, type ThemeMode } from '@/stores/appStore';
import { useDailyReminder } from '@/hooks/useDailyReminder';
import {
  X,
  Sun,
  Moon,
  Laptop,
  Bell,
  Clock,
  Volume2,
  VolumeX,
  Target,
  Zap,
  Wifi,
  Timer,
  Check,
  Send,
  Sparkles,
  BookOpen,
  RotateCcw,
  Smartphone,
  ShieldCheck,
} from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const {
    settings,
    setTheme,
    updateSettings,
    updateNotificationSettings,
    profile,
    updateProfile,
    resetAttempts,
  } = useAppStore();

  const { notifications, sendTestNotification, requestBrowserPermission } = useDailyReminder();
  const [activeTab, setActiveTab] = useState<'general' | 'notifications' | 'study'>('general');
  const [testSent, setTestSent] = useState(false);

  if (!isOpen) return null;

  const themes: { id: ThemeMode; label: string; desc: string; icon: typeof Sun }[] = [
    {
      id: 'light',
      label: 'Light',
      desc: 'Clean soft turquoise & white',
      icon: Sun,
    },
    {
      id: 'dark',
      label: 'Dark',
      desc: 'OLED friendly teal-black',
      icon: Moon,
    },
    {
      id: 'system',
      label: 'System Default',
      desc: 'Follows device appearance',
      icon: Laptop,
    },
  ];

  const handleTestNotification = () => {
    sendTestNotification();
    setTestSent(true);
    setTimeout(() => setTestSent(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-white dark:bg-[#121D20] rounded-3xl border border-[#D5EAE9] dark:border-[#263A3E] shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-[#D5EAE9] dark:border-[#263A3E] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-[#00B8B0]/15 text-[#00B8B0] flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-display font-bold text-base text-[#173A43] dark:text-[#EDF3F4]">
                App Settings & Preferences
              </h2>
              <p className="text-xs text-[#55737B] dark:text-[#A8B6BA]">
                Customize appearance, notifications, and study mode
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full text-[#55737B] hover:text-[#173A43] dark:hover:text-[#EDF3F4] hover:bg-[#F5FAFA] dark:hover:bg-[#1A282C] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="flex border-b border-[#D5EAE9] dark:border-[#263A3E] px-4 bg-[#F5FAFA] dark:bg-[#0B1618]">
          <button
            onClick={() => setActiveTab('general')}
            className={`py-3 px-3 text-xs font-display font-bold border-b-2 transition-all ${
              activeTab === 'general'
                ? 'border-[#00B8B0] text-[#00B8B0]'
                : 'border-transparent text-[#55737B] dark:text-[#A8B6BA] hover:text-[#173A43]'
            }`}
          >
            Theme & Display
          </button>
          <button
            onClick={() => setActiveTab('notifications')}
            className={`py-3 px-3 text-xs font-display font-bold border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'notifications'
                ? 'border-[#00B8B0] text-[#00B8B0]'
                : 'border-transparent text-[#55737B] dark:text-[#A8B6BA] hover:text-[#173A43]'
            }`}
          >
            <span>Reminders</span>
            {notifications.enabled && (
              <span className="w-1.5 h-1.5 rounded-full bg-[#00B8B0]" />
            )}
          </button>
          <button
            onClick={() => setActiveTab('study')}
            className={`py-3 px-3 text-xs font-display font-bold border-b-2 transition-all ${
              activeTab === 'study'
                ? 'border-[#00B8B0] text-[#00B8B0]'
                : 'border-transparent text-[#55737B] dark:text-[#A8B6BA] hover:text-[#173A43]'
            }`}
          >
            Practice & Data
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-5 flex-1">
          {/* TAB 1: GENERAL & THEME */}
          {activeTab === 'general' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#173A43] dark:text-[#EDF3F4] mb-1.5">
                  Appearance Theme
                </label>
                <p className="text-[11px] text-[#55737B] dark:text-[#A8B6BA] mb-3">
                  Choose between Light mode, OLED Dark mode, or adapt to your device settings automatically.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {themes.map((t) => {
                    const Icon = t.icon;
                    const isSelected = settings.theme === t.id;
                    return (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => setTheme(t.id)}
                        className={`p-3.5 rounded-2xl border text-left transition-all flex flex-col justify-between ${
                          isSelected
                            ? 'border-[#00B8B0] bg-[#EAFBF9] dark:bg-[#14282B] shadow-xs'
                            : 'border-[#D5EAE9] dark:border-[#263A3E] bg-[#F5FAFA] dark:bg-[#0B1618] hover:border-[#00B8B0]/50'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div
                            className={`w-7 h-7 rounded-xl flex items-center justify-center ${
                              isSelected
                                ? 'bg-[#00B8B0] text-white'
                                : 'bg-white dark:bg-[#121D20] text-[#55737B] dark:text-[#A8B6BA]'
                            }`}
                          >
                            <Icon className="w-4 h-4" />
                          </div>
                          {isSelected && (
                            <span className="w-5 h-5 rounded-full bg-[#00B8B0] text-white flex items-center justify-center">
                              <Check className="w-3 h-3 stroke-[2.5]" />
                            </span>
                          )}
                        </div>

                        <div>
                          <div
                            className={`text-xs font-bold ${
                              isSelected
                                ? 'text-[#087F7A] dark:text-[#6ECDD0]'
                                : 'text-[#173A43] dark:text-[#EDF3F4]'
                            }`}
                          >
                            {t.label}
                          </div>
                          <div className="text-[10px] text-[#55737B] dark:text-[#A8B6BA] mt-0.5 leading-tight">
                            {t.desc}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Sound Effects Toggle */}
              <div className="p-3.5 rounded-2xl bg-[#F5FAFA] dark:bg-[#0B1618] border border-[#D5EAE9] dark:border-[#263A3E] flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-[#00B8B0]/15 text-[#00B8B0] flex items-center justify-center">
                    <Volume2 className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-[#173A43] dark:text-[#EDF3F4]">
                      Sound Effects & Haptic Chimes
                    </div>
                    <div className="text-[11px] text-[#55737B] dark:text-[#A8B6BA]">
                      Audio feedback for quiz answers and milestones
                    </div>
                  </div>
                </div>

                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.soundEffects}
                    onChange={(e) => updateSettings({ soundEffects: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-10 h-5 bg-[#D5EAE9] dark:bg-[#263A3E] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-[#D5EAE9] after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#00B8B0]" />
                </label>
              </div>

              {/* Academic Target Info */}
              <div className="p-3.5 rounded-2xl bg-[#F5FAFA] dark:bg-[#0B1618] border border-[#D5EAE9] dark:border-[#263A3E] space-y-2">
                <div className="text-xs font-bold text-[#173A43] dark:text-[#EDF3F4] flex items-center gap-1.5">
                  <BookOpen className="w-4 h-4 text-[#00B8B0]" />
                  <span>Target Exam Registration</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-[10px] text-[#55737B] dark:text-[#A8B6BA] block">
                      Target Level
                    </span>
                    <select
                      value={profile.level}
                      onChange={(e) =>
                        updateProfile({ level: e.target.value as 'A' | 'O' })
                      }
                      className="w-full mt-1 px-2.5 py-1.5 bg-white dark:bg-[#121D20] border border-[#D5EAE9] dark:border-[#263A3E] rounded-xl text-xs font-semibold text-[#173A43] dark:text-[#EDF3F4] focus:outline-none focus:border-[#00B8B0]"
                    >
                      <option value="A">A Level (Advanced)</option>
                      <option value="O">O Level (Ordinary)</option>
                    </select>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#55737B] dark:text-[#A8B6BA] block">
                      Subject Stream
                    </span>
                    <select
                      value={profile.stream}
                      onChange={(e) =>
                        updateProfile({ stream: e.target.value as 'science' | 'arts' })
                      }
                      className="w-full mt-1 px-2.5 py-1.5 bg-white dark:bg-[#121D20] border border-[#D5EAE9] dark:border-[#263A3E] rounded-xl text-xs font-semibold text-[#173A43] dark:text-[#EDF3F4] focus:outline-none focus:border-[#00B8B0]"
                    >
                      <option value="science">Sciences (Physics/Maths/Chem/Bio)</option>
                      <option value="arts">Arts & Humanities</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: DAILY STUDY NOTIFICATIONS */}
          {activeTab === 'notifications' && (
            <div className="space-y-4">
              {/* Daily Reminder Toggle */}
              <div className="p-3.5 rounded-2xl bg-[#F5FAFA] dark:bg-[#0B1618] border border-[#D5EAE9] dark:border-[#263A3E] flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                      notifications.enabled
                        ? 'bg-[#00B8B0]/15 text-[#00B8B0]'
                        : 'bg-[#D5EAE9] dark:bg-[#1F2F33] text-[#55737B]'
                    }`}
                  >
                    <Bell className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-[#173A43] dark:text-[#EDF3F4]">
                      Daily Study Goal Reminders
                    </div>
                    <div className="text-[11px] text-[#55737B] dark:text-[#A8B6BA]">
                      Prompt to practice at your scheduled time
                    </div>
                  </div>
                </div>

                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={notifications.enabled}
                    onChange={(e) => {
                      updateNotificationSettings({ enabled: e.target.checked });
                      if (e.target.checked) requestBrowserPermission();
                    }}
                    className="sr-only peer"
                  />
                  <div className="w-10 h-5 bg-[#D5EAE9] dark:bg-[#263A3E] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-[#D5EAE9] after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#00B8B0]" />
                </label>
              </div>

              {/* Time Configuration */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-[#173A43] dark:text-[#EDF3F4] flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-[#00B8B0]" />
                    <span>Preferred Reminder Time</span>
                  </span>
                  <input
                    type="time"
                    value={notifications.reminderTime}
                    disabled={!notifications.enabled}
                    onChange={(e) => updateNotificationSettings({ reminderTime: e.target.value })}
                    className="px-2.5 py-1 bg-[#F5FAFA] dark:bg-[#0B1618] text-xs font-mono font-bold text-[#173A43] dark:text-[#EDF3F4] border border-[#D5EAE9] dark:border-[#263A3E] rounded-xl focus:outline-none focus:border-[#00B8B0] disabled:opacity-50"
                  />
                </label>

                {/* Quick Presets */}
                <div className="grid grid-cols-4 gap-1.5">
                  {[
                    { label: 'Morning', time: '07:30' },
                    { label: 'Afternoon', time: '13:30' },
                    { label: 'Evening', time: '18:30' },
                    { label: 'Night', time: '20:30' },
                  ].map((preset) => (
                    <button
                      key={preset.time}
                      type="button"
                      disabled={!notifications.enabled}
                      onClick={() => updateNotificationSettings({ reminderTime: preset.time })}
                      className={`py-1.5 px-2 rounded-xl text-center text-xs transition-all disabled:opacity-50 ${
                        notifications.reminderTime === preset.time
                          ? 'bg-[#00B8B0] text-white font-bold shadow-2xs'
                          : 'bg-[#F5FAFA] dark:bg-[#0B1618] border border-[#D5EAE9] dark:border-[#263A3E] text-[#55737B] dark:text-[#A8B6BA]'
                      }`}
                    >
                      <div className="text-[10px] opacity-80">{preset.label}</div>
                      <div className="font-mono text-[11px]">{preset.time}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Daily Target Questions */}
              <div>
                <label className="text-xs font-bold text-[#173A43] dark:text-[#EDF3F4] flex items-center gap-1.5 mb-2">
                  <Target className="w-3.5 h-3.5 text-[#00B8B0]" />
                  <span>Daily Question Target</span>
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {[5, 10, 15, 20].map((count) => {
                    const isSelected = settings.dailyGoalQuestions === count;
                    return (
                      <button
                        key={count}
                        type="button"
                        onClick={() => updateSettings({ dailyGoalQuestions: count })}
                        className={`p-2.5 rounded-2xl border text-center transition-all ${
                          isSelected
                            ? 'border-[#00B8B0] bg-[#00B8B0] text-white font-bold shadow-xs'
                            : 'border-[#D5EAE9] dark:border-[#263A3E] bg-[#F5FAFA] dark:bg-[#0B1618] text-[#173A43] dark:text-[#EDF3F4]'
                        }`}
                      >
                        <div className="font-display font-bold text-sm">{count}</div>
                        <div className="text-[10px] opacity-80">Qs / day</div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Notification Chime Sound Toggle */}
              <div className="p-3.5 rounded-2xl bg-[#F5FAFA] dark:bg-[#0B1618] border border-[#D5EAE9] dark:border-[#263A3E] flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-[#173A43] dark:text-[#EDF3F4]">
                    Reminder Chime Sound
                  </div>
                  <div className="text-[11px] text-[#55737B] dark:text-[#A8B6BA]">
                    Play audible chime when reminder arrives
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
                >
                  {notifications.soundEnabled ? (
                    <Volume2 className="w-4 h-4" />
                  ) : (
                    <VolumeX className="w-4 h-4" />
                  )}
                </button>
              </div>

              {/* Test Button */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleTestNotification}
                  className={`w-full py-2.5 rounded-full font-display font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-xs ${
                    testSent
                      ? 'bg-emerald-600 text-white'
                      : 'bg-[#00B8B0] hover:bg-[#087F7A] text-white'
                  }`}
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{testSent ? 'Test Reminder Dispatched!' : 'Send Test Notification Now'}</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 3: STUDY & PRACTICE PREFERENCES */}
          {activeTab === 'study' && (
            <div className="space-y-4">
              {/* Show Explanations Immediately */}
              <div className="p-3.5 rounded-2xl bg-[#F5FAFA] dark:bg-[#0B1618] border border-[#D5EAE9] dark:border-[#263A3E] flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-[#00B8B0]/15 text-[#00B8B0] flex items-center justify-center">
                    <Zap className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-[#173A43] dark:text-[#EDF3F4]">
                      Instant Explanations
                    </div>
                    <div className="text-[11px] text-[#55737B] dark:text-[#A8B6BA]">
                      Show teacher steps immediately after each answer
                    </div>
                  </div>
                </div>

                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.showExplanationsImmediately}
                    onChange={(e) =>
                      updateSettings({ showExplanationsImmediately: e.target.checked })
                    }
                    className="sr-only peer"
                  />
                  <div className="w-10 h-5 bg-[#D5EAE9] dark:bg-[#263A3E] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-[#D5EAE9] after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#00B8B0]" />
                </label>
              </div>

              {/* Countdown Timer */}
              <div className="p-3.5 rounded-2xl bg-[#F5FAFA] dark:bg-[#0B1618] border border-[#D5EAE9] dark:border-[#263A3E] flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-[#FF8A00]/15 text-[#FF8A00] flex items-center justify-center">
                    <Timer className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-[#173A43] dark:text-[#EDF3F4]">
                      Exam Countdown Timer
                    </div>
                    <div className="text-[11px] text-[#55737B] dark:text-[#A8B6BA]">
                      Simulate official Cameroon GCE timing constraints
                    </div>
                  </div>
                </div>

                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.countdownTimer}
                    onChange={(e) => updateSettings({ countdownTimer: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-10 h-5 bg-[#D5EAE9] dark:bg-[#263A3E] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-[#D5EAE9] after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#00B8B0]" />
                </label>
              </div>

              {/* Low Data Mode */}
              <div className="p-3.5 rounded-2xl bg-[#F5FAFA] dark:bg-[#0B1618] border border-[#D5EAE9] dark:border-[#263A3E] flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-[#00B8B0]/15 text-[#00B8B0] flex items-center justify-center">
                    <Wifi className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-[#173A43] dark:text-[#EDF3F4]">
                      Low Data Mode (MTN / Orange)
                    </div>
                    <div className="text-[11px] text-[#55737B] dark:text-[#A8B6BA]">
                      Compress diagrams and cache papers for weak 2G/3G signals
                    </div>
                  </div>
                </div>

                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.lowDataMode}
                    onChange={(e) => updateSettings({ lowDataMode: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-10 h-5 bg-[#D5EAE9] dark:bg-[#263A3E] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-[#D5EAE9] after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#00B8B0]" />
                </label>
              </div>

              {/* Clear History */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => {
                    if (confirm('Reset your practice history? This cannot be undone.')) {
                      resetAttempts();
                    }
                  }}
                  className="w-full py-2.5 rounded-full border border-red-200 dark:border-red-900/40 text-red-600 dark:text-red-400 font-display font-bold text-xs flex items-center justify-center gap-1.5 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset All Practice History</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#D5EAE9] dark:border-[#263A3E] bg-[#F5FAFA] dark:bg-[#0B1618] flex items-center justify-between text-xs">
          <div className="text-[11px] text-[#55737B] dark:text-[#A8B6BA] flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-[#00B8B0]" />
            <span>Skyline Academy v1.4 • GCE 2026/2027</span>
          </div>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-[#00B8B0] hover:bg-[#087F7A] text-white font-display font-bold text-xs rounded-full shadow-xs transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
