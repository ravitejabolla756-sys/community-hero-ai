# Community Hero AI

Community Hero AI is a production-ready hackathon MVP for the **Community Hero - Hyperlocal Problem Solver** challenge. It helps citizens report civic issues, uses AI to triage them, allows community verification, and gives admins a transparent resolution workflow.

## Problem Statement

**Community Hero - Hyperlocal Problem Solver:** enable citizens to identify, report, validate, track, and resolve community issues through collaboration, data, and intelligent automation.

## Features

- Mobile-first landing page and navigation
- Email/password authentication with Firebase Auth
- Local demo auth fallback when Firebase keys are not configured
- Citizen dashboard with reported, verified, resolved, and pending metrics
- Issue reporting with Supabase/Firebase image upload, browser geolocation, and AI triage
- Gemini-powered category, severity, department, summary, and urgency analysis
- Rule-based AI fallback when `GEMINI_API_KEY` is missing
- Public issue list with category, severity, status, and search filters
- Issue details with status timeline, comments, similar reports, and verification
- Community verification workflow that marks issues verified at 3 confirmations
- OpenStreetMap-powered map with optional Google Maps API upgrade
- Protected admin dashboard for status changes and admin notes
- Impact dashboard with category, severity, resolution, and verification analytics
- Demo mode with localStorage when Firebase keys are missing
- Production mode with Firebase Auth, Firestore, Supabase or Firebase Storage, Gemini, and Google Maps when keys are configured

## Google Technologies Used

- Firebase Authentication
- Firebase Firestore
- Supabase Storage or Firebase Storage
- Gemini API
- OpenStreetMap tiles, with optional Google Maps API
- Deployable to Firebase Hosting, Google Cloud Run, or Google Cloud App Hosting

## Tech Stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- Firebase
- Supabase Storage
- Gemini API
- Lucide React icons

## Environment Variables

Copy `.env.example` to `.env.local` and fill in your keys:

```bash
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
NEXT_PUBLIC_SUPABASE_BUCKET=issue-images
GEMINI_API_KEY=
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=
NEXT_PUBLIC_ADMIN_EMAIL=
NEXT_PUBLIC_DEFAULT_MUNICIPALITY=Community Demo Ward
```

The app runs without keys using local demo mode, but production judging should use real Firebase, Supabase Storage or Firebase Storage, and Gemini credentials. Google Maps is optional because the app includes a free OpenStreetMap map.

## Demo Login Credentials

When Firebase variables are missing, use the built-in demo buttons or these accounts:

- Citizen: `citizen@example.com` / `password123`
- Admin: `admin@example.com` / `password123`

In production, admin access is granted when the signed-in email matches `NEXT_PUBLIC_ADMIN_EMAIL`.

## Setup

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Firebase Setup

1. Create a Firebase project.
2. Enable Email/Password in Authentication.
3. Create a Firestore database.
4. Copy the web app config into `.env.local`.
5. Set `NEXT_PUBLIC_ADMIN_EMAIL` to the admin email you will use during judging.

## Supabase Storage Setup

Firebase Storage can require a billing upgrade. To use Supabase for issue images:

1. Create a Supabase project.
2. Open Storage and create a public bucket named `issue-images`.
3. Copy the Project URL into `NEXT_PUBLIC_SUPABASE_URL`.
4. Copy the anon public key into `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
5. Keep `NEXT_PUBLIC_SUPABASE_BUCKET=issue-images`.

When Supabase variables are present, image uploads use Supabase Storage. If Supabase is missing, the app falls back to Firebase Storage when configured.

## Gemini Setup

1. Create a Gemini API key in Google AI Studio.
2. Set `GEMINI_API_KEY` in `.env.local` or your deployment environment.
3. If the key is missing or the API fails, the app uses a rule-based civic triage fallback.

## Map Setup

The map works for free with OpenStreetMap and does not require an API key.

Optional Google Maps upgrade:

1. Create or select a Google Cloud project.
2. Enable Maps JavaScript API.
3. Create a browser API key.
4. Set `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`.

## Firebase Schema

`users`

- `uid`
- `name`
- `email`
- `mobile`
- `country`
- `state`
- `district`
- `place`
- `role`
- `municipalityId`
- `municipalityName`
- `createdAt`

`issues`

- `title`
- `description`
- `category`
- `severity`
- `status`
- `imageUrl`
- `locationText`
- `municipalityId`
- `municipalityName`
- `lat`
- `lng`
- `aiSummary`
- `suggestedDepartment`
- `urgencyReason`
- `recommendedAction`
- `reportedBy`
- `reportedByEmail`
- `verificationCount`
- `verifiedBy`
- `adminNote`
- `createdAt`
- `updatedAt`

`comments`

- `issueId`
- `userId`
- `userEmail`
- `text`
- `createdAt`

## Recommended Firestore Security Rules

Use these as a production starting point. They keep signed-in, municipality-scoped issue visibility, require signed-in users for writes, prevent users from creating issues for someone else, and restrict admin status changes to users whose profile has `role: "admin"` in the same municipality.

```js
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {
    function signedIn() {
      return request.auth != null;
    }

    function isAdmin() {
      return signedIn()
        && get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == "admin";
    }

    function sameMunicipality(municipalityId) {
      return signedIn()
        && get(/databases/$(database)/documents/users/$(request.auth.uid)).data.municipalityId == municipalityId;
    }

    match /users/{userId} {
      allow read: if signedIn() && (request.auth.uid == userId || isAdmin());
      allow create: if signedIn() && request.auth.uid == userId;
      allow update: if signedIn()
        && request.auth.uid == userId
        && !("role" in request.resource.data.diff(resource.data).changedKeys());
    }

    match /issues/{issueId} {
      allow read: if sameMunicipality(resource.data.municipalityId);

      allow create: if signedIn()
        && request.resource.data.reportedBy == request.auth.uid
        && sameMunicipality(request.resource.data.municipalityId)
        && request.resource.data.status == "Reported"
        && request.resource.data.verificationCount == 0
        && request.resource.data.verifiedBy.size() == 0;

      allow update: if (isAdmin() && sameMunicipality(resource.data.municipalityId))
        || (
          signedIn()
          && sameMunicipality(resource.data.municipalityId)
          && request.resource.data.diff(resource.data).changedKeys().hasOnly(["verificationCount", "verifiedBy", "status", "updatedAt"])
          && request.resource.data.verifiedBy.hasAll(resource.data.verifiedBy)
          && request.resource.data.verifiedBy.hasAny([request.auth.uid])
        );
    }

    match /comments/{commentId} {
      allow read: if true;
      allow create: if signedIn()
        && request.resource.data.userId == request.auth.uid
        && request.resource.data.text is string
        && request.resource.data.text.size() > 0;
    }
  }
}
```

## Recommended Supabase Storage Policy

For hackathon demos, a public bucket with anon uploads is the fastest option because this app uses Firebase Auth, not Supabase Auth. For production, route uploads through a server endpoint or migrate auth checks into Supabase policies.

Bucket:

```txt
issue-images
```

Recommended policy direction:

```sql
-- Public image reads for issue cards and detail pages.
create policy "Public read issue images"
on storage.objects for select
using (bucket_id = 'issue-images');

-- Hackathon demo: browser clients can upload issue photos with the anon key.
create policy "Anon upload issue images"
on storage.objects for insert
to anon
with check (
  bucket_id = 'issue-images'
  and lower((storage.foldername(name))[1]) = 'issues'
);
```

## Recommended Firebase Storage Rules

```js
rules_version = '2';

service firebase.storage {
  match /b/{bucket}/o {
    match /issues/{imageId} {
      allow read: if true;
      allow write: if request.auth != null
        && request.resource.size < 8 * 1024 * 1024
        && request.resource.contentType.matches('image/.*');
    }
  }
}
```

## Deployment

### Firebase Hosting / App Hosting

1. Create a Firebase project.
2. Enable Authentication with email/password.
3. Create Firestore and either Supabase Storage or Firebase Storage.
4. Add environment variables in your hosting environment.
5. Deploy with Firebase Hosting or Firebase App Hosting.

### Google Cloud Run

```bash
npm run build
gcloud run deploy community-hero-ai --source . --region asia-south1 --allow-unauthenticated
```

Set the same environment variables in Cloud Run.

## Hackathon Submission Notes

- Submit the deployed Google Cloud/Firebase link.
- Submit the GitHub repository link.
- Include the selected problem statement: **Community Hero - Hyperlocal Problem Solver**.
- Mention Google technologies used: Firebase Auth, Firestore, Gemini API, and Google Cloud deployment. Note that OpenStreetMap powers the free map and Supabase powers image storage if enabled.
- Keep demo credentials available in the project description for evaluators if production auth accounts are not pre-created.

## Future Improvements

- Official municipal department accounts
- Duplicate issue clustering by geospatial distance
- Push notifications and WhatsApp alerts
- Ward-level leaderboards and citizen reward points
- SLA prediction for resolution timelines
- Rich Google Maps markers using the Maps JavaScript API
