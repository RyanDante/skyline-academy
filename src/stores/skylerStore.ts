import Storage from 'expo-sqlite/kv-store';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { skylerQuestions } from '@/data/skyler';
import type { QuickProfile } from '@/domain/skyler';
import type { OptionKey } from '@/types/models';

const QUESTION_COUNT = skylerQuestions.length;

interface SkylerState {
  /** One entry per question; null until answered. Saved after every answer (brief 7.3). */
  answers: (OptionKey | null)[];
  index: number;
  profile: QuickProfile | null;
  profileSkipped: boolean;
  /** Answers of the last finished quiz. The result itself is recomputed from current data. */
  result: { answers: OptionKey[]; completedAt: number } | null;

  setProfile: (profile: QuickProfile) => void;
  skipProfile: () => void;
  answer: (key: OptionKey) => void;
  back: () => void;
  complete: () => void;
  restart: () => void;
}

const empty = () => Array<OptionKey | null>(QUESTION_COUNT).fill(null);

export const useSkylerStore = create<SkylerState>()(
  persist(
    (set, get) => ({
      answers: empty(),
      index: 0,
      profile: null,
      profileSkipped: false,
      result: null,

      setProfile: (profile) => set({ profile, profileSkipped: false }),
      skipProfile: () => set({ profileSkipped: true }),

      answer: (key) =>
        set((s) => {
          const answers = [...s.answers];
          answers[s.index] = key;
          return { answers, index: Math.min(s.index + 1, QUESTION_COUNT - 1) };
        }),

      back: () => set((s) => ({ index: Math.max(0, s.index - 1) })),

      complete: () => {
        const { answers } = get();
        if (answers.some((a) => a === null)) return;
        set({ result: { answers: answers as OptionKey[], completedAt: Date.now() } });
      },

      restart: () => set({ answers: empty(), index: 0 }),
    }),
    {
      name: 'skyline-skyler',
      version: 1,
      storage: createJSONStorage(() => Storage),
    },
  ),
);

export function isQuizComplete(answers: (OptionKey | null)[]): boolean {
  return answers.length === QUESTION_COUNT && answers.every((a) => a !== null);
}
