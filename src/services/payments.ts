import { config } from '@/lib/config';
import { callable } from '@/lib/firebase';
import type { Entitlement } from '@/types/models';

export type ProductId = 'season-pass' | 'subject-pass' | 'exam-week-pass' | 'paper-answers';
export type MobileMoneyProvider = 'mtn' | 'orange';

export interface CheckoutRequest {
  productId: ProductId;
  subjectId?: string;
  /** For 'paper-answers': the paper whose Skyline answers are bought. */
  paperId?: string;
  provider: MobileMoneyProvider;
  /** E.164 number that receives the payment prompt (may be a parent's). */
  payerPhone: string;
}

export interface CheckoutResponse {
  reference: string;
  /** Hosted payment page from the aggregator, when the provider uses one. */
  checkoutUrl: string | null;
  /** "pending" means a USSD/push prompt was sent to the payer's phone. */
  /** 'paid' is demo-only: the unlock is granted immediately. */
  status: 'pending' | 'paid' | 'failed';
  message: string;
}

const createCheckout = callable<CheckoutRequest, CheckoutResponse>('createCheckout');
const redeemAccessCode = callable<{ code: string }, Entitlement>('redeemAccessCode');

export const paymentsService = {
  async checkout(request: CheckoutRequest): Promise<CheckoutResponse> {
    if (config.useMocks) {
      // Demo: single-paper unlocks succeed instantly so testers can see the unlocked answers.
      if (request.productId === 'paper-answers') {
        return { reference: 'demo-ref', checkoutUrl: null, status: 'paid', message: 'Demo mode: answers unlocked without payment.' };
      }
      return {
        reference: 'demo-ref',
        checkoutUrl: null,
        status: 'pending',
        message: 'Demo mode: no payment was requested. Use access code SKYLINE-DEMO instead.',
      };
    }
    return createCheckout(request);
  },

  async redeem(code: string): Promise<Entitlement> {
    const clean = code.trim().toUpperCase();
    if (config.useMocks) {
      if (clean !== 'SKYLINE-DEMO') throw new Error('That code is not valid.');
      const expires = new Date();
      expires.setMonth(expires.getMonth() + 9);
      return { plan: 'pass', expiresAt: expires.toISOString(), subjectPasses: [] };
    }
    return redeemAccessCode({ code: clean });
  },

  /** WhatsApp message a student can forward so a parent pays for them. */
  parentPayMessage(studentName: string, productLabel: string, amountLabel: string): string {
    return (
      `Hello, I'd like to get the Skyline Academy ${productLabel} (${amountLabel}) to prepare for my exams. ` +
      `You can pay by MTN MoMo or Orange Money in the Skyline app, or send me the access code. Thank you! — ${studentName}`
    );
  },
};
