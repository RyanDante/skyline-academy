import { initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { HttpsError, type CallableRequest } from 'firebase-functions/v2/https';

initializeApp();

export const db = getFirestore();

export function requireUid(request: CallableRequest<unknown>): string {
  const uid = request.auth?.uid;
  if (!uid) throw new HttpsError('unauthenticated', 'Sign in first.');
  return uid;
}

/** "YYYY-MM-DD" in Cameroon time (UTC+1), so daily limits reset at local midnight. */
export function cameroonDayKey(now = new Date()): string {
  return new Date(now.getTime() + 60 * 60 * 1000).toISOString().slice(0, 10);
}

/** Monday-based ISO week key, e.g. "2026-W41". Mirrors weekKey() in the app. */
export function weekKey(now = new Date()): string {
  const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  const day = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - day);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const week = Math.ceil(((d.getTime() - yearStart.getTime()) / 86_400_000 + 1) / 7);
  return `${d.getUTCFullYear()}-W${String(week).padStart(2, '0')}`;
}

export interface Entitlement {
  plan: 'free' | 'pass';
  expiresAt: string | null;
  subjectPasses: string[];
}

export async function getEntitlement(uid: string): Promise<Entitlement> {
  const snap = await db.collection('users').doc(uid).get();
  const ent = snap.get('entitlement') as Entitlement | undefined;
  return ent ?? { plan: 'free', expiresAt: null, subjectPasses: [] };
}

export function isPassActive(ent: Entitlement): boolean {
  return ent.plan === 'pass' && (!ent.expiresAt || new Date(ent.expiresAt).getTime() > Date.now());
}
