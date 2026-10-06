import { doc, serverTimestamp, writeBatch } from '@react-native-firebase/firestore';

import { attemptsRepo } from '@/db/attemptsRepo';
import { config } from '@/lib/config';
import { COLLECTIONS, db } from '@/lib/firebase';
import { useSessionStore } from '@/stores/sessionStore';
import type { Attempt } from '@/types/models';

let syncing = false;

export const attemptsService = {
  /** Saves locally first (works offline), then tries to sync. */
  async record(attempts: Attempt[]): Promise<void> {
    await attemptsRepo.insertMany(attempts);
    void this.sync();
  },

  all: () => attemptsRepo.all(),

  /** Pushes unsynced attempts to users/{uid}/attempts. Safe to call often. */
  async sync(): Promise<number> {
    const uid = useSessionStore.getState().uid;
    if (config.useMocks || !uid || syncing) return 0;

    syncing = true;
    let pushed = 0;
    try {
      // Firestore batches cap at 500 writes; 200 keeps each request small on slow networks.
      for (;;) {
        const pending = await attemptsRepo.unsynced(200);
        if (pending.length === 0) break;

        const batch = writeBatch(db());
        for (const a of pending) {
          batch.set(doc(db(), COLLECTIONS.users, uid, COLLECTIONS.attempts, a.id), {
            ...a,
            syncedAt: serverTimestamp(),
          });
        }
        await batch.commit();
        await attemptsRepo.markSynced(pending.map((a) => a.id));
        pushed += pending.length;
      }
    } finally {
      syncing = false;
    }
    return pushed;
  },
};
