import { collection, doc, getDoc, getDocs, query, where } from '@react-native-firebase/firestore';

import { concoursSectors } from '@/data/concoursSectors';
import * as seed from '@/data/seed';
import { COLLECTIONS, db } from '@/lib/firebase';
import type { ConcoursSector, Institution, PathwayFamily, PathwayFamilyId, SectorId } from '@/types/models';

import { cachedFetch } from './cachedFetch';

export const concoursService = {
  sectors: () =>
    cachedFetch(
      'sectors',
      async () => {
        const snap = await getDocs(collection(db(), COLLECTIONS.sectors));
        return snap.docs
          .map((d) => ({ ...(d.data() as ConcoursSector), id: d.id as SectorId }))
          .sort((a, b) => a.order - b.order);
      },
      () => concoursSectors,
    ),

  sector: (id: SectorId) =>
    cachedFetch(
      `sector:${id}`,
      async () => {
        const snap = await getDoc(doc(db(), COLLECTIONS.sectors, id));
        const data = snap.data();
        return data ? { ...(data as ConcoursSector), id: snap.id as SectorId } : null;
      },
      () => concoursSectors.find((s) => s.id === id) ?? null,
    ),

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
