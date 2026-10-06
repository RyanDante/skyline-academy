/**
 * Seeds Firestore with the app's sample data (src/data/seed.ts).
 *
 *   Emulator:   FIRESTORE_EMULATOR_HOST=127.0.0.1:8080 npm run seed
 *   Real project: GOOGLE_APPLICATION_CREDENTIALS=path/to/service-account.json npm run seed
 *
 * Adds a `keywords` array to every question so the Tutor can find related past questions.
 * Also creates a demo access code (SKYLINE-DEMO) and a demo class group (SKY-4821).
 */
import { initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

import * as seed from '../../../src/data/seed';
import { keywords } from '../src/keywords';

initializeApp({ projectId: process.env.GCLOUD_PROJECT ?? process.env.FIREBASE_PROJECT ?? 'demo-skyline' });
const db = getFirestore();

async function writeAll<T extends { id: string }>(collection: string, items: T[], extra?: (item: T) => object) {
  // Batches cap at 500 writes.
  for (let i = 0; i < items.length; i += 400) {
    const batch = db.batch();
    for (const item of items.slice(i, i + 400)) {
      const { id, ...data } = item;
      batch.set(db.collection(collection).doc(id), { ...data, ...(extra?.(item) ?? {}) });
    }
    await batch.commit();
  }
  console.log(`  ${collection}: ${items.length}`);
}

async function main() {
  console.log('Seeding Firestore…');
  await writeAll('subjects', seed.subjects);
  await writeAll('topics', seed.topics);
  await writeAll('papers', seed.papers);
  await writeAll('questions', seed.questions, (q) => ({ keywords: keywords(q.stem) }));
  await writeAll('solutions', seed.solutions);
  await writeAll('pathwayFamilies', seed.families);
  await writeAll('institutions', seed.institutions);
  await writeAll('highlights', seed.highlights);
  await writeAll('groups', seed.groups);

  await db.collection('accessCodes').doc('SKYLINE-DEMO').set({
    productId: 'season-pass',
    maxUses: 100,
    uses: 0,
    batch: 'Demo',
  });
  console.log('  accessCodes: SKYLINE-DEMO');
  console.log('Done.');
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
