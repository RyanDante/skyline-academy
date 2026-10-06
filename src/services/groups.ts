import {
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
} from '@react-native-firebase/firestore';

import * as seed from '@/data/seed';
import { config } from '@/lib/config';
import { weekKey } from '@/lib/dates';
import { COLLECTIONS, callable, db } from '@/lib/firebase';
import type { ClassGroup, LeaderboardEntry } from '@/types/models';

const joinGroupByCode = callable<{ code: string }, ClassGroup>('joinGroup');

export const groupsService = {
  async byIds(ids: string[]): Promise<ClassGroup[]> {
    if (config.useMocks) return seed.groups.filter((g) => ids.includes(g.id));
    const docs = await Promise.all(ids.map((id) => getDoc(doc(db(), COLLECTIONS.groups, id))));
    return docs.flatMap((snap) => {
      const data = snap.data();
      return data ? [{ ...(data as ClassGroup), id: snap.id }] : [];
    });
  },

  async join(code: string): Promise<ClassGroup> {
    const clean = code.trim().toUpperCase();
    if (config.useMocks) {
      const group = seed.groups.find((g) => g.joinCode === clean);
      if (!group) throw new Error('No group uses that code. Check it with your teacher.');
      return group;
    }
    return joinGroupByCode({ code: clean });
  },

  /** Weekly leaderboard, maintained by the aggregateAttempt Cloud Function. */
  async leaderboard(groupId: string): Promise<LeaderboardEntry[]> {
    if (config.useMocks) return seed.leaderboard;
    const snap = await getDocs(
      query(
        collection(db(), COLLECTIONS.groups, groupId, 'weeks', weekKey(), COLLECTIONS.members),
        orderBy('correctThisWeek', 'desc'),
        limit(50),
      ),
    );
    return snap.docs.map((d) => ({ ...(d.data() as LeaderboardEntry), uid: d.id }));
  },
};
