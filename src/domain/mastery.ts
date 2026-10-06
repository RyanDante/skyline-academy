import { product } from '@/lib/config';
import type { Attempt, TopicMastery } from '@/types/models';

const DAY_MS = 86_400_000;
/** An attempt from 21 days ago counts half as much as one from today. */
const HALF_LIFE_DAYS = 21;

/**
 * Recency-weighted accuracy per topic. Topics with fewer than
 * `product.minAttemptsForMastery` attempts get `mastery: null` ("untested").
 */
export function computeTopicMastery(
  attempts: Attempt[],
  now: number = Date.now(),
): Map<string, TopicMastery> {
  const acc = new Map<string, { count: number; weighted: number; weightSum: number }>();

  for (const attempt of attempts) {
    const ageDays = Math.max(0, (now - attempt.createdAt) / DAY_MS);
    const w = Math.pow(0.5, ageDays / HALF_LIFE_DAYS);
    for (const topicId of attempt.topicIds) {
      const entry = acc.get(topicId) ?? { count: 0, weighted: 0, weightSum: 0 };
      entry.count += 1;
      entry.weightSum += w;
      entry.weighted += attempt.correct ? w : 0;
      acc.set(topicId, entry);
    }
  }

  const result = new Map<string, TopicMastery>();
  for (const [topicId, { count, weighted, weightSum }] of acc) {
    result.set(topicId, {
      topicId,
      attempts: count,
      mastery:
        count >= product.minAttemptsForMastery && weightSum > 0 ? weighted / weightSum : null,
    });
  }
  return result;
}

/** Plain accuracy over a set of attempts, for subject-level progress bars. */
export function accuracy(attempts: Attempt[]): number | null {
  if (attempts.length === 0) return null;
  return attempts.filter((a) => a.correct).length / attempts.length;
}
