/**
 * Study statistics for Home and Me: streak, weekly goal, overall progress.
 * All computed from real attempts (no placeholder numbers).
 */
import { startOfDay } from '@/lib/dates';
import type { Attempt } from '@/types/models';

const DAY_MS = 86_400_000;

function dayIndex(ts: number): number {
  return Math.floor(startOfDay(new Date(ts)).getTime() / DAY_MS);
}

/** Distinct study days (local), newest first. */
export function studyDays(attempts: Attempt[]): number[] {
  return [...new Set(attempts.map((a) => dayIndex(a.createdAt)))].sort((a, b) => b - a);
}

/**
 * Consecutive days with at least one answered question, ending today — or yesterday, so a
 * streak isn't "lost" in the morning before the student has studied.
 */
export function currentStreak(attempts: Attempt[], now = Date.now()): number {
  const days = new Set(studyDays(attempts));
  const today = dayIndex(now);
  let cursor = days.has(today) ? today : today - 1;
  let streak = 0;
  while (days.has(cursor)) {
    streak += 1;
    cursor -= 1;
  }
  return streak;
}

export function bestStreak(attempts: Attempt[]): number {
  const days = studyDays(attempts).sort((a, b) => a - b);
  let best = 0;
  let run = 0;
  let prev: number | null = null;
  for (const d of days) {
    run = prev !== null && d === prev + 1 ? run + 1 : 1;
    best = Math.max(best, run);
    prev = d;
  }
  return best;
}

export function studiedToday(attempts: Attempt[], now = Date.now()): boolean {
  const today = dayIndex(now);
  return attempts.some((a) => dayIndex(a.createdAt) === today);
}

export function answeredToday(attempts: Attempt[], now = Date.now()): number {
  const today = dayIndex(now);
  return attempts.filter((a) => dayIndex(a.createdAt) === today).length;
}

export interface WeekDay {
  /** Mon … Sun */
  label: string;
  answered: number;
  isToday: boolean;
  isFuture: boolean;
}

export interface WeekSummary {
  days: WeekDay[];
  total: number;
  correct: number;
  activeDays: number;
  /** null when no questions this week */
  accuracy: number | null;
}

const LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

/** Monday-to-Sunday summary of the current week. */
export function weekSummary(attempts: Attempt[], now = Date.now()): WeekSummary {
  const today = startOfDay(new Date(now));
  const mondayOffset = (today.getDay() + 6) % 7;
  const monday = dayIndex(today.getTime()) - mondayOffset;
  const todayIdx = dayIndex(now);

  const days: WeekDay[] = LABELS.map((label, i) => ({
    label,
    answered: 0,
    isToday: monday + i === todayIdx,
    isFuture: monday + i > todayIdx,
  }));
  let total = 0;
  let correct = 0;
  for (const a of attempts) {
    const i = dayIndex(a.createdAt) - monday;
    if (i < 0 || i > 6) continue;
    days[i]!.answered += 1;
    total += 1;
    if (a.correct) correct += 1;
  }
  return {
    days,
    total,
    correct,
    activeDays: days.filter((d) => d.answered > 0).length,
    accuracy: total ? correct / total : null,
  };
}

/** Overall accuracy across everything answered, or null before any practice. */
export function overallAccuracy(attempts: Attempt[]): number | null {
  if (attempts.length === 0) return null;
  return attempts.filter((a) => a.correct).length / attempts.length;
}
