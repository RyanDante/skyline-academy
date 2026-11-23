import Storage from 'expo-sqlite/kv-store';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { product } from '@/lib/config';
import { createId } from '@/lib/id';
import { todayKey } from '@/lib/dates';
import type { Entitlement, UserProfile } from '@/types/models';

/** A weak topic saved from a GCE Tutor session summary. */
export interface RevisionItem {
  subjectId: string;
  topicId: string;
  name: string;
  addedAt: number;
}

export interface LastPaper {
  paperId: string;
  title: string;
  position: number;
  total: number;
}

export type ThemeMode = 'system' | 'light' | 'dark';
export type ReminderSlot = 'morning' | 'afternoon' | 'evening' | 'night';

/** Reminder times per slot (24h). */
export const REMINDER_TIMES: Record<ReminderSlot, { hour: number; minute: number; label: string }> = {
  morning: { hour: 7, minute: 0, label: 'Morning · 7:00' },
  afternoon: { hour: 14, minute: 0, label: 'Afternoon · 14:00' },
  evening: { hour: 18, minute: 30, label: 'Evening · 18:30' },
  night: { hour: 21, minute: 0, label: 'Night · 21:00' },
};

export interface AppSettings {
  theme: ThemeMode;
  /** Questions per day the student aims for (weekly goal = 7×). */
  dailyGoal: number;
  reminders: { enabled: boolean; slot: ReminderSlot; frequency: 'daily' | 'weekdays' };
  haptics: boolean;
  /** Don't load images or stream PDFs unless the student taps. */
  lowData: boolean;
  /** Show the answer straight after each practice question. */
  showExplanationsImmediately: boolean;
  /** Show a countdown in timed mocks. */
  countdownTimer: boolean;
}

export const DEFAULT_SETTINGS: AppSettings = {
  theme: 'system',
  dailyGoal: 10,
  reminders: { enabled: false, slot: 'evening', frequency: 'daily' },
  haptics: true,
  lowData: false,
  showExplanationsImmediately: true,
  countdownTimer: true,
};

/** A finished quiz, GCE Tutor session or paper attempt, for "Recent quizzes". */
export interface QuizRecord {
  id: string;
  title: string;
  subjectId: string;
  correct: number;
  total: number;
  questionIds: string[];
  finishedAt: number;
}

export type NotificationKind = 'info' | 'streak' | 'payment' | 'deadline' | 'content';

export interface AppNotification {
  id: string;
  kind: NotificationKind;
  title: string;
  body: string;
  createdAt: number;
  read: boolean;
  /** Optional in-app route to open. */
  route?: string;
}

interface SessionState {
  hydrated: boolean;
  onboardingComplete: boolean;
  uid: string | null;
  phone: string | null;
  profile: UserProfile | null;
  entitlement: Entitlement;
  /** Institution ids the student is targeting (max product.maxConcoursTargets). */
  targets: string[];
  /** Ticked checklist items keyed by institution id. */
  checklist: Record<string, string[]>;
  lastPaper: LastPaper | null;
  tutorUsage: { day: string; count: number };
  joinedGroupIds: string[];
  revisionPlan: RevisionItem[];
  settings: AppSettings;
  quizHistory: QuizRecord[];
  notifications: AppNotification[];

  setHydrated: () => void;
  saveProfile: (profile: UserProfile) => void;
  completeOnboarding: () => void;
  signIn: (uid: string, phone: string | null) => void;
  signOut: () => void;
  setEntitlement: (entitlement: Entitlement) => void;
  unlockPaper: (paperId: string) => void;
  toggleTarget: (institutionId: string) => { ok: boolean; reason?: string };
  toggleChecklistItem: (institutionId: string, item: string) => void;
  setLastPaper: (lastPaper: LastPaper) => void;
  recordTutorQuestion: () => void;
  tutorQuestionsLeftToday: () => number;
  joinGroup: (groupId: string) => void;
  addToRevisionPlan: (items: Omit<RevisionItem, 'addedAt'>[]) => void;
  removeFromRevisionPlan: (topicId: string) => void;
  updateSettings: (patch: Partial<AppSettings>) => void;
  addQuizRecord: (record: Omit<QuizRecord, 'id' | 'finishedAt'>) => void;
  notify: (n: Omit<AppNotification, 'id' | 'createdAt' | 'read'>) => void;
  markNotificationsRead: () => void;
  clearPracticeHistory: () => void;
}

const FREE: Entitlement = { plan: 'free', expiresAt: null, subjectPasses: [], unlockedPaperIds: [] };
const MAX_HISTORY = 50;
const MAX_NOTIFICATIONS = 40;

export const useSessionStore = create<SessionState>()(
  persist(
    (set, get) => ({
      hydrated: false,
      onboardingComplete: false,
      uid: null,
      phone: null,
      profile: null,
      entitlement: FREE,
      targets: [],
      checklist: {},
      lastPaper: null,
      tutorUsage: { day: todayKey(), count: 0 },
      joinedGroupIds: [],
      revisionPlan: [],
      settings: DEFAULT_SETTINGS,
      quizHistory: [],
      notifications: [],

      setHydrated: () => set({ hydrated: true }),
      saveProfile: (profile) => set({ profile }),
      completeOnboarding: () => set({ onboardingComplete: true }),
      signIn: (uid, phone) =>
        set((s) => ({ uid, phone, profile: s.profile ? { ...s.profile, uid } : s.profile })),
      signOut: () => set({ uid: null, phone: null, entitlement: FREE }),
      setEntitlement: (entitlement) => set({ entitlement }),

      unlockPaper: (paperId) =>
        set((s) => {
          const ids = s.entitlement.unlockedPaperIds ?? [];
          return ids.includes(paperId)
            ? s
            : { entitlement: { ...s.entitlement, unlockedPaperIds: [...ids, paperId] } };
        }),

      toggleTarget: (institutionId) => {
        const { targets } = get();
        if (targets.includes(institutionId)) {
          set({ targets: targets.filter((id) => id !== institutionId) });
          return { ok: true };
        }
        if (targets.length >= product.maxConcoursTargets) {
          return {
            ok: false,
            reason: `You can track up to ${product.maxConcoursTargets} Concours. Remove one first.`,
          };
        }
        set({ targets: [...targets, institutionId] });
        return { ok: true };
      },

      toggleChecklistItem: (institutionId, item) =>
        set((s) => {
          const current = s.checklist[institutionId] ?? [];
          const next = current.includes(item)
            ? current.filter((i) => i !== item)
            : [...current, item];
          return { checklist: { ...s.checklist, [institutionId]: next } };
        }),

      setLastPaper: (lastPaper) => set({ lastPaper }),

      recordTutorQuestion: () =>
        set((s) => {
          const day = todayKey();
          const count = s.tutorUsage.day === day ? s.tutorUsage.count + 1 : 1;
          return { tutorUsage: { day, count } };
        }),

      tutorQuestionsLeftToday: () => {
        const { tutorUsage, entitlement } = get();
        if (entitlement.plan === 'pass') return Number.POSITIVE_INFINITY;
        const used = tutorUsage.day === todayKey() ? tutorUsage.count : 0;
        return Math.max(0, product.freeTutorQuestionsPerDay - used);
      },

      joinGroup: (groupId) =>
        set((s) => ({
          joinedGroupIds: s.joinedGroupIds.includes(groupId)
            ? s.joinedGroupIds
            : [...s.joinedGroupIds, groupId],
        })),

      addToRevisionPlan: (items) =>
        set((s) => {
          const known = new Set(s.revisionPlan.map((r) => r.topicId));
          const fresh = items
            .filter((i) => !known.has(i.topicId))
            .map((i) => ({ ...i, addedAt: Date.now() }));
          return { revisionPlan: [...s.revisionPlan, ...fresh] };
        }),

      removeFromRevisionPlan: (topicId) =>
        set((s) => ({ revisionPlan: s.revisionPlan.filter((r) => r.topicId !== topicId) })),

      updateSettings: (patch) => set((s) => ({ settings: { ...s.settings, ...patch } })),

      addQuizRecord: (record) =>
        set((s) => ({
          quizHistory: [
            { ...record, id: createId(), finishedAt: Date.now() },
            ...s.quizHistory,
          ].slice(0, MAX_HISTORY),
        })),

      notify: (n) =>
        set((s) => ({
          notifications: [
            { ...n, id: createId(), createdAt: Date.now(), read: false },
            ...s.notifications,
          ].slice(0, MAX_NOTIFICATIONS),
        })),

      markNotificationsRead: () =>
        set((s) => ({ notifications: s.notifications.map((n) => ({ ...n, read: true })) })),

      clearPracticeHistory: () => set({ quizHistory: [], lastPaper: null, revisionPlan: [] }),
    }),
    {
      name: 'skyline-session',
      version: 2,
      storage: createJSONStorage(() => Storage),
      partialize: ({ hydrated: _hydrated, ...rest }) => rest,
      // v1 → v2: settings, quiz history, notifications and per-paper unlocks were added.
      migrate: (persisted) => {
        const s = (persisted ?? {}) as Partial<SessionState>;
        return {
          ...s,
          settings: { ...DEFAULT_SETTINGS, ...(s.settings ?? {}) },
          quizHistory: s.quizHistory ?? [],
          notifications: s.notifications ?? [],
          entitlement: { ...FREE, ...(s.entitlement ?? {}) },
        } as SessionState;
      },
      onRehydrateStorage: () => (state) => state?.setHydrated(),
    },
  ),
);

/** True when the Season Pass is active, or the subject has a per-subject pass. */
export function hasFullAccess(entitlement: Entitlement, subjectId?: string): boolean {
  const active =
    entitlement.plan === 'pass' &&
    (!entitlement.expiresAt || new Date(entitlement.expiresAt).getTime() > Date.now());
  return active || (!!subjectId && entitlement.subjectPasses.includes(subjectId));
}

/** Full Skyline answers for one paper: pass, subject pass, or the paper bought for 100 XAF. */
export function hasPaperAnswers(
  entitlement: Entitlement,
  paperId: string,
  subjectId?: string,
): boolean {
  return hasFullAccess(entitlement, subjectId) || (entitlement.unlockedPaperIds ?? []).includes(paperId);
}
