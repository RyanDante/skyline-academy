import Storage from 'expo-sqlite/kv-store';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import type { TutorMode } from '@/services/tutor';
import type { Level, OptionKey, Question } from '@/types/models';

export type TutorScope = 'topics' | 'whole';
export type TutorSource = 'mix' | 'paper';

export interface TutorSetup {
  level: Level;
  subjectId?: string;
  scope: TutorScope;
  topicIds: string[];
  source: TutorSource;
  paperId?: string;
  count: 5 | 10 | 20;
}

export type ThreadKind =
  | 'student' // the student's typed answer or message
  | 'tutor' // an AI reply
  | 'skyline-solution' // Skyline's own worked solution (rendered from the solution record)
  | 'ai-solution' // AI-written explanation, labelled "check with your teacher"
  | 'note'; // short system feedback, e.g. "Correct" after an MCQ

export interface ThreadItem {
  id: string;
  kind: ThreadKind;
  text: string;
  imageUri?: string;
  pending?: boolean;
  error?: boolean;
}

export interface AnswerState {
  selectedKey?: OptionKey;
  typed?: string;
  /** null = answered but not auto-markable (AI feedback only). */
  correct: boolean | null;
}

interface SessionState {
  subjectId: string;
  title: string;
  questions: Question[];
  index: number;
  mode: TutorMode;
  answers: Record<string, AnswerState>;
  /** Chat thread per question id. The key '' holds topic chat when there are no questions. */
  threads: Record<string, ThreadItem[]>;
  topicNames: string[];
  startedAt: number;
  finishedAt: number | null;
}

interface GceTutorState {
  /** Remembered between visits (brief 6.2: "Remember the last choice"). */
  lastLevel: Level | null;
  session: SessionState | null;

  rememberLevel: (level: Level) => void;
  startSession: (args: {
    subjectId: string;
    title: string;
    questions: Question[];
    mode: TutorMode;
    topicNames: string[];
  }) => void;
  setMode: (mode: TutorMode) => void;
  goTo: (index: number) => void;
  answer: (questionId: string, answer: AnswerState) => void;
  addToThread: (key: string, item: ThreadItem) => void;
  updateThread: (key: string, id: string, patch: Partial<ThreadItem>) => void;
  finish: () => void;
  clear: () => void;
}

export const useGceTutorStore = create<GceTutorState>()(
  persist(
    (set) => ({
      lastLevel: null,
      session: null,

      rememberLevel: (level) => set({ lastLevel: level }),

      startSession: ({ subjectId, title, questions, mode, topicNames }) =>
        set({
          session: {
            subjectId,
            title,
            questions,
            index: 0,
            mode,
            answers: {},
            threads: {},
            topicNames,
            startedAt: Date.now(),
            finishedAt: null,
          },
        }),

      setMode: (mode) => set((s) => (s.session ? { session: { ...s.session, mode } } : s)),

      goTo: (index) =>
        set((s) =>
          s.session
            ? {
                session: {
                  ...s.session,
                  index: Math.max(0, Math.min(index, s.session.questions.length - 1)),
                },
              }
            : s,
        ),

      answer: (questionId, answer) =>
        set((s) =>
          s.session
            ? { session: { ...s.session, answers: { ...s.session.answers, [questionId]: answer } } }
            : s,
        ),

      addToThread: (key, item) =>
        set((s) =>
          s.session
            ? {
                session: {
                  ...s.session,
                  threads: { ...s.session.threads, [key]: [...(s.session.threads[key] ?? []), item] },
                },
              }
            : s,
        ),

      updateThread: (key, id, patch) =>
        set((s) =>
          s.session
            ? {
                session: {
                  ...s.session,
                  threads: {
                    ...s.session.threads,
                    [key]: (s.session.threads[key] ?? []).map((m) =>
                      m.id === id ? { ...m, ...patch } : m,
                    ),
                  },
                },
              }
            : s,
        ),

      finish: () =>
        set((s) => (s.session ? { session: { ...s.session, finishedAt: Date.now() } } : s)),

      clear: () => set({ session: null }),
    }),
    {
      name: 'skyline-gce-tutor',
      version: 1,
      storage: createJSONStorage(() => Storage),
      // Only the level preference survives restarts; sessions are in-memory.
      partialize: (s) => ({ lastLevel: s.lastLevel }),
    },
  ),
);
