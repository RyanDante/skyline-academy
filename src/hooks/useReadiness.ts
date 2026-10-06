import { useMemo } from 'react';

import { computeTopicMastery } from '@/domain/mastery';
import { computeReadiness } from '@/domain/readiness';
import type { Institution, Readiness, TopicMastery } from '@/types/models';

import { useAttempts } from './queries';

/** Readiness for each institution, recomputed from local attempts (works offline). */
export function useReadiness(institutions: Institution[] | undefined): Map<string, Readiness> {
  const { data: attempts } = useAttempts();
  return useMemo(() => {
    const map = new Map<string, Readiness>();
    for (const inst of institutions ?? []) {
      map.set(inst.id, computeReadiness(inst, attempts ?? []));
    }
    return map;
  }, [institutions, attempts]);
}

export function useTopicMastery(): Map<string, TopicMastery> {
  const { data: attempts } = useAttempts();
  return useMemo(() => computeTopicMastery(attempts ?? []), [attempts]);
}
