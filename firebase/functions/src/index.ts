import { setGlobalOptions } from 'firebase-functions/v2';

import { REGION } from './config.js';

setGlobalOptions({ region: REGION, maxInstances: 20 });

export { redeemAccessCode } from './accessCodes.js';
export { aggregateAttempt, joinGroup } from './groups.js';
export { createLead } from './leads.js';
export { createCheckout, paymentWebhook } from './payments.js';
export { tutorAsk } from './tutor.js';
