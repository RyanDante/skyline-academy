import { createHmac, timingSafeEqual } from 'node:crypto';

import { FieldValue } from 'firebase-admin/firestore';
import { logger } from 'firebase-functions';
import { HttpsError, onCall, onRequest } from 'firebase-functions/v2/https';

import { db, requireUid } from './admin.js';
import { PAYMENT_API_KEY, PAYMENT_WEBHOOK_SECRET, PRICES, REGION, type ProductId } from './config.js';
import { grantEntitlementForPayment } from './paymentGrant.js';

interface CheckoutRequest {
  productId: ProductId;
  subjectId?: string;
  provider: 'mtn' | 'orange';
  payerPhone: string;
}

interface CheckoutResponse {
  reference: string;
  checkoutUrl: string | null;
  status: 'pending' | 'failed';
  message: string;
}

/**
 * INTEGRATION POINT. Plug in the Mobile Money aggregator Skyline signs with (one that supports both
 * MTN MoMo and Orange Money in Cameroon). It should start a "collection" that sends a confirmation
 * prompt to `payerPhone`, and later call `paymentWebhook` with the same `reference`.
 *
 * Until it is implemented, checkout fails gracefully and students can use access codes.
 */
async function requestCollection(_args: {
  apiKey: string;
  reference: string;
  amount: number;
  provider: 'mtn' | 'orange';
  payerPhone: string;
  description: string;
}): Promise<{ checkoutUrl: string | null }> {
  throw new Error('PAYMENT_PROVIDER_NOT_CONFIGURED');
}

export const createCheckout = onCall(
  { region: REGION, secrets: [PAYMENT_API_KEY] },
  async (request): Promise<CheckoutResponse> => {
    const uid = requireUid(request);
    const data = request.data as Partial<CheckoutRequest>;

    if (!data.productId || !(data.productId in PRICES)) throw new HttpsError('invalid-argument', 'Unknown product.');
    if (data.provider !== 'mtn' && data.provider !== 'orange') throw new HttpsError('invalid-argument', 'Choose MTN or Orange.');
    if (typeof data.payerPhone !== 'string' || !/^\+2376\d{8}$/.test(data.payerPhone)) {
      throw new HttpsError('invalid-argument', 'Enter a Cameroon mobile number.');
    }
    if (data.productId === 'subject-pass' && !data.subjectId) {
      throw new HttpsError('invalid-argument', 'Choose a subject.');
    }

    const amount = PRICES[data.productId];
    const ref = db.collection('payments').doc();
    await ref.set({
      uid,
      productId: data.productId,
      subjectId: data.subjectId ?? null,
      amount,
      currency: 'XAF',
      provider: data.provider,
      payerPhone: data.payerPhone,
      status: 'pending',
      createdAt: FieldValue.serverTimestamp(),
    });

    try {
      const { checkoutUrl } = await requestCollection({
        apiKey: PAYMENT_API_KEY.value(),
        reference: ref.id,
        amount,
        provider: data.provider,
        payerPhone: data.payerPhone,
        description: `Skyline Academy ${data.productId}`,
      });
      return {
        reference: ref.id,
        checkoutUrl,
        status: 'pending',
        message: 'Check the paying phone and confirm with your Mobile Money PIN. Your pass unlocks automatically.',
      };
    } catch (error) {
      logger.error('collection request failed', { reference: ref.id, error: String(error) });
      await ref.update({ status: 'failed', failureReason: String(error) });
      return {
        reference: ref.id,
        checkoutUrl: null,
        status: 'failed',
        message: 'Mobile Money payments are not available yet. Ask Skyline for an access code.',
      };
    }
  },
);

/** Verifies an HMAC-SHA256 hex signature of the raw request body. */
function validSignature(rawBody: Buffer, signature: string | undefined, secret: string): boolean {
  if (!signature) return false;
  const expected = createHmac('sha256', secret).update(rawBody).digest('hex');
  const a = Buffer.from(expected, 'utf8');
  const b = Buffer.from(signature, 'utf8');
  return a.length === b.length && timingSafeEqual(a, b);
}

/**
 * Called by the aggregator when a collection completes. Adapt the header name and payload shape to
 * the provider's documentation; keep the signature check and the idempotent grant.
 */
export const paymentWebhook = onRequest(
  { region: REGION, secrets: [PAYMENT_WEBHOOK_SECRET] },
  async (req, res) => {
    if (req.method !== 'POST') {
      res.status(405).send('Method not allowed');
      return;
    }
    if (!validSignature(req.rawBody, req.header('x-signature'), PAYMENT_WEBHOOK_SECRET.value())) {
      res.status(401).send('Invalid signature');
      return;
    }

    const { reference, status } = req.body as { reference?: string; status?: string };
    if (!reference || !status) {
      res.status(400).send('Missing fields');
      return;
    }

    try {
      await grantEntitlementForPayment(reference, status === 'SUCCESSFUL');
      res.status(200).send('ok');
    } catch (error) {
      logger.error('webhook handling failed', { reference, error: String(error) });
      res.status(500).send('error');
    }
  },
);
