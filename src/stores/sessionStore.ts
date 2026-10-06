import Storage from 'expo-sqlite/kv-store';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { product } from '@/lib/config';
import { todayKey } from '@/lib/dates';
import type { Entitlement, UserProfile } from '@/types/models';

export interface LastPaper {
  paperId: string;
  title: string;
  position: number;
  total: number;
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

  setHydrated: () => void;
  saveProfile: (profile: UserProfile) => void;
  completeOnboarding: () => void;
  signIn: (uid: string, phone: string | null) => void;
  signOut: () => void;
  setEntitlement: (entitlement: Entitlement) => void;
  toggleTarget: (institutionId: string) => { ok: boolean; reason?: string };
  toggleChecklistItem: (institutionId: string, item: string) => void;
  setLastPaper: (lastPaper: LastPaper) => void;
  recordTutorQuestion: () => void;
  tutorQuestionsLeftToday: () => number;
  joinGroup: (groupId: string) => void;
}

const FREE: Entitlement = { plan: 'free', expiresAt: null, subjectPasses: [] };

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

      setHydrated: () => set({ hydrated: true }),
      saveProfile: (profile) => set({ profile }),
      completeOnboarding: () => set({ onboardingComplete: true }),
      signIn: (uid, phone) =>
        set((s) => ({ uid, phone, profile: s.profile ? { ...s.profile, uid } : s.profile })),
      signOut: () => set({ uid: null, phone: null, entitlement: FREE }),
      setEntitlement: (entitlement) => set({ entitlement }),

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
    }),
    {
      name: 'skyline-session',
      version: 1,
      storage: createJSONStorage(() => Storage),
      partialize: ({ hydrated: _hydrated, ...rest }) => rest,
      onRehydrateStorage: () => (state) => state?.setHydrated(),
    },
  ),
);

/** True when the student can see everything for this subject. */
export function hasFullAccess(entitlement: Entitlement, subjectId?: string): boolean {
  const active =
    entitlement.plan === 'pass' &&
    (!entitlement.expiresAt || new Date(entitlement.expiresAt).getTime() > Date.now());
  return active || (!!subjectId && entitlement.subjectPasses.includes(subjectId));
}
