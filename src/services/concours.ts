import { collection, doc, getDoc, getDocs, query, where } from '@react-native-firebase/firestore';

import * as seed from '@/data/seed';
import { COLLECTIONS, db } from '@/lib/firebase';
import type { Institution, PathwayFamily, PathwayFamilyId } from '@/types/models';

import { cachedFetch } from './cachedFetch';

export const concoursService = {
  families: () =>
    cachedFetch(
      'families',
      async () => {
        const snap = await getDocs(collection(db(), COLLECTIONS.families));
        return snap.docs.map((d) => ({ ...(d.data() as PathwayFamily), id: d.id as PathwayFamilyId }));
      },
      () => seed.families,
    ),

  institutions: (familyId?: PathwayFamilyId) =>
    cachedFetch(
      `institutions:${familyId ?? 'all'}`,
      async () => {
        const base = collection(db(), COLLECTIONS.institutions);
        const snap = await getDocs(familyId ? query(base, where('familyId', '==', familyId)) : base);
        return snap.docs.map((d) => ({ ...(d.data() as Institution), id: d.id }));
      },
      () => (familyId ? seed.institutions.filter((i) => i.familyId === familyId) : seed.institutions),
    ),

  institution: (id: string) =>
    cachedFetch(
      `institution:${id}`,
      async () => {
        const snap = await getDoc(doc(db(), COLLECTIONS.institutions, id));
        const data = snap.data();
        return data ? { ...(data as Institution), id: snap.id } : null;
      },
      () => seed.institutions.find((i) => i.id === id) ?? null,
    ),
};

/**
 * Institutions whose expected A-Level subjects the student takes.
 * Eligibility rules are simplified; each institution's `requirements` text is the source of truth.
 */
export function isLikelyEligible(
  family: PathwayFamily,
  studentSubjectNames: string[],
): { eligible: boolean; missing: string[] } {
  const taken = studentSubjectNames.map((n) => n.toLowerCase());
  const missing = family.expectedALevels.filter(
    (needed) => !taken.some((name) => name.includes(needed.toLowerCase().replace('pure ', ''))),
  );
  return { eligible: missing.length === 0, missing };
}
