import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Attempt, Level, Stream, PathwayChoice, Plan } from '@/types/models';
import { questions as seedQuestions, papers as seedPapers } from '@/data/seed';
import { soundService } from '@/services/soundService';
import { offlineStorage } from '@/services/offlineStorage';

export type ThemeMode = 'light' | 'dark' | 'system';

export type NotificationType =
  | 'signin'
  | 'daily_goal'
  | 'download'
  | 'pass_unlocked'
  | 'streak'
  | 'syllabus'
  | 'test';

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  timestamp: number;
  read: boolean;
  actionTab?: 'home' | 'gce' | 'concours' | 'tutor' | 'me';
}

export interface NotificationSettings {
  enabled: boolean;
  reminderTime: string; // "18:30"
  reminderDays: 'daily' | 'weekdays';
  soundEnabled: boolean;
  browserPermission: NotificationPermission | 'unsupported';
  lastNotifiedDate: string | null;
}

export interface AppSettings {
  theme: ThemeMode;
  notifications: NotificationSettings;
  dailyGoalQuestions: number;
  soundEffects: boolean;
  lowDataMode: boolean;
  showExplanationsImmediately: boolean;
  countdownTimer: boolean;
}

export interface InAppReminder {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  timestamp: number;
}

export interface UserProfile {
  name: string;
  phone: string;
  schoolName: string;
  level: Level;
  stream: Stream;
  targetPathway: PathwayChoice;
  plan: Plan;
  entitlementExpiresAt: string | null;
}

export interface AppState {
  profile: UserProfile;
  attempts: Attempt[];
  tutorQuestionsRemaining: number;
  downloadedPaperIds: string[];
  activeTab: 'home' | 'gce' | 'concours' | 'tutor' | 'me';
  selectedSubjectId: string | null;
  selectedPaperId: string | null;
  selectedInstitutionId: string | null;
  showPaywall: boolean;
  showLeadModal: boolean;
  showSkylerModal: boolean;
  leadContext: { target: string; readinessScore?: number } | null;

  // Settings & Notifications
  settings: AppSettings;
  showSettingsModal: boolean;
  activeInAppReminder: InAppReminder | null;
  notificationsList: AppNotification[];

  // Actions
  setActiveTab: (tab: 'home' | 'gce' | 'concours' | 'tutor' | 'me') => void;
  setSelectedSubjectId: (id: string | null) => void;
  setSelectedPaperId: (id: string | null) => void;
  setSelectedInstitutionId: (id: string | null) => void;
  setShowPaywall: (show: boolean) => void;
  setShowLeadModal: (show: boolean, context?: { target: string; readinessScore?: number }) => void;
  setShowSkylerModal: (show: boolean) => void;
  setShowSettingsModal: (show: boolean) => void;
  setTheme: (theme: ThemeMode) => void;
  updateSettings: (settingsUpdate: Partial<AppSettings>) => void;
  updateNotificationSettings: (notifUpdate: Partial<NotificationSettings>) => void;
  setActiveInAppReminder: (reminder: InAppReminder | null) => void;
  dismissInAppReminder: () => void;
  pushNotification: (notif: {
    title: string;
    message: string;
    type: NotificationType;
    actionTab?: 'home' | 'gce' | 'concours' | 'tutor' | 'me';
    sound?: boolean;
  }) => void;
  markNotificationAsRead: (id: string) => void;
  markAllNotificationsAsRead: () => void;
  clearAllNotifications: () => void;
  triggerStudyReminder: (forced?: boolean) => { fired: boolean; reason?: string };
  updateProfile: (profile: Partial<UserProfile>) => void;
  recordAttempt: (attempt: Omit<Attempt, 'id' | 'createdAt'>) => void;
  recordBatchAttempts: (newAttempts: Omit<Attempt, 'id' | 'createdAt'>[]) => void;
  redeemCode: (code: string) => { success: boolean; message: string };
  activateMobileMoneyPass: (phone: string, provider: 'mtn' | 'orange') => void;
  toggleDownloadPaper: (paperId: string) => void;
  decrementTutorQuota: () => boolean;
  resetAttempts: () => void;
}

// Initial mock attempts for a realistic starter experience so readiness & mastery charts look alive
const INITIAL_ATTEMPTS: Attempt[] = [
  {
    id: 'att-init-1',
    questionId: 'ap24-1',
    subjectId: 'a-physics',
    topicIds: ['a-phy-mechanics'],
    selectedKey: 'C',
    correct: true,
    timeMs: 34000,
    source: 'quiz',
    createdAt: Date.now() - 86400000 * 2,
  },
  {
    id: 'att-init-2',
    questionId: 'ap24-2',
    subjectId: 'a-physics',
    topicIds: ['a-phy-mechanics'],
    selectedKey: 'C',
    correct: true,
    timeMs: 20000,
    source: 'quiz',
    createdAt: Date.now() - 86400000 * 3,
  },
  {
    id: 'att-init-3',
    questionId: 'ap24-3',
    subjectId: 'a-physics',
    topicIds: ['a-phy-electricity'],
    selectedKey: 'C',
    correct: true,
    timeMs: 42000,
    source: 'quiz',
    createdAt: Date.now() - 86400000 * 4,
  },
  {
    id: 'att-init-4',
    questionId: 'ap24-4',
    subjectId: 'a-physics',
    topicIds: ['a-phy-electricity'],
    selectedKey: 'A',
    correct: false,
    timeMs: 55000,
    source: 'quiz',
    createdAt: Date.now() - 86400000 * 1,
  },
  {
    id: 'att-init-5',
    questionId: 'am24-1',
    subjectId: 'a-maths',
    topicIds: ['a-mat-calculus'],
    selectedKey: 'C',
    correct: true,
    timeMs: 40000,
    source: 'quiz',
    createdAt: Date.now() - 86400000 * 2,
  },
  {
    id: 'att-init-6',
    questionId: 'am24-2',
    subjectId: 'a-maths',
    topicIds: ['a-mat-calculus'],
    selectedKey: 'B',
    correct: true,
    timeMs: 38000,
    source: 'quiz',
    createdAt: Date.now() - 86400000 * 1,
  },
  {
    id: 'att-init-7',
    questionId: 'am24-3',
    subjectId: 'a-maths',
    topicIds: ['a-mat-complex'],
    selectedKey: 'A',
    correct: true,
    timeMs: 25000,
    source: 'quiz',
    createdAt: Date.now() - 86400000 * 5,
  },
  {
    id: 'att-init-8',
    questionId: 'ac24-1',
    subjectId: 'a-chemistry',
    topicIds: ['a-che-physical'],
    selectedKey: 'A',
    correct: true,
    timeMs: 30000,
    source: 'quiz',
    createdAt: Date.now() - 86400000 * 2,
  },
  {
    id: 'att-init-9',
    questionId: 'ab24-1',
    subjectId: 'a-biology',
    topicIds: ['a-bio-cells'],
    selectedKey: 'B',
    correct: true,
    timeMs: 22000,
    source: 'quiz',
    createdAt: Date.now() - 86400000 * 2,
  },
];

const DEFAULT_SETTINGS: AppSettings = {
  theme: 'system',
  notifications: {
    enabled: true,
    reminderTime: '18:30',
    reminderDays: 'daily',
    soundEnabled: true,
    browserPermission:
      typeof window !== 'undefined' && 'Notification' in window
        ? Notification.permission
        : 'unsupported',
    lastNotifiedDate: null,
  },
  dailyGoalQuestions: 10,
  soundEffects: true,
  lowDataMode: false,
  showExplanationsImmediately: true,
  countdownTimer: true,
};

const INITIAL_NOTIFICATIONS: AppNotification[] = [
  {
    id: 'notif-welcome-1',
    title: 'Welcome to Skyline Academy 👋',
    message: 'Offline past papers and revision formula sheets are cached on your phone storage.',
    type: 'signin',
    timestamp: Date.now() - 1000 * 60 * 30, // 30 mins ago
    read: false,
    actionTab: 'gce',
  },
  {
    id: 'notif-syllabus-1',
    title: '2024 Past Papers Ready 📚',
    message: 'Physics and Pure Mathematics 2024 Paper 1 with official teacher marking schemes are indexed.',
    type: 'syllabus',
    timestamp: Date.now() - 1000 * 60 * 120, // 2 hrs ago
    read: false,
    actionTab: 'gce',
  },
  {
    id: 'notif-streak-1',
    title: 'Daily Streak Milestone 🔥',
    message: 'You are on a 3-day practice streak. Solve 5 questions today to extend it!',
    type: 'streak',
    timestamp: Date.now() - 1000 * 60 * 360, // 6 hrs ago
    read: true,
    actionTab: 'home',
  },
];

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      profile: {
        name: 'Brenda N.',
        phone: '+237 671 234 567',
        schoolName: 'GBHS Buea',
        level: 'A',
        stream: 'science',
        targetPathway: 'health',
        plan: 'free',
        entitlementExpiresAt: null,
      },
      attempts: INITIAL_ATTEMPTS,
      tutorQuestionsRemaining: 5,
      downloadedPaperIds: ['a-physics-2024-p1'],
      activeTab: 'home',
      selectedSubjectId: null,
      selectedPaperId: null,
      selectedInstitutionId: null,
      showPaywall: false,
      showLeadModal: false,
      showSkylerModal: false,
      leadContext: null,

      // Settings state
      settings: DEFAULT_SETTINGS,
      showSettingsModal: false,
      activeInAppReminder: null,
      notificationsList: INITIAL_NOTIFICATIONS,

      setActiveTab: (tab) => set({ activeTab: tab }),
      setSelectedSubjectId: (id) => set({ selectedSubjectId: id }),
      setSelectedPaperId: (id) => set({ selectedPaperId: id }),
      setSelectedInstitutionId: (id) => set({ selectedInstitutionId: id }),
      setShowPaywall: (show) => set({ showPaywall: show }),
      setShowLeadModal: (show, context) => set({ showLeadModal: show, leadContext: context || null }),
      setShowSkylerModal: (show) => set({ showSkylerModal: show }),
      setShowSettingsModal: (show) => set({ showSettingsModal: show }),

      setTheme: (theme) =>
        set((state) => ({
          settings: { ...state.settings, theme },
        })),

      updateSettings: (settingsUpdate) =>
        set((state) => ({
          settings: { ...state.settings, ...settingsUpdate },
        })),

      updateNotificationSettings: (notifUpdate) =>
        set((state) => ({
          settings: {
            ...state.settings,
            notifications: {
              ...state.settings.notifications,
              ...notifUpdate,
            },
          },
        })),

      setActiveInAppReminder: (reminder) => set({ activeInAppReminder: reminder }),
      dismissInAppReminder: () => set({ activeInAppReminder: null }),

      pushNotification: ({ title, message, type, actionTab, sound = true }) => {
        const state = get();
        const newNotif: AppNotification = {
          id: `notif-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          title,
          message,
          type,
          timestamp: Date.now(),
          read: false,
          actionTab,
        };

        // 1. Audio chime if enabled
        if (sound && state.settings.notifications.soundEnabled && state.settings.soundEffects) {
          soundService.playReminderChime();
        }

        // 2. Native browser notification if permission granted
        if (typeof window !== 'undefined' && 'Notification' in window) {
          if (Notification.permission === 'granted') {
            try {
              new Notification(title, {
                body: message,
                icon: '/assets/aistudio/1._Splash_Screen_846059eb.png',
              });
            } catch {}
          }
        }

        // 3. Update store: prepend to notification inbox and show in-app banner
        set((s) => ({
          notificationsList: [newNotif, ...s.notificationsList],
          activeInAppReminder: {
            id: newNotif.id,
            title,
            message,
            type,
            timestamp: Date.now(),
          },
        }));
      },

      markNotificationAsRead: (id) =>
        set((s) => ({
          notificationsList: s.notificationsList.map((n) =>
            n.id === id ? { ...n, read: true } : n
          ),
        })),

      markAllNotificationsAsRead: () =>
        set((s) => ({
          notificationsList: s.notificationsList.map((n) => ({ ...n, read: true })),
        })),

      clearAllNotifications: () =>
        set({
          notificationsList: [],
        }),

      triggerStudyReminder: (forced = false) => {
        const state = get();
        const { settings, attempts } = state;

        if (!settings.notifications.enabled && !forced) {
          return { fired: false, reason: 'Notifications disabled by user' };
        }

        const now = new Date();
        const todayKey = `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}`;

        // Count attempts today
        const todayAttempts = attempts.filter((att) => {
          const d = new Date(att.createdAt);
          return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}` === todayKey;
        });

        const todayCount = todayAttempts.length;
        const target = settings.dailyGoalQuestions;

        // Skip if goal already reached today (unless test/forced)
        if (!forced && todayCount >= target) {
          return { fired: false, reason: 'Daily study goal already met today' };
        }

        // Skip if already notified today (unless test/forced)
        if (!forced && settings.notifications.lastNotifiedDate === todayKey) {
          return { fired: false, reason: 'Already reminded earlier today' };
        }

        const title = forced
          ? '🎯 Skyline Study Reminder (Test)'
          : todayCount === 0
          ? '📚 Time for Your Daily GCE Prep!'
          : '🔥 Keep Your Daily Streak Alive!';

        const message = forced
          ? `Your daily study goal is ${target} questions. You've solved ${todayCount} today. Practice anytime to boost your GCE ranking!`
          : todayCount === 0
          ? `You have not solved any questions today. Complete 5 quick questions now to maintain your daily study streak.`
          : `You're ${target - todayCount} questions away from hitting today's study target (${todayCount}/${target} done). Keep going!`;

        state.pushNotification({
          title,
          message,
          type: forced ? 'test' : 'daily_goal',
          actionTab: 'home',
        });

        set((s) => ({
          settings: {
            ...s.settings,
            notifications: {
              ...s.settings.notifications,
              lastNotifiedDate: todayKey,
            },
          },
        }));

        return { fired: true };
      },

      updateProfile: (profileUpdate) =>
        set((state) => ({
          profile: { ...state.profile, ...profileUpdate },
        })),

      recordAttempt: (attemptData) => {
        const newAttempt: Attempt = {
          ...attemptData,
          id: `att-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          createdAt: Date.now(),
        };
        set((state) => ({
          attempts: [newAttempt, ...state.attempts],
        }));
      },

      recordBatchAttempts: (batch) => {
        const now = Date.now();
        const newAttempts: Attempt[] = batch.map((data, idx) => ({
          ...data,
          id: `att-${now}-${idx}-${Math.random().toString(36).slice(2, 6)}`,
          createdAt: now,
        }));
        set((state) => ({
          attempts: [...newAttempts, ...state.attempts],
        }));
      },

      redeemCode: (code: string) => {
        const clean = code.trim().toUpperCase();
        if (clean === 'SKYLINE-DEMO' || clean === 'SKYLINE2026' || clean === 'PASS2027') {
          set((state) => ({
            profile: {
              ...state.profile,
              plan: 'pass',
              entitlementExpiresAt: '2027-07-31',
            },
            showPaywall: false,
          }));

          // Notify student of pass activation
          get().pushNotification({
            title: '🎉 Season Pass Activated!',
            message: 'All teacher worked solutions & unlimited AI Tutor unlocked until 31 July 2027.',
            type: 'pass_unlocked',
            actionTab: 'gce',
          });

          return { success: true, message: '🎉 Season Pass unlocked! All teacher solutions & unlimited AI Tutor activated.' };
        }
        return { success: false, message: 'Invalid or expired code. Use code "SKYLINE-DEMO" for testing.' };
      },

      activateMobileMoneyPass: (phone: string, provider: 'mtn' | 'orange') => {
        set((state) => ({
          profile: {
            ...state.profile,
            phone: phone || state.profile.phone,
            plan: 'pass',
            entitlementExpiresAt: '2027-07-31',
          },
          showPaywall: false,
        }));

        // Notify user of mobile money pass activation
        get().pushNotification({
          title: '🎉 Payment Successful via ' + provider.toUpperCase(),
          message: 'Your Season Pass is active! Offline past papers and teacher answers unlocked.',
          type: 'pass_unlocked',
          actionTab: 'gce',
        });
      },

      toggleDownloadPaper: (paperId: string) => {
        const state = get();
        const exists = state.downloadedPaperIds.includes(paperId);
        const targetPaper = seedPapers.find((p) => p.id === paperId);

        if (exists) {
          // Remove from store & offlineStorage
          offlineStorage.removeCachedPaper(paperId);
          set({
            downloadedPaperIds: state.downloadedPaperIds.filter((id) => id !== paperId),
          });
        } else {
          // Add to store & offlineStorage
          if (targetPaper) {
            offlineStorage.cachePaper(targetPaper);
          }
          set({
            downloadedPaperIds: [...state.downloadedPaperIds, paperId],
          });

          // Send notification that paper is stored offline
          state.pushNotification({
            title: '📥 Paper Cached for Offline Access',
            message: targetPaper
              ? `${targetPaper.year} Paper ${targetPaper.paperNumber} is stored in offline storage. Practice anytime without internet.`
              : 'Paper downloaded and cached to offline storage.',
            type: 'download',
            actionTab: 'gce',
          });
        }
      },

      decrementTutorQuota: () => {
        const { profile, tutorQuestionsRemaining } = get();
        if (profile.plan === 'pass') {
          return true; // Unlimited
        }
        if (tutorQuestionsRemaining <= 0) {
          set({ showPaywall: true });
          return false;
        }
        set({ tutorQuestionsRemaining: tutorQuestionsRemaining - 1 });
        return true;
      },

      resetAttempts: () => set({ attempts: [] }),
    }),
    {
      name: 'skyline-academy-storage',
      // Merge function ensures old stored state gets default settings without crashing
      merge: (persistedState, currentState) => {
        const p = (persistedState as Partial<AppState>) || {};
        return {
          ...currentState,
          ...p,
          settings: {
            ...DEFAULT_SETTINGS,
            ...(p.settings || {}),
            notifications: {
              ...DEFAULT_SETTINGS.notifications,
              ...(p.settings?.notifications || {}),
            },
          },
          notificationsList: p.notificationsList || INITIAL_NOTIFICATIONS,
        };
      },
    }
  )
);
