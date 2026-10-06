import type { Question } from '@/types/models';

const STOP_WORDS = new Set(
  'a an the of and or to in on at is are was were be by for with what which how find calculate show that this its it'.split(
    ' ',
  ),
);

function tokens(text: string): Set<string> {
  return new Set(
    text
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, ' ')
      .split(/\s+/)
      .filter((w) => w.length > 2 && !STOP_WORDS.has(w)),
  );
}

/**
 * Cheap keyword overlap between a student's question and stored questions. Runs on-device
 * before any AI call: a good match means a teacher-written solution already exists.
 */
export function findRelatedQuestions(text: string, pool: Question[], limit = 3): Question[] {
  const query = tokens(text);
  if (query.size === 0) return [];

  return pool
    .map((q) => {
      const words = tokens(q.stem);
      let overlap = 0;
      for (const w of query) if (words.has(w)) overlap += 1;
      return { q, score: overlap / Math.sqrt(words.size || 1) };
    })
    .filter((r) => r.score > 0.35)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((r) => r.q);
}
