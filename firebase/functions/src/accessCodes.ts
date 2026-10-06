import { FieldValue } from 'firebase-admin/firestore';
import { HttpsError, onCall } from 'firebase-functions/v2/https';

import { db, requireUid, type Entitlement } from './admin.js';
import { REGION, type ProductId } from './config.js';
import { grantProduct } from './entitlements.js';

interface AccessCodeDoc {
  productId: ProductId;
  subjectId?: string;
  maxUses: number;
  uses: number;
  /** ISO date after which the code stops working. */
  validUntil?: string;
  /** e.g. "Skyline enrolment 2026" or a partner school's name, for reporting. */
  batch?: string;
}

/**
 * Redeems a code created by Skyline staff in accessCodes/{CODE}. Used for enrolled Skyline students,
 * partner schools and parents who paid in person.
 */
export const redeemAccessCode = onCall({ region: REGION }, async (request): Promise<Entitlement> => {
  const uid = requireUid(request);
  const code = String((request.data as { code?: string })?.code ?? '').trim().toUpperCase();
  if (!/^[A-Z0-9-]{4,32}$/.test(code)) throw new HttpsError('invalid-argument', 'That code is not valid.');

  const codeRef = db.collection('accessCodes').doc(code);
  const redemptionRef = codeRef.collection('redemptions').doc(uid);

  return db.runTransaction(async (tx) => {
    const snap = await tx.get(codeRef);
    if (!snap.exists) throw new HttpsError('not-found', 'That code is not valid.');
    const data = snap.data() as AccessCodeDoc;

    if (data.validUntil && new Date(data.validUntil).getTime() < Date.now()) {
      throw new HttpsError('failed-precondition', 'That code has expired.');
    }
    if ((await tx.get(redemptionRef)).exists) {
      throw new HttpsError('already-exists', 'You have already used this code.');
    }
    if (data.uses >= data.maxUses) {
      throw new HttpsError('resource-exhausted', 'That code has been used up.');
    }

    const entitlement = await grantProduct(tx, uid, data.productId, data.subjectId);
    tx.update(codeRef, { uses: FieldValue.increment(1) });
    tx.set(redemptionRef, { redeemedAt: FieldValue.serverTimestamp() });
    return entitlement;
  });
});
