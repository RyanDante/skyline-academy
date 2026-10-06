import { create } from 'zustand';

import type { AttemptSource, OptionKey, Question } from '@/types/models';

interface QuizState {
  title: string;
  source: AttemptSource;
  questions: Question[];
  answers: Record<string, OptionKey | null>;
  timeSpent: Record<string, number>;
  index: number;
  startedAt: number | null;
  questionStartedAt: number | null;
  /** Time limit in ms for timed mocks; null = untimed practice. */
  timeLimitMs: number | null;
  finishedAt: number | null;

  start: (opts: {
    title: string;
    source: AttemptSource;
    questions: Question[];
    timeLimitMs?: number | null;
  }) => void;
  answer: (questionId: string, key: OptionKey) => void;
  goTo: (index: number) => void;
  finish: () => void;
  reset: () => void;
}

const initial = {
  title: '',
  source: 'quiz' as AttemptSource,
  questions: [],
  answers: {},
  timeSpent: {},
  index: 0,
  startedAt: null,
  questionStartedAt: null,
  timeLimitMs: null,
  finishedAt: null,
};

/** In-memory state for the active quiz or mock. Attempts are persisted on finish. */
export const useQuizStore = create<QuizState>()((set, get) => {
  /** Adds the time spent on the current question before moving away from it. */
  const banked = () => {
    const { questions, index, questionStartedAt, timeSpent } = get();
    const current = questions[index];
    if (!current || questionStartedAt === null) return timeSpent;
    return {
      ...timeSpent,
      [current.id]: (timeSpent[current.id] ?? 0) + (Date.now() - questionStartedAt),
    };
  };

  return {
    ...initial,

    start: ({ title, source, questions, timeLimitMs = null }) =>
      set({
        ...initial,
        title,
        source,
        questions,
        timeLimitMs,
        startedAt: Date.now(),
        questionStartedAt: Date.now(),
      }),

    answer: (questionId, key) => set((s) => ({ answers: { ...s.answers, [questionId]: key } })),

    goTo: (index) =>
      set((s) => ({
        timeSpent: banked(),
        index: Math.max(0, Math.min(index, s.questions.length - 1)),
        questionStartedAt: Date.now(),
      })),

    finish: () => set({ timeSpent: banked(), finishedAt: Date.now(), questionStartedAt: null }),

    reset: () => set(initial),
  };
});
