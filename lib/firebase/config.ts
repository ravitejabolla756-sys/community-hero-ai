import { getApps, initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const requiredClientEnv = {
  NEXT_PUBLIC_FIREBASE_API_KEY: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  NEXT_PUBLIC_FIREBASE_PROJECT_ID: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  NEXT_PUBLIC_FIREBASE_APP_ID: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

export const missingFirebaseEnv = Object.entries(requiredClientEnv)
  .filter(([, value]) => !value)
  .map(([key]) => key);

export const firebaseEnabled = missingFirebaseEnv.length === 0;

export const firebaseSetupMessage = firebaseEnabled
  ? ""
  : `Firebase demo mode is active. Add ${missingFirebaseEnv.join(", ")} to .env.local to enable Auth, Firestore, and Storage.`;

const firebaseConfig = {
  apiKey: requiredClientEnv.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: requiredClientEnv.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: requiredClientEnv.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: requiredClientEnv.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: requiredClientEnv.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: requiredClientEnv.NEXT_PUBLIC_FIREBASE_APP_ID
};

export const firebaseApp = firebaseEnabled ? getApps()[0] ?? initializeApp(firebaseConfig) : null;
export const auth = firebaseApp ? getAuth(firebaseApp) : null;
export const db = firebaseApp ? getFirestore(firebaseApp) : null;
export const storage = firebaseApp ? getStorage(firebaseApp) : null;
