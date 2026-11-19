/**
 * Runtime configuration read from EXPO_PUBLIC_* env vars (see .env.example).
 * Only non-secret values belong here: anything EXPO_PUBLIC_ is bundled into the app.
 */
const getEnv = (key: string, fallback: string = ''): string => {
  if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env[key]) {
    return import.meta.env[key];
  }
  if (typeof process !== 'undefined' && process.env && process.env[key]) {
    return process.env[key];
  }
  return fallback;
};

export const config = {
  useMocks: getEnv('VITE_USE_MOCKS', getEnv('EXPO_PUBLIC_USE_MOCKS', 'true')) !== 'false',
  functionsRegion: getEnv('VITE_FUNCTIONS_REGION', getEnv('EXPO_PUBLIC_FUNCTIONS_REGION', 'europe-west1')),
  /** Skyline admin/tutor WhatsApp, international format without "+". */
  skylineWhatsApp: getEnv('VITE_SKYLINE_WHATSAPP', getEnv('EXPO_PUBLIC_SKYLINE_WHATSAPP', '237651371800')),
  gceExamStart: getEnv('VITE_GCE_EXAM_START', getEnv('EXPO_PUBLIC_GCE_EXAM_START', '2027-05-10')),
} as const;

/** Product limits and prices. Prices are hypotheses to test, in CFA francs. */
export const product = {
  freeTutorQuestionsPerDay: 5,
  maxConcoursTargets: 3,
  /** Topics with fewer attempts than this show as "untested", never "weak". */
  minAttemptsForMastery: 10,
  prices: {
    seasonPass: 7500,
    subjectPass: 2000,
    examWeekPass: 1000,
  },
} as const;
