# Skyline Academy app

React Native app for Anglophone GCE students in Cameroon: past papers with teacher-marked solutions, topic practice, a Concours readiness bridge, and an AI Tutor grounded in Skyline's own content. Built from *Blueprint v2*.

**Stack:** Expo SDK 57 · React Native 0.86 (New Architecture) · TypeScript · Expo Router · NativeWind (Tailwind) · React Native Firebase (Auth, Firestore, Functions, Storage) · expo-sqlite (offline store) · TanStack Query · Zustand · Cloud Functions (Node 22) · Claude API for the Tutor.

---

## 1. Run it in 5 minutes (demo mode, no Firebase)

Demo mode runs the whole app on bundled sample data. Phone sign-in accepts any Cameroon number with code `123456`, and access code `SKYLINE-DEMO` unlocks the Season Pass.

```bash
npm install
npx expo install --fix
cp .env.example .env
```

Leave `EXPO_PUBLIC_USE_MOCKS=true` in `.env`. Because the app uses native modules (Firebase, PDF, SQLite), it needs a **development build**, not Expo Go. Firebase config files aren't needed for the demo: `app.config.ts` skips the Firebase plugins when `google-services.json` / `GoogleService-Info.plist` are missing. Downloading PDFs is the one feature that needs a live project.

```bash
npx expo prebuild
npm run android
```

`npx expo install --fix` aligns every native package with the exact versions Expo SDK 57 expects. Run it whenever you add or upgrade a package.

### Preview in Expo Go

For a quick look on a phone without building, run:

```bash
npm run start:go
```

Then scan the QR code with Expo Go. This runs demo mode with Firebase and the PDF viewer replaced by stand-ins (`src/stubs`), because Expo Go doesn't include their native code.

### Build with EAS (APK for testers)

Without Firebase config files, builds are **demo builds**: `build-flags.js` leaves Firebase out of the native app (`react-native.config.js`) and stubs its JavaScript (`metro.config.js`). Every profile in `eas.json` runs demo mode except `production`.

```bash
npm install -g eas-cli
eas login
eas init
eas build --platform android --profile preview
```

`eas init` creates the project on your Expo account and prints a project ID. Because `app.config.ts` is dynamic, add that ID as `EAS_PROJECT_ID` in the `base.env` block of `eas.json`, and in `.env`.

When the build finishes, EAS gives a link and QR code for an installable APK to send to testers. iOS builds need an Apple Developer account; run `eas build --platform ios --profile preview` and register testers' devices with `eas device:create`.

## 2. Connect Firebase

1. **Create a Firebase project** and upgrade it to the Blaze plan (Cloud Functions and outbound calls to the Claude API need it).
2. **Authentication:** enable the *Phone* provider.
3. **Firestore** (production mode) and **Storage**: create both, in a region close to Cameroon (for example `europe-west1`).
4. **Apps:**
   - Android: package `com.skylineacademy.app`. Add your debug and release **SHA-1 and SHA-256** fingerprints; phone auth fails without them. Download `google-services.json` to the project root.
   - iOS: bundle id `com.skylineacademy.app`. Download `GoogleService-Info.plist` to the project root, and upload an APNs key so phone auth can verify silently.
5. **Deploy rules, indexes and functions** (Firebase CLI, from `firebase/`):

   ```bash
   cd firebase
   cp .firebaserc.example .firebaserc
   cd functions && npm install && cd ..
   firebase functions:secrets:set ANTHROPIC_API_KEY
   firebase functions:secrets:set PAYMENT_API_KEY
   firebase functions:secrets:set PAYMENT_WEBHOOK_SECRET
   firebase deploy --only firestore,storage,functions
   ```

   In `.firebaserc`, set your project id. Until a payment provider is chosen, the two payment secrets can be any placeholder value.

6. **Seed sample content** (or skip and add real content through your admin tools):

   ```bash
   cd firebase/functions
   GOOGLE_APPLICATION_CREDENTIALS=/path/to/service-account.json GCLOUD_PROJECT=your-project-id npm run seed
   ```

7. **Switch the app to live data:** set `EXPO_PUBLIC_USE_MOCKS=false` in `.env` and rebuild.

**Staff accounts.** Content collections are writable only by users with the `admin` custom claim. Set it once per staff member with the Admin SDK: `getAuth().setCustomUserClaims(uid, { admin: true })`.

**Local emulators.** Run `firebase emulators:start` from `firebase/`. To seed them, run the seed script with `FIRESTORE_EMULATOR_HOST=127.0.0.1:8080`.

## 3. Project structure

```
src/
  app/                    Expo Router screens (file = route)
    (tabs)/               Home · GCE · Concours · Tutor · Me
    (onboarding)/         welcome, 4-step setup
    (auth)/               phone + OTP (modal; asked only when needed)
    gce/[subjectId]       subject: papers by year, topics with mastery
    paper/[paperId]       paper: practise, timed attempt, PDF, download, solutions
    pdf/[paperId]         PDF viewer (offline copy first)
    quiz/                 setup → session → results (+ share card)
    solution/[questionId] the "marked script" solution view
    concours/             intro, pathway family, institution readiness, calendar
    groups/               class groups + weekly leaderboard
    paywall.tsx           Season Pass, Mobile Money, access codes
  components/
    ui/                   design-system primitives (Text, Button, Card, Chip, Screen, …)
    brand/                Logo, SkylineSilhouette
    study/                QuestionCard, SolutionView, MathText (LaTeX → Unicode), TeacherCredit
    concours/             ReadinessCard, TopicStatusRow
    home/                 CountdownHero
    share/                ShareableCard (view-shot → WhatsApp)
  domain/                 pure logic: mastery, readiness, season phases, quiz, search
  services/               data access (Firestore + SQLite cache + mock mode), auth, tutor, payments, leads
  db/                     SQLite schema, migrations, repositories
  stores/                 Zustand: session (persisted), quiz, tutor
  hooks/                  React Query hooks, bootstrap, readiness, network
  data/seed.ts            sample content: mock mode and Firestore seed
  theme/tokens.ts         raw colours for SVG/navigation (mirrors global.css)
firebase/
  firestore.rules · storage.rules · firestore.indexes.json
  functions/src/          tutorAsk · createCheckout · paymentWebhook · redeemAccessCode · createLead · joinGroup · aggregateAttempt
  functions/scripts/seed.ts
```

## 4. How the main pieces work

**Offline first.** Every content read goes through `services/cachedFetch.ts`: it fetches from the network, writes the result to SQLite, and falls back to SQLite when offline. Attempts are written to SQLite first and pushed to `users/{uid}/attempts` whenever a connection is available (`services/attempts.ts`, triggered on reconnect). PDFs can be downloaded to the device (`services/downloads.ts`).

**Content model.** Papers are stored as individual questions tagged to a topic tree. Quizzes, mastery, readiness and Tutor grounding all build on that. See `src/types/models.ts`.

**Readiness** (`domain/readiness.ts`). Mastery per topic is recency-weighted accuracy with a 21-day half-life. A topic stays "untested" until it has 10 attempts. Readiness weights mastery by each topic's share of the Concours marks and averages across the academic sections. Topics the GCE doesn't cover show as gaps. The UI always calls this "academic readiness", never a chance of admission.

**Season phases** (`domain/season.ts`). Home changes with the countdown to `EXPO_PUBLIC_GCE_EXAM_START`: foundation, then build, final, exams and results.

**Tutor** (`firebase/functions/src/tutor.ts`):

1. The app first matches the question on-device against stored questions.
2. On the server, `tutorAsk` checks the daily limit (5 free questions, unlimited with a pass) in a transaction.
3. It finds related past questions through a `keywords` index and adds their teacher-written solutions to the prompt.
4. It calls `claude-opus-5-5` (effort `medium`, server-side refusal fallback enabled).
5. If the model ends its reply with `[ASK_TEACHER]`, the app offers a WhatsApp handover to a Skyline teacher.

A failed call refunds the student's question.

**Access and money.** Entitlements live on `users/{uid}.entitlement` and are writable only by Cloud Functions. The available products are Season Pass (until 31 July after the exams), a per-subject pass and an exam-week pass. Access codes (`accessCodes/{CODE}`) serve enrolled Skyline students and partner schools.

**Leads.** "Talk to Skyline" saves a lead (target, readiness, weak topics) and opens WhatsApp with a pre-filled message.

## 5. Design system

- **Colours** are defined once in `global.css` as CSS variables, with light and dark values. Tailwind classes (`bg-surface`, `text-ink`, `bg-accent`, `text-brand-deep`, …) adapt automatically.
- **Brand:** orange `#FF820A`, teal `#0E989A`, light cyan `#B0E5EB`. The brand orange and teal are too light for small text on white, so text uses `accent-deep` (`#B35400`) and `brand-deep` (`#0A7375`).
- **Type:** Sora for display, Inter for body text, with the scale in `tailwind.config.js`. Text scaling is capped at 1.3× to protect layouts.
- **One primary (orange) button per screen.** Other buttons use the `brand`, `secondary` or `ghost` variants.
- **Signature elements:** the skyline silhouette with an orange horizon line (Home, splash), and the orange marking-pen line with `✓ M1 …` annotations on solutions.
- **Placeholder art:** icons and splash images in `assets/images` are generated placeholders. Replace them when the refreshed logo is ready.

## 6. Not built yet (next steps)

| Area | State | What to do |
|---|---|---|
| Mobile Money | `createCheckout` and `paymentWebhook` are complete except the provider call (`requestCollection` in `payments.ts`) | Choose an aggregator that covers MTN MoMo and Orange Money. Implement `requestCollection` and adapt the webhook's signature header and payload. |
| Admin / CMS | Not included | A small web admin (or Firebase console to start) for papers, questions, solutions, Concours data, highlights, access codes and leads. |
| Push notifications | Not included | Add `@react-native-firebase/messaging`, store FCM tokens, and send deadline and mock reminders from a scheduled function. |
| Paid-step enforcement | Paid solution steps are hidden in the app only | Move paid steps to a subcollection readable only with an active entitlement. |
| App Check | Off | Enable Firebase App Check (Play Integrity / App Attest) and set `enforceAppCheck: true` on callable functions, especially `tutorAsk`. |
| Real content | `src/data/seed.ts` is sample data | Load real papers, solutions, topic weights and verified dates. Concours requirements in the seed are marked "to confirm". |
| Tests | Domain logic is pure and ready for unit tests | Add Jest (`jest-expo`) tests for `domain/*` and the security rules (`@firebase/rules-unit-testing`). |
| KaTeX offline | `MathBlock` loads KaTeX from a CDN and falls back to Unicode offline | Bundle KaTeX as a local asset if display maths becomes common. |

## 7. Assumptions to confirm

- Prices (Season Pass 7 500 CFA, subject 2 000, exam week 1 000) are hypotheses to test. They are set in `src/lib/config.ts` and `firebase/functions/src/config.ts`.
- `EXPO_PUBLIC_GCE_EXAM_START` defaults to 2027-05-10; set it from the GCE Board timetable.
- Concours topic weights, requirements and dates in the seed are illustrative and show "Not yet verified" until `lastVerified` is set.
