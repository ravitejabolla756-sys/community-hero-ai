import { User as FirebaseUser, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, updateProfile } from "firebase/auth";
import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";
import { auth, db, firebaseEnabled } from "@/lib/firebase/config";
import { municipalityIdFromName, normalizeMunicipalityName } from "@/lib/municipality";
import { AppUser } from "@/lib/types";

const localUserKey = "community-hero-user";

export function getDemoUserFromStorage(): AppUser | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(localUserKey);
  if (!raw) return null;
  const parsed = JSON.parse(raw) as Partial<AppUser>;
  const municipalityName = normalizeMunicipalityName(parsed.municipalityName);
  return {
    uid: parsed.uid || parsed.email || "demo",
    email: parsed.email || "citizen@example.com",
    name: parsed.name || parsed.email?.split("@")[0] || "Citizen",
    role: parsed.role || "citizen",
    municipalityId: parsed.municipalityId || municipalityIdFromName(municipalityName),
    municipalityName,
    createdAt: parsed.createdAt || new Date().toISOString()
  };
}

function demoUser(email: string, name?: string, municipalityName?: string): AppUser {
  const normalizedMunicipalityName = normalizeMunicipalityName(municipalityName);
  return {
    uid: email,
    email,
    name: name || email.split("@")[0],
    role: email === process.env.NEXT_PUBLIC_ADMIN_EMAIL || email.toLowerCase().includes("admin") ? "admin" : "citizen",
    municipalityId: municipalityIdFromName(normalizedMunicipalityName),
    municipalityName: normalizedMunicipalityName,
    createdAt: new Date().toISOString()
  };
}

function saveDemoUser(user: AppUser) {
  localStorage.setItem(localUserKey, JSON.stringify(user));
}

export function clearDemoUser() {
  localStorage.removeItem(localUserKey);
}

export async function getOrCreateUserProfile(firebaseUser: FirebaseUser): Promise<AppUser> {
  if (!db) throw new Error("Firestore is not configured.");

  const userRef = doc(db, "users", firebaseUser.uid);
  const snapshot = await getDoc(userRef);
  const email = firebaseUser.email || "";
  const role = email === process.env.NEXT_PUBLIC_ADMIN_EMAIL ? "admin" : "citizen";
  const fallbackMunicipalityName = normalizeMunicipalityName();

  if (!snapshot.exists()) {
    await setDoc(userRef, {
      uid: firebaseUser.uid,
      name: firebaseUser.displayName || email.split("@")[0] || "Citizen",
      email,
      role,
      municipalityId: municipalityIdFromName(fallbackMunicipalityName),
      municipalityName: fallbackMunicipalityName,
      createdAt: serverTimestamp()
    });
  }

  const data = snapshot.exists() ? snapshot.data() : {};
  const municipalityName = normalizeMunicipalityName(String(data.municipalityName || fallbackMunicipalityName));
  return {
    uid: firebaseUser.uid,
    name: String(data.name || firebaseUser.displayName || "Citizen"),
    email,
    role: (data.role as AppUser["role"]) || role,
    municipalityId: String(data.municipalityId || municipalityIdFromName(municipalityName)),
    municipalityName,
    createdAt: data.createdAt?.toDate?.().toISOString?.() || new Date().toISOString()
  };
}

export async function loginWithEmail(email: string, password: string): Promise<AppUser | null> {
  if (firebaseEnabled && auth) {
    const credential = await signInWithEmailAndPassword(auth, email, password);
    return getOrCreateUserProfile(credential.user);
  }

  const user = demoUser(email);
  saveDemoUser(user);
  return user;
}

export async function signupWithEmail(name: string, email: string, password: string, municipalityNameInput?: string): Promise<AppUser | null> {
  const municipalityName = normalizeMunicipalityName(municipalityNameInput);
  const municipalityId = municipalityIdFromName(municipalityName);

  if (firebaseEnabled && auth && db) {
    const credential = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(credential.user, { displayName: name });
    await setDoc(doc(db, "users", credential.user.uid), {
      uid: credential.user.uid,
      name,
      email,
      role: email === process.env.NEXT_PUBLIC_ADMIN_EMAIL ? "admin" : "citizen",
      municipalityId,
      municipalityName,
      createdAt: serverTimestamp()
    });
    return getOrCreateUserProfile(credential.user);
  }

  const user = demoUser(email, name, municipalityName);
  saveDemoUser(user);
  return user;
}

export async function logoutUser() {
  if (firebaseEnabled && auth) await signOut(auth);
  clearDemoUser();
}
