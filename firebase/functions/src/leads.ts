import { FieldValue } from 'firebase-admin/firestore';
import { HttpsError, onCall } from 'firebase-functions/v2/https';

import { db, requireUid } from './admin.js';
import { REGION } from './config.js';

interface LeadRequest {
  institutionId: string;
  institutionName: string;
  readinessScore: number;
  weakTopics: string[];
  source: 'readiness' | 'orientation' | 'tutor';
}

/**
 * Records a "Talk to Skyline" tap with the student's readiness data, so an advisor's first message
 * starts from real information. Leads are read by Skyline staff (admin claim) only.
 */
export const createLead = onCall({ region: REGION }, async (request): Promise<{ leadId: string }> => {
  const uid = requireUid(request);
  const d = request.data as Partial<LeadRequest>;

  if (!d || !['readiness', 'orientation', 'tutor'].includes(String(d.source))) {
    throw new HttpsError('invalid-argument', 'Invalid lead.');
  }

  const user = await db.collection('users').doc(uid).get();
  const ref = await db.collection('leads').add({
    uid,
    phone: request.auth?.token.phone_number ?? null,
    profile: user.get('profile') ?? null,
    institutionId: String(d.institutionId ?? '').slice(0, 100),
    institutionName: String(d.institutionName ?? '').slice(0, 200),
    readinessScore: typeof d.readinessScore === 'number' ? Math.max(0, Math.min(1, d.readinessScore)) : null,
    weakTopics: Array.isArray(d.weakTopics) ? d.weakTopics.slice(0, 10).map((t) => String(t).slice(0, 100)) : [],
    source: d.source,
    status: 'new',
    createdAt: FieldValue.serverTimestamp(),
  });
  return { leadId: ref.id };
});
