import type {
  Attempt,
  Institution,
  Readiness,
  TopicReadiness,
  TopicStatus,
} from '@/types/models';

import { computeTopicMastery } from './mastery';

const STRONG_AT = 0.7;
const WEAK_BELOW = 0.5;

function statusFor(coverage: string, mastery: number | null): TopicStatus {
  if (coverage === 'none') return 'gap';
  if (mastery === null) return 'untested';
  if (mastery >= STRONG_AT) return 'strong';
  if (mastery < WEAK_BELOW) return 'weak';
  return 'developing';
}

/**
 * Academic readiness for one institution: mastery weighted by each topic's share of the
 * Concours marks, averaged across academic sections.
 *
 * Wording rule: this measures preparation on what the exam tests. It is never a
 * probability of admission, and the UI must never present it as one.
 */
export function computeReadiness(institution: Institution, attempts: Attempt[]): Readiness {
  const mastery = computeTopicMastery(attempts);
  const academic = institution.sections.filter((s) => s.kind === 'academic');

  const topics: TopicReadiness[] = [];
  let sectionScoreSum = 0;

  for (const section of academic) {
    let weighted = 0;
    let weightSum = 0;
    for (const topic of section.topics) {
      const m = mastery.get(topic.topicId);
      const value = topic.coverage === 'none' ? null : (m?.mastery ?? null);
      // Untested and gap topics count as 0: readiness only rises with evidence.
      weighted += topic.weight * (value ?? 0);
      weightSum += topic.weight;
      topics.push({
        topicId: topic.topicId,
        name: topic.name,
        weight: topic.weight / Math.max(academic.length, 1),
        attempts: m?.attempts ?? 0,
        mastery: value,
        status: statusFor(topic.coverage, value),
      });
    }
    sectionScoreSum += weightSum > 0 ? weighted / weightSum : 0;
  }

  const relevantTopicIds = new Set(topics.map((t) => t.topicId));
  const questionsAnswered = attempts.filter((a) =>
    a.topicIds.some((id) => relevantTopicIds.has(id)),
  ).length;

  const order: Record<TopicStatus, number> = { weak: 0, developing: 1, untested: 2, strong: 3, gap: 4 };
  topics.sort((a, b) => order[a.status] - order[b.status] || b.weight - a.weight);

  return {
    institutionId: institution.id,
    score: academic.length > 0 ? sectionScoreSum / academic.length : 0,
    questionsAnswered,
    topics,
    nonAcademicSections: institution.sections
      .filter((s) => s.kind === 'non-academic')
      .map((s) => s.name),
  };
}

/** The highest-weight weak (or else untested) topic: what to practise next. */
export function nextFocusTopic(readiness: Readiness): TopicReadiness | null {
  const byWeight = [...readiness.topics].sort((a, b) => b.weight - a.weight);
  return (
    byWeight.find((t) => t.status === 'weak') ??
    byWeight.find((t) => t.status === 'untested') ??
    byWeight.find((t) => t.status === 'developing') ??
    null
  );
}
