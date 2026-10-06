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
