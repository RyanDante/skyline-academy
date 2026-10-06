import { doc, getDoc, serverTimestamp, setDoc } from '@react-native-firebase/firestore';

import { config } from '@/lib/config';
import { COLLECTIONS, db } from '@/lib/firebase';
import type { Entitlement, UserProfile } from '@/types/models';

export const profileService = {
  /** Merges the local profile into users/{uid}. Entitlements are written only by Cloud Functions. */
  async save(uid: string, profile: UserProfile): Promise<void> {
    if (config.useMocks) return;
    const { uid: _ignored, ...rest } = profile;
    await setDoc(
      doc(db(), COLLECTIONS.users, uid),
      { profile: rest, updatedAt: serverTimestamp() },
      { merge: true },
    );
  },

  async entitlement(uid: string): Promise<Entitlement | null> {
    if (config.useMocks) return null;
    const snap = await getDoc(doc(db(), COLLECTIONS.users, uid));
    const data = snap.data() as { entitlement?: Entitlement } | undefined;
    return data?.entitlement ?? null;
  },
};
