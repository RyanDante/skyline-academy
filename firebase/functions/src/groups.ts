import { FieldValue } from 'firebase-admin/firestore';
import { onDocumentCreated } from 'firebase-functions/v2/firestore';
import { HttpsError, onCall } from 'firebase-functions/v2/https';

import { db, requireUid, weekKey } from './admin.js';
import { REGION } from './config.js';

/** Joins a class group by its code. Groups are created by Skyline staff or teachers (admin). */
export const joinGroup = onCall({ region: REGION }, async (request) => {
  const uid = requireUid(request);
  const code = String((request.data as { code?: string })?.code ?? '').trim().toUpperCase();
  if (code.length < 4 || code.length > 20) throw new HttpsError('invalid-argument', 'Check the code.');

  const match = await db.collection('groups').where('joinCode', '==', code).limit(1).get();
  const groupDoc = match.docs[0];
  if (!groupDoc) throw new HttpsError('not-found', 'No group uses that code. Check it with your teacher.');

  const rosterRef = groupDoc.ref.collection('roster').doc(uid);
  await db.runTransaction(async (tx) => {
    if ((await tx.get(rosterRef)).exists) return;
    tx.set(rosterRef, { joinedAt: FieldValue.serverTimestamp() });
    tx.update(groupDoc.ref, { memberCount: FieldValue.increment(1) });
    tx.set(db.collection('users').doc(uid), { groupIds: FieldValue.arrayUnion(groupDoc.id) }, { merge: true });
  });

  const fresh = await groupDoc.ref.get();
  return { id: fresh.id, ...fresh.data() };
});

/**
 * Keeps weekly leaderboards current: each correct attempt adds one point to the student's row in
 * every group they belong to. Leaderboards reset by being keyed on the ISO week.
 */
export const aggregateAttempt = onDocumentCreated(
  { document: 'users/{uid}/attempts/{attemptId}', region: REGION },
  async (event) => {
    const attempt = event.data?.data();
    if (!attempt?.correct) return;

    const uid = event.params.uid;
    const user = await db.collection('users').doc(uid).get();
    const groupIds = (user.get('groupIds') as string[] | undefined) ?? [];
    if (groupIds.length === 0) return;

    const profile = (user.get('profile') as { firstName?: string; schoolName?: string } | undefined) ?? {};
    const week = weekKey();
    const batch = db.batch();
    for (const groupId of groupIds) {
      batch.set(
        db.collection('groups').doc(groupId).collection('weeks').doc(week).collection('members').doc(uid),
        {
          displayName: profile.firstName ?? 'Student',
          schoolName: profile.schoolName ?? null,
          correctThisWeek: FieldValue.increment(1),
        },
        { merge: true },
      );
    }
    await batch.commit();
  },
);
