import { daysUntil } from '@/lib/dates';

export type SeasonPhase = 'foundation' | 'build' | 'final' | 'exams' | 'results';

export interface SeasonState {
  phase: SeasonPhase;
  daysToExam: number;
  headline: string;
  focus: string;
}

/** Roughly how long the GCE written papers run after the first paper. */
const EXAM_WINDOW_DAYS = 35;

/**
 * Season phases drive what Home emphasises. The exam start date comes from config so each
 * session can be updated without a release.
 */
export function getSeason(examStartISO: string, now: Date = new Date()): SeasonState {
  const days = daysUntil(examStartISO, now);

  if (days > 150) {
    return {
      phase: 'foundation',
      daysToExam: days,
      headline: `${days} days to the GCE`,
      focus: 'Build the habit: cover every topic once.',
    };
  }
  if (days > 60) {
    return {
      phase: 'build',
      daysToExam: days,
      headline: `${days} days to the GCE`,
      focus: 'Fix weak topics and start Paper 2 practice.',
    };
  }
  if (days > 0) {
    return {
      phase: 'final',
      daysToExam: days,
      headline: `${days} days to go`,
      focus: 'Timed papers and mocks only.',
    };
  }
  if (days > -EXAM_WINDOW_DAYS) {
    return {
      phase: 'exams',
      daysToExam: days,
      headline: 'GCE exams are on',
      focus: 'Quick revision for your next paper.',
    };
  }
  return {
    phase: 'results',
    daysToExam: days,
    headline: 'Your next step: Concours',
    focus: 'Check eligibility and application deadlines.',
  };
}
