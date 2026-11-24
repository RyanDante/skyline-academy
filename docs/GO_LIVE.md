# Going live: setup guide

This guide takes Skyline Academy from the demo build (sample data, no server) to a live app on the Google Play Store. Do the parts in order: each one needs the one before it.

Commands are for PowerShell on Windows, run from the project folder (`E:\work\skyline academy\skyline-app`) unless a step says otherwise.

| Part | What you get | Rough time |
|---|---|---|
| 1. Accounts | Everything you need to sign up for | 1 day (waiting on approvals) |
| 2. Firebase project | Sign-in, database and file storage | 1 hour |
| 3. Server (Cloud Functions) | AI Tutor, payments, access codes | 1 hour |
| 4. Content | Real papers, solutions and Concours data | Ongoing |
| 5. Mobile Money | Students can pay | 2 to 5 days, mostly the provider's approval |
| 6. Live test build | An APK that talks to the real server | 1 hour |
| 7. Before launch | Security, legal pages, testing | 1 to 2 days |
| 8. Google Play | The public listing | 3 to 7 days, mostly Google's review |

---

## Part 1. Accounts you need

| Account | Why | Cost | Where |
|---|---|---|---|
| Google account for Skyline | Owns Firebase and Play Console. Use a Skyline business account, not a personal one. | Free | accounts.google.com |
| Firebase, on the **Blaze** plan | Server functions and outbound calls to the AI need Blaze. Usage is pay-as-you-go; small apps usually stay within the free allowance. | Card required | console.firebase.google.com |
| Expo / EAS | Builds the app. Already set up as `@ryandantedaemon/skyline-academy`. | Free tier is enough to start | expo.dev |
| Anthropic API | Powers the AI Tutor | Pay per use | console.anthropic.com |
| Mobile Money aggregator | Takes MTN MoMo and Orange Money payments | Fee per transaction | See Part 5 |
| Google Play Console | Publishes the app | One-time US$25 | play.google.com/console |
| Apple Developer (optional, later) | Only if you want an iPhone version | US$99 a year | developer.apple.com |

**Do this first:** the Play Console account and the payment aggregator both need identity or business verification, which can take several days. Start them now while you work on the rest.

---

## Part 2. Firebase project

### 2.1 Create the project
1. Go to console.firebase.google.com and click **Create a project**. Name it `skyline-academy`.
2. You can turn Google Analytics off for now.
3. Open **Project settings → Usage and billing** and switch to the **Blaze** plan.
4. In Google Cloud Billing, **set a budget alert** (for example 10 000 FCFA, about US$15, a month) so a surprise bill can't happen.

### 2.2 Turn on sign-in
1. Go to **Build → Authentication → Get started → Sign-in method**.
2. Enable **Email/Password**. Leave "Email link" off.

Students sign in with their phone number and a password. Behind the scenes the app turns `670 12 34 56` into the address `237670123456@phone.skylineacademy.app`. No SMS is sent, so there is no SMS cost.

**Forgotten passwords.** The "Forgot password" link opens WhatsApp to Skyline. To reset a student's password, go to Firebase Console → Authentication → Users, search for their number (for example `237670123456`), open the ⋮ menu, and use **Reset password** or delete the user so they can sign up again.

### 2.3 Create the database and file storage
1. Go to **Build → Firestore Database → Create database**. Choose **production mode** and location **europe-west1 (Belgium)**, the closest to Cameroon. The location can't be changed later.
2. Go to **Build → Storage → Get started**. Use production mode and the same location.

### 2.4 Register the Android app
1. Go to **Project settings → General → Your apps → Add app → Android**.
2. Enter the package name `com.skylineacademy.app` exactly, and the nickname `Skyline Android`.
3. Download **`google-services.json`** and put it in the project root (next to `package.json`).

   The file is already in `.gitignore`. Never commit it to GitHub.

The iPhone app is optional: add an iOS app with bundle ID `com.skylineacademy.app` and put `GoogleService-Info.plist` in the project root.

### 2.5 Install the Firebase command-line tool
```powershell
npm install -g firebase-tools
```
```powershell
firebase login
```

---

## Part 3. Server (Cloud Functions)

### 3.1 Point the tools at your project
```powershell
cd firebase
```
```powershell
Copy-Item .firebaserc.example .firebaserc
```
Open `firebase\.firebaserc` and replace the project ID with yours. It's shown in Project settings, for example `skyline-academy-1a2b3`.

### 3.2 Get an AI key
1. Go to console.anthropic.com. Add a payment method under **Billing**.
2. Set a **monthly spend limit**, for example US$30, to start.
3. Under **API keys**, create a key named `skyline-tutor`. Copy it; it's shown only once.

The Tutor gives free users 5 AI replies a day. The limit is set in `firebase/functions/src/config.ts` (`FREE_TUTOR_QUESTIONS_PER_DAY`).

### 3.3 Store secrets on the server
Each command asks you to paste a value:
```powershell
firebase functions:secrets:set ANTHROPIC_API_KEY
```
```powershell
firebase functions:secrets:set PAYMENT_API_KEY
```
```powershell
firebase functions:secrets:set PAYMENT_WEBHOOK_SECRET
```
Until Part 5 is done, type `placeholder` for the two payment secrets.

**Never put these keys in `.env`, `eas.json` or any `EXPO_PUBLIC_*` variable.** Anything in the app can be read by anyone who downloads it.

### 3.4 Deploy
```powershell
cd functions; npm install; cd ..
```
```powershell
firebase deploy --only firestore,storage,functions
```
The first deploy takes 5 to 10 minutes. If it asks to enable APIs (Cloud Build, Artifact Registry, Secret Manager), answer yes.

### 3.5 Make yourself an admin
Content (papers, solutions, Concours data) can only be changed by accounts marked as admin.

1. Sign up in the live app (Part 6) with your own number.
2. Find your user ID under Firebase Console → Authentication.
3. Mark the account as admin from a small script using the Admin SDK: `getAuth().setCustomUserClaims(uid, { admin: true })`. Ask me and I'll add a one-line command for it.

---

## Part 4. Content

### 4.1 Load the sample content (optional, for testing)
1. In Firebase Console, go to **Project settings → Service accounts → Generate new private key**.
2. Save the downloaded file **outside the project folder**, for example in `C:\keys\skyline-admin.json`. It gives full access to your database.
3. Run:

```powershell
cd firebase\functions
```
```powershell
$env:GOOGLE_APPLICATION_CREDENTIALS="C:\keys\skyline-admin.json"; $env:GCLOUD_PROJECT="your-project-id"; npm run seed
```

### 4.2 Real content
The sample data in `src/data/seed.ts` shows the shape of everything the app needs:
- subjects;
- topics;
- papers;
- questions, split one by one and tagged to topics;
- teacher-written solutions with mark points;
- Concours sectors and schools.

Before launch you need, at minimum:
- the real papers and solutions for the subjects you advertise;
- the real **GCE exam start date**, set as `EXPO_PUBLIC_GCE_EXAM_START` in `eas.json` (currently `2027-05-10`) and as the key dates in `src/data/calendar.ts`;
- the Concours entries marked "To confirm", checked and corrected.

At first you can enter content in the Firebase console (Firestore → collection → Add document) or with the seed script. A simple admin website is the recommended next build once content volume grows.

### 4.3 Access codes for enrolled students
To create a code, add a document to the `accessCodes` collection in Firestore. The document ID is the code itself, for example `SKY-LYCEE-2027`. Copy the fields from the demo code in the seed data.

---

## Part 5. Mobile Money payments

The payment flow is fully built except the call to the provider. The app's purchases are:
- the Season Pass, 7 500 FCFA;
- a subject pass, 2 000 FCFA;
- an exam-week pass, 1 000 FCFA;
- one paper's answers, 100 FCFA.

1. **Choose an aggregator** that collects from both MTN MoMo and Orange Money in Cameroon. Cameroonian options include Campay, Notch Pay and Monetbil. Compare their fees, payout delay and test (sandbox) mode.
2. **Complete their business verification.** Then get the **API key** and **webhook secret** from their dashboard.
3. **Write the provider call.** `requestCollection()` in `firebase/functions/src/payments.ts` has to be filled in for the chosen provider, and the webhook check adjusted to their signature format. This is about an hour of work once the provider is chosen; send me their API docs.
4. **Store the real secrets:** `firebase functions:secrets:set PAYMENT_API_KEY` (and `PAYMENT_WEBHOOK_SECRET`). Then redeploy with `firebase deploy --only functions`.
5. **Register the webhook.** In the provider dashboard, set the webhook URL to:
   `https://europe-west1-<your-project-id>.cloudfunctions.net/paymentWebhook`
6. **Test in sandbox mode first.** Then do one real 100 FCFA paper unlock with each network before launch.

---

## Part 6. Live test build

### 6.1 Give EAS your Firebase file
EAS builds in the cloud, so it needs `google-services.json`. Upload it as a secret file:
```powershell
npm install -g eas-cli
```
```powershell
eas login
```
```powershell
eas env:create --name GOOGLE_SERVICES_JSON --type file --value ./google-services.json --environment production --visibility secret
```
For iPhone, do the same with `GOOGLE_SERVICES_PLIST` and `./GoogleService-Info.plist`.

### 6.2 Build an installable test APK
```powershell
eas build --platform android --profile production-live
```
When it finishes, EAS shows a link and QR code. Send the link to testers. They may need to allow "Install unknown apps" for their browser.

### 6.3 Test checklist
Test on at least one cheap Android phone (2 to 3 GB of RAM), on mobile data:
- [ ] Sign up, sign out, and sign in again on a second phone: progress comes back.
- [ ] Personalise screen saves your subjects; Home shows the right countdown.
- [ ] GCE: open a paper, answer questions, open a solution.
- [ ] Unlock one paper's answers for 100 FCFA (after Part 5).
- [ ] AI Tutor answers a question; the 6th free reply in a day is refused politely.
- [ ] Skyler quiz gives a result; Concours search and sector pages load.
- [ ] Turn on airplane mode: downloaded papers and past answers still work.
- [ ] Settings: dark mode, study reminder arrives at the chosen time.
- [ ] "Talk to Skyline" opens WhatsApp to 651 37 18 00.

The three build profiles differ like this:

| Profile | Data | Output | Use |
|---|---|---|---|
| `preview` / `production` | Sample data | APK | Demos, design feedback |
| `production-live` | Real Firebase | APK | Testing with real accounts |
| `store` | Real Firebase | AAB | Google Play upload |

---

## Part 7. Before launch

### Must do
- [ ] **Privacy Policy and Terms pages.** The sign-up screen asks students to accept both, and Google Play requires a privacy policy URL. Publish them on Skyline's website. They must cover:
  - what you collect: name, phone number, school level, answers, payments;
  - why you collect it;
  - that AI questions are sent to Anthropic;
  - how to delete an account.

  Send me the URLs and I'll link them from the sign-up screen and Settings.
- [ ] **Account deletion.** Google Play requires a way for users to request account deletion: a web form or a WhatsApp/email address you publish.
- [ ] **Real content and dates** (Part 4) for every subject you advertise.
- [ ] **Final logo.** Replace `assets/images/icon.png` (1024×1024), `adaptive-icon.png` (1024×1024, logo centred on a transparent background) and `splash.png`. The current ones are stand-ins.

### Strongly recommended
- [ ] **Firebase App Check.** Go to Firebase Console → App Check, register the Android app with Play Integrity, then set `enforceAppCheck: true` on the functions, especially `tutorAsk`. This stops people calling your AI from outside the app on your bill.
- [ ] **Protect paid solutions on the server.** Today the app hides paid solution steps, but the data is readable. Move paid steps to a protected collection before you have many paying users. It's listed in the README "Not built yet" table.
- [ ] **Budget alerts** on Firebase (Part 2.1) and an Anthropic spend limit (Part 3.2).
- [ ] **Delete the demo access code** `SKYLINE-DEMO` from Firestore if you ran the seed script.

---

## Part 8. Google Play Store

### 8.1 Create the listing
1. In Play Console, choose **Create app**. Name it "Skyline Academy", type App, Free.
2. Fill in **App content**. Each section needs an answer:
   - **Privacy policy:** your URL from Part 7.
   - **Data safety:** declare that you collect:
     - phone number and name (account);
     - app activity (answers);
     - purchase history;
     - user content (Tutor questions, sent to an AI provider).

     Data is encrypted in transit and users can request deletion.
   - **Target audience:** your students are teenagers, so choose ages 13 to 15 and 16 to 17, plus 18 and over. Because users under 18 are included, follow Play's Families policy: no personalised ads (the app has none) and honest descriptions.
   - **Content rating:** complete the questionnaire (Education, no violence and so on).
   - **Ads:** No.
3. **Store listing:**
   - short description, up to 80 characters;
   - full description;
   - the 512×512 icon;
   - a 1024×500 feature graphic;
   - at least 2 phone screenshots, which you can take from the test build.

### 8.2 Build and upload
```powershell
eas build --platform android --profile store
```
This makes an `.aab` file signed with the same key EAS created for your APKs.

**The first upload is manual.** In Play Console go to **Testing → Internal testing → Create release**, upload the `.aab` from the EAS build page, and add testers by email.

**Later uploads can be automatic:**
1. In Google Cloud, create a service account with access to the Play Console. Follow Expo's guide "Uploading a Google Service Account Key for Play Store Submissions".
2. Save its key as `play-service-account.json` in the project root. It's already git-ignored.
3. Run:
```powershell
eas submit --platform android --profile production
```
This uploads the latest store build to the internal testing track as a draft.

### 8.3 Release
Release in stages:
1. **Internal testing:** you and up to 100 testers, available instantly.
2. **Closed testing:** a class or school. **New personal developer accounts must run a closed test with at least 12 testers for 14 days** before production access. Organisation accounts are exempt, so register Play Console as an organisation if Skyline is a registered business.
3. **Production:** use a staged rollout, for example 20% first, then 100%.

Google's review usually takes 1 to 7 days for a new app.

---

## After launch: updating the app
- **Server changes:** `firebase deploy --only functions` from `firebase\`. Students get them immediately.
- **New content:** add it in Firestore. Students get it next time they're online; no app update needed.
- **App changes:** build with `--profile store` and submit. Version numbers increase automatically (`autoIncrement`).
- **Keep prices in step.** They are in two places: `src/lib/config.ts` (app) and `firebase/functions/src/config.ts` (server). The server price is what students are actually charged.
