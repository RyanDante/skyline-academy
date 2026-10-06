import type { Transaction } from 'firebase-admin/firestore';

import { db, type Entitlement } from './admin.js';
import type { ProductId } from './config.js';

/** The Season Pass runs until the end of July after the GCE, whichever season it was bought in. */
function seasonEnd(now = new Date()): string {
  const year = now.getUTCMonth() >= 7 ? now.getUTCFullYear() + 1 : now.getUTCFullYear();
  return new Date(Date.UTC(year, 6, 31, 23, 59, 59)).toISOString();
}

function later(a: string | null, b: string): string {
  return a && new Date(a) > new Date(b) ? a : b;
}

/** Applies a purchase or access code to the user's entitlement inside a transaction. */
export async function grantProduct(
  tx: Transaction,
  uid: string,
  productId: ProductId,
  subjectId?: string,
): Promise<Entitlement> {
  const ref = db.collection('users').doc(uid);
  const snap = await tx.get(ref);
  const current: Entitlement = (snap.get('entitlement') as Entitlement | undefined) ?? {
    plan: 'free',
    expiresAt: null,
    subjectPasses: [],
  };

  let next: Entitlement;
  switch (productId) {
    case 'season-pass':
      next = { ...current, plan: 'pass', expiresAt: later(current.expiresAt, seasonEnd()) };
      break;
    case 'exam-week-pass': {
      const week = new Date(Date.now() + 7 * 86_400_000).toISOString();
      next = { ...current, plan: 'pass', expiresAt: later(current.expiresAt, week) };
      break;
    }
    case 'subject-pass':
      next = {
        ...current,
        subjectPasses: subjectId ? [...new Set([...current.subjectPasses, subjectId])] : current.subjectPasses,
      };
      break;
  }

  tx.set(ref, { entitlement: next }, { merge: true });
  return next;
}
