import { defineSecret } from 'firebase-functions/params';

/** Must match EXPO_PUBLIC_FUNCTIONS_REGION in the app. */
export const REGION = 'europe-west1';

/** Set with: firebase functions:secrets:set ANTHROPIC_API_KEY */
export const ANTHROPIC_API_KEY = defineSecret('ANTHROPIC_API_KEY');

/** Mobile Money aggregator credentials (see payments.ts). */
export const PAYMENT_API_KEY = defineSecret('PAYMENT_API_KEY');
export const PAYMENT_WEBHOOK_SECRET = defineSecret('PAYMENT_WEBHOOK_SECRET');

export const FREE_TUTOR_QUESTIONS_PER_DAY = 5;

/** Prices in CFA francs. Keep in step with src/lib/config.ts in the app. */
export const PRICES = {
  'season-pass': 7500,
  'subject-pass': 2000,
  'exam-week-pass': 1000,
} as const;

export type ProductId = keyof typeof PRICES;
