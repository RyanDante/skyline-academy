import type { Difficulty, OptionKey, Question } from '@/types/models';

export interface QuizFilters {
  subjectId: string;
  topicIds: string[];
  difficulty: Difficulty | 'any';
  count: number;
}

/** Fisher–Yates shuffle (returns a new array). */
export function shuffle<T>(items: T[], random: () => number = Math.random): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [copy[i], copy[j]] = [copy[j]!, copy[i]!];
  }
  return copy;
}

/** Auto-markable questions matching the filters, shuffled and capped at `count`. */
export function buildQuiz(pool: Question[], filters: QuizFilters): Question[] {
  const matches = pool.filter(
    (q) =>
      q.type === 'mcq' &&
      q.subjectId === filters.subjectId &&
      (filters.topicIds.length === 0 || q.topicIds.some((id) => filters.topicIds.includes(id))) &&
      (filters.difficulty === 'any' || q.difficulty === filters.difficulty),
  );
  return shuffle(matches).slice(0, filters.count);
}

export interface TutorPick {
  subjectId: string;
  /** Empty = whole subject. */
  topicIds: string[];
  /** A specific paper, or every paper ("mix"). */
  paperId?: string;
  count: number;
}

/**
 * Questions for a GCE Tutor session, any type (MCQ and structured), taken only from the
 * past-paper bank. A specific paper keeps paper order; a mix is shuffled.
 */
export function pickTutorQuestions(pool: Question[], pick: TutorPick): Question[] {
  const matches = pool.filter(
    (q) =>
      q.subjectId === pick.subjectId &&
      (!pick.paperId || q.paperId === pick.paperId) &&
      (pick.topicIds.length === 0 || q.topicIds.some((id) => pick.topicIds.includes(id))),
  );
  const ordered = pick.paperId ? [...matches].sort((a, b) => a.order - b.order) : shuffle(matches);
  return ordered.slice(0, pick.count);
}

/** Questions available per topic, for the topic picker. */
export function countByTopic(pool: Question[]): Map<string, number> {
  const counts = new Map<string, number>();
  for (const q of pool) for (const t of q.topicIds) counts.set(t, (counts.get(t) ?? 0) + 1);
  return counts;
}

/**
 * Marks a typed numeric answer against the question's stored value and tolerance, so simple
 * calculations are checked on-device without an AI call. Returns null when it can't decide.
 */
export function checkNumericAnswer(question: Question, typed: string): boolean | null {
  const expected = question.numericAnswer;
  if (!expected) return null;
  const match = typed.replace(/,/g, '.').match(/-?\d+(\.\d+)?/);
  if (!match) return null;
  return Math.abs(Number(match[0]) - expected.value) <= expected.tolerance;
}

export function isCorrect(question: Question, selected: OptionKey | null): boolean {
  return selected !== null && question.correctKey === selected;
}

export interface QuizScore {
  correct: number;
  total: number;
  ratio: number;
}

export function scoreQuiz(questions: Question[], answers: Record<string, OptionKey | null>): QuizScore {
  const correct = questions.filter((q) => isCorrect(q, answers[q.id] ?? null)).length;
  return { correct, total: questions.length, ratio: questions.length ? correct / questions.length : 0 };
}
