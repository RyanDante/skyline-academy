import { FieldValue } from 'firebase-admin/firestore';

import { db } from './admin.js';
import type { ProductId } from './config.js';
import { grantProduct } from './entitlements.js';

/** Marks a payment as completed or failed. Idempotent: a payment is only ever granted once. */
export async function grantEntitlementForPayment(reference: string, succeeded: boolean): Promise<void> {
  const ref = db.collection('payments').doc(reference);

  await db.runTransaction(async (tx) => {
    const snap = await tx.get(ref);
    if (!snap.exists) throw new Error(`Unknown payment ${reference}`);
    if (snap.get('status') === 'completed') return;

    if (!succeeded) {
      tx.update(ref, { status: 'failed', updatedAt: FieldValue.serverTimestamp() });
      return;
    }

    const uid = snap.get('uid') as string;
    const productId = snap.get('productId') as ProductId;
    const subjectId = (snap.get('subjectId') as string | null) ?? undefined;

    await grantProduct(tx, uid, productId, subjectId);
    tx.update(ref, { status: 'completed', completedAt: FieldValue.serverTimestamp() });
  });
}
