# Community Hero AI

Community Hero AI is a production-ready hackathon MVP for the **Community Hero - Hyperlocal Problem Solver** challenge. It helps citizens report civic issues, uses AI to triage them, allows community verification, and gives admins a transparent resolution workflow.

## Problem Statement

**Community Hero - Hyperlocal Problem Solver:** enable citizens to identify, report, validate, track, and resolve community issues through collaboration, data, and intelligent automation.

## Features

- Mobile-first landing page and navigation
- Email/password authentication with Firebase Auth
- Local demo auth fallback when Firebase keys are not configured
- Citizen dashboard with reported, verified, resolved, and pending metrics
- Issue reporting with image upload, browser geolocation, and AI triage
- Gemini-powered category, severity, department, summary, and urgency analysis
- Rule-based AI fallback when `GEMINI_API_KEY` is missing
- Public issue list with category, severity, status, and search filters
- Issue details with status timeline, comments, similar reports, and verification
- Community verification workflow that marks issues verified at 3 confirmations
- Google Maps page with fallback list mode when Maps key is missing
- Protected admin dashboard for status changes and admin notes
- Impact dashboard with category, severity, resolution, and verification analytics
- Demo mode with localStorage when Firebase keys are missing
- Production mode with Firebase Auth, Firestore, Storage, Gemini, and Google Maps when keys are configured

## Google Technologies Used

- Firebase Authentication
- Firebase Firestore
- Firebase Storage
- Gemini API
- Google Maps API
- Deployable to Firebase Hosting, Google Cloud Run, or Google Cloud App Hosting

## Tech Stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- Firebase
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
GEMINI_API_KEY=
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=
NEXT_PUBLIC_ADMIN_EMAIL=
```

The app runs without keys using local demo mode, but production judging should use real Firebase, Gemini, and Google Maps credentials.

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
4. Create a Firebase Storage bucket.
5. Copy the web app config into `.env.local`.
6. Set `NEXT_PUBLIC_ADMIN_EMAIL` to the admin email you will use during judging.

## Gemini Setup

1. Create a Gemini API key in Google AI Studio.
2. Set `GEMINI_API_KEY` in `.env.local` or your deployment environment.
3. If the key is missing or the API fails, the app uses a rule-based civic triage fallback.

## Google Maps Setup

1. Create or select a Google Cloud project.
2. Enable Maps JavaScript API.
3. Create a browser API key.
4. Set `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`.
5. If the key is missing, the map page shows a grouped location fallback view.

## Firebase Schema

`users`

- `uid`
- `name`
- `email`
- `role`
- `createdAt`

`issues`

- `title`
- `description`
- `category`
- `severity`
- `status`
- `imageUrl`
- `locationText`
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

Use these as a production starting point. They keep public issue visibility, require signed-in users for writes, prevent users from creating issues for someone else, and restrict admin status changes to users whose profile has `role: "admin"`.

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

    match /users/{userId} {
      allow read: if signedIn() && (request.auth.uid == userId || isAdmin());
      allow create: if signedIn() && request.auth.uid == userId;
      allow update: if signedIn()
        && request.auth.uid == userId
        && !("role" in request.resource.data.diff(resource.data).changedKeys());
    }

    match /issues/{issueId} {
      allow read: if true;

      allow create: if signedIn()
        && request.resource.data.reportedBy == request.auth.uid
        && request.resource.data.status == "Reported"
        && request.resource.data.verificationCount == 0
        && request.resource.data.verifiedBy.size() == 0;

      allow update: if isAdmin()
        || (
          signedIn()
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
3. Create Firestore and Storage.
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
- Mention Google technologies used: Firebase Auth, Firestore, Storage, Gemini API, Google Maps API, and Google Cloud deployment.
- Keep demo credentials available in the project description for evaluators if production auth accounts are not pre-created.

## Future Improvements

- Official municipal department accounts
- Duplicate issue clustering by geospatial distance
- Push notifications and WhatsApp alerts
- Ward-level leaderboards and citizen reward points
- SLA prediction for resolution timelines
- Rich Google Maps markers using the Maps JavaScript API
