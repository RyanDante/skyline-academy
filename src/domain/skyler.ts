/**
 * Skyler's scoring (design brief 7.5). Everything here is deterministic code over the quiz
 * answers and the Concours data. No language model decides scores, requirements or eligibility.
 */
import { SECTOR_NEEDS, skylerQuestions, type SkylerStage } from '@/data/skyler';
import type { ConcoursField, ConcoursSector, OptionKey, SectorId } from '@/types/models';

export const SECTOR_IDS: SectorId[] = ['health', 'engineering', 'agriculture', 'administration', 'teaching'];

export type MatchStrength = 'strong' | 'good' | 'possible';

export interface SectorScore {
  sectorId: SectorId;
  points: number;
}

export interface SkylerResult {
  /** All sectors, best first. */
  ranking: SectorScore[];
  /** One sector, or two when the top two are within 1 point ("co-matches"). */
  matches: SectorId[];
  strength: MatchStrength;
  /** Friendly explanation built from the student's own answers. */
  why: string;
}

/** Strength thresholds from the brief; tune after a pilot with real students. */
export function strengthFor(points: number): MatchStrength {
  if (points >= 11) return 'strong';
  if (points >= 7) return 'good';
  return 'possible';
}

export const STRENGTH_LABEL: Record<MatchStrength, string> = {
  strong: 'Strong match',
  good: 'Good match',
  possible: 'Possible match',
};

/** +2 to the primary sector of each answer, +1 to its secondary. */
export function scoreAnswers(answers: (OptionKey | null)[]): SectorScore[] {
  const points = new Map<SectorId, number>(SECTOR_IDS.map((id) => [id, 0]));
  skylerQuestions.forEach((question, i) => {
    const option = question.options.find((o) => o.key === answers[i]);
    if (!option) return;
    points.set(option.primary, (points.get(option.primary) ?? 0) + 2);
    if (option.secondary) points.set(option.secondary, (points.get(option.secondary) ?? 0) + 1);
  });
  // Ties keep the fixed sector order so results are stable.
  return SECTOR_IDS.map((sectorId) => ({ sectorId, points: points.get(sectorId) ?? 0 })).sort(
    (a, b) => b.points - a.points,
  );
}

function joinReasons(reasons: string[]): string {
  if (reasons.length === 0) return '';
  if (reasons.length === 1) return reasons[0]!;
  return `${reasons.slice(0, -1).join(', ')} and ${reasons.at(-1)}`;
}

/** "You enjoy looking after people and stay calm under pressure. Health careers need …" */
export function buildWhy(answers: (OptionKey | null)[], sectorId: SectorId): string {
  const reasons = skylerQuestions
    .map((q, i) => q.options.find((o) => o.key === answers[i]))
    .filter((o) => o?.primary === sectorId)
    .map((o) => o!.reason)
    .slice(0, 3);
  const lead = reasons.length > 0 ? `You ${joinReasons(reasons)}. ` : '';
  return `${lead}${SECTOR_NEEDS[sectorId]}`;
}

export function computeResult(answers: (OptionKey | null)[]): SkylerResult {
  const ranking = scoreAnswers(answers);
  const [first, second] = ranking;
  const coMatch = !!first && !!second && first.points - second.points <= 1;
  const matches = coMatch ? [first!.sectorId, second!.sectorId] : [first!.sectorId];
  return {
    ranking,
    matches,
    strength: strengthFor(first?.points ?? 0),
    why: buildWhy(answers, first!.sectorId),
  };
}

// ─── Eligibility (brief 7.5, step 4) ─────────────────────────────────────────

export interface QuickProfile {
  stage: SkylerStage;
  /** Subject names, e.g. "Biology", "Pure Mathematics". */
  subjects: string[];
}

export interface FieldFit {
  field: ConcoursField;
  eligible: boolean;
  /** e.g. "Needs: Chemistry at A Level". Empty when eligible. */
  needs: string[];
}

function hasSubject(studentSubjects: string[], required: string): boolean {
  const want = required.toLowerCase();
  return studentSubjects.some((s) => {
    const have = s.toLowerCase();
    return have.includes(want) || want.includes(have);
  });
}

export function fieldFit(field: ConcoursField, profile: QuickProfile): FieldFit {
  const needs: string[] = [];
  if (field.entryLevel === 'after-degree') {
    needs.push('Needs: a Licence (Bachelor’s degree) first');
  } else if (field.entryLevel === 'after-a-level' && profile.stage === 'form5') {
    needs.push('Needs: A Level first');
  }
  for (const subject of field.requiredSubjects) {
    if (!hasSubject(profile.subjects, subject)) needs.push(`Needs: ${subject} at A Level`);
  }
  return { field, eligible: needs.length === 0, needs };
}

/**
 * Up to `limit` fields for a sector, fields the student already qualifies for first.
 * Without a profile, fields keep their original order and carry no "Needs" notes.
 */
export function bestFields(sector: ConcoursSector, profile: QuickProfile | null, limit = 3): FieldFit[] {
  const fits = sector.fields.map((field) =>
    profile ? fieldFit(field, profile) : { field, eligible: true, needs: [] },
  );
  return [...fits.filter((f) => f.eligible), ...fits.filter((f) => !f.eligible)].slice(0, limit);
}

/** Required subjects across a sector's fields, most common first. */
export function sectorRequiredSubjects(sector: ConcoursSector): string[] {
  const counts = new Map<string, number>();
  for (const f of sector.fields) for (const s of f.requiredSubjects) counts.set(s, (counts.get(s) ?? 0) + 1);
  return [...counts.entries()].sort((a, b) => b[1] - a[1]).map(([s]) => s);
}
