import {
  DocumentData,
  Timestamp,
  addDoc,
  arrayUnion,
  collection,
  doc,
  getDoc,
  getDocs,
  increment,
  orderBy,
  query,
  runTransaction,
  serverTimestamp,
  setDoc,
  updateDoc,
  where
} from "firebase/firestore";
import { db, firebaseEnabled } from "@/lib/firebase/config";
import { uploadIssueImage } from "@/lib/firebase/storage";
import { municipalityIdFromName, normalizeMunicipalityName } from "@/lib/municipality";
import { Comment, Issue, IssueStatus } from "@/lib/types";

export type CreateIssueInput = Omit<Issue, "id" | "createdAt" | "updatedAt" | "verificationCount" | "verifiedBy">;

const issueKey = "community-hero-issues";
const commentKey = "community-hero-comments";
const defaultIssueImage = "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?auto=format&fit=crop&w=900&q=80";

const seedIssues: Issue[] = [
  {
    id: "demo-pothole",
    title: "Large pothole near school gate",
    description: "Deep pothole creating traffic slowdown and risk for students crossing the road.",
    category: "Pothole",
    severity: "High",
    status: "Community Verified",
    imageUrl: "https://images.unsplash.com/photo-1573646918558-863b5a0a20e1?auto=format&fit=crop&w=900&q=80",
    locationText: "MG Road, Hyderabad",
    municipalityId: "hyderabad-ward-12",
    municipalityName: "Hyderabad Ward 12",
    lat: 17.385,
    lng: 78.4867,
    aiSummary: "Road hazard near a high-footfall school zone.",
    suggestedDepartment: "Road Works Department",
    urgencyReason: "Student safety and traffic disruption make this a high-priority repair.",
    recommendedAction: "Barricade the pothole and dispatch a road works crew for urgent repair.",
    reportedBy: "demo",
    reportedByEmail: "citizen@demo.com",
    verificationCount: 3,
    verifiedBy: ["a", "b", "c"],
    adminNote: "Assigned to ward engineer.",
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: "demo-garbage",
    title: "Garbage pile beside bus stop",
    description: "Waste has not been cleared for three days and is blocking pedestrian movement.",
    category: "Garbage",
    severity: "Medium",
    status: "Reported",
    imageUrl: "https://images.unsplash.com/photo-1604187351574-c75ca79f5807?auto=format&fit=crop&w=900&q=80",
    locationText: "Kukatpally Bus Stop",
    municipalityId: "kukatpally-municipality",
    municipalityName: "Kukatpally Municipality",
    lat: 17.4948,
    lng: 78.3996,
    aiSummary: "Sanitation issue affecting commuters and pedestrians.",
    suggestedDepartment: "Sanitation Department",
    urgencyReason: "Uncollected waste may create hygiene issues if not cleared soon.",
    recommendedAction: "Assign a sanitation crew to clear the waste and monitor collection frequency.",
    reportedBy: "demo",
    reportedByEmail: "citizen@demo.com",
    verificationCount: 1,
    verifiedBy: ["a"],
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    updatedAt: new Date().toISOString()
  }
];

const now = () => new Date().toISOString();

function readLocal<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  const raw = localStorage.getItem(key);
  if (!raw) {
    localStorage.setItem(key, JSON.stringify(fallback));
    return fallback;
  }
  return JSON.parse(raw) as T;
}

function readStoredIssues(): Issue[] | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(issueKey);
  return raw ? (JSON.parse(raw) as Issue[]) : null;
}

function realLocalIssues(): Issue[] {
  return (readStoredIssues() ?? []).filter((issue) => !issue.id.startsWith("demo-"));
}

function writeLocal<T>(key: string, value: T) {
  localStorage.setItem(key, JSON.stringify(value));
}

function timestampToIso(value: unknown): string {
  if (value instanceof Timestamp) return value.toDate().toISOString();
  if (value instanceof Date) return value.toISOString();
  if (typeof value === "string") return value;
  if (value && typeof value === "object" && "toDate" in value && typeof value.toDate === "function") {
    return value.toDate().toISOString();
  }
  return now();
}

function mapIssue(id: string, data: DocumentData): Issue {
  const municipalityName = normalizeMunicipalityName(String(data.municipalityName || data.areaName || data.townName || ""));
  return {
    id,
    title: String(data.title || ""),
    description: String(data.description || ""),
    category: data.category || "Other",
    severity: data.severity || "Medium",
    status: data.status || "Reported",
    imageUrl: data.imageUrl || defaultIssueImage,
    locationText: String(data.locationText || ""),
    municipalityId: String(data.municipalityId || municipalityIdFromName(municipalityName)),
    municipalityName,
    lat: typeof data.lat === "number" ? data.lat : undefined,
    lng: typeof data.lng === "number" ? data.lng : undefined,
    aiSummary: String(data.aiSummary || ""),
    suggestedDepartment: String(data.suggestedDepartment || "Municipal Response Team"),
    urgencyReason: String(data.urgencyReason || ""),
    recommendedAction: String(data.recommendedAction || "Route this issue to the responsible municipal team for inspection."),
    reportedBy: String(data.reportedBy || ""),
    reportedByEmail: String(data.reportedByEmail || ""),
    verificationCount: Number(data.verificationCount || 0),
    verifiedBy: Array.isArray(data.verifiedBy) ? data.verifiedBy : [],
    adminNote: data.adminNote ? String(data.adminNote) : undefined,
    createdAt: timestampToIso(data.createdAt),
    updatedAt: timestampToIso(data.updatedAt)
  };
}

function mapComment(id: string, data: DocumentData): Comment {
  return {
    id,
    issueId: String(data.issueId || ""),
    userId: String(data.userId || ""),
    userEmail: String(data.userEmail || ""),
    text: String(data.text || ""),
    createdAt: timestampToIso(data.createdAt)
  };
}

export async function getIssues(): Promise<Issue[]> {
  return getIssuesForScope();
}

export async function getIssuesForScope(municipalityId?: string): Promise<Issue[]> {
  if (!firebaseEnabled || !db) {
    const saved = realLocalIssues();
    const issues = saved.length ? saved : seedIssues;
    return issues
      .filter((issue) => !municipalityId || issue.municipalityId === municipalityId)
      .sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
  }

  try {
    const snapshot = await getDocs(query(collection(db, "issues"), orderBy("createdAt", "desc")));
    return snapshot.docs
      .map((item) => mapIssue(item.id, item.data()))
      .filter((issue) => !municipalityId || issue.municipalityId === municipalityId);
  } catch (error) {
    throw new Error(error instanceof Error ? `Failed to load issues: ${error.message}` : "Failed to load issues.");
  }
}

export async function getIssueById(issueId: string): Promise<Issue | null> {
  if (!firebaseEnabled || !db) {
    return [...realLocalIssues(), ...seedIssues].find((issue) => issue.id === issueId) ?? null;
  }

  try {
    const snapshot = await getDoc(doc(db, "issues", issueId));
    return snapshot.exists() ? mapIssue(snapshot.id, snapshot.data()) : null;
  } catch (error) {
    throw new Error(error instanceof Error ? `Failed to load issue: ${error.message}` : "Failed to load issue.");
  }
}

export async function createIssue(issue: CreateIssueInput): Promise<Issue> {
  const issueId = firebaseEnabled && db ? doc(collection(db, "issues")).id : crypto.randomUUID();
  const imageUrl = await uploadIssueImage(issueId, issue.imageUrl);

  const payload: Issue = {
    ...issue,
    id: issueId,
    municipalityId: issue.municipalityId || municipalityIdFromName(issue.municipalityName),
    municipalityName: normalizeMunicipalityName(issue.municipalityName),
    imageUrl,
    status: issue.status || "Reported",
    verificationCount: 0,
    verifiedBy: [],
    createdAt: now(),
    updatedAt: now()
  };

  if (!firebaseEnabled || !db) {
    const issues = realLocalIssues();
    writeLocal(issueKey, [payload, ...issues]);
    return payload;
  }

  try {
    const { id: _id, createdAt: _createdAt, updatedAt: _updatedAt, ...docData } = payload;
    await setDoc(doc(db, "issues", issueId), {
      ...docData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    return payload;
  } catch (error) {
    throw new Error(error instanceof Error ? `Failed to create issue: ${error.message}` : "Failed to create issue.");
  }
}

export async function updateIssueStatus(issueId: string, status: IssueStatus, adminNote?: string): Promise<void> {
  if (!firebaseEnabled || !db) {
    const issues = await getIssues();
    writeLocal(issueKey, issues.map((issue) => (issue.id === issueId ? { ...issue, status, adminNote, updatedAt: now() } : issue)));
    return;
  }

  try {
    await updateDoc(doc(db, "issues", issueId), {
      status,
      adminNote: adminNote ?? "",
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    throw new Error(error instanceof Error ? `Failed to update issue: ${error.message}` : "Failed to update issue.");
  }
}

export async function verifyIssue(issueId: string, userId: string): Promise<void> {
  if (!firebaseEnabled || !db) {
    const issues = await getIssues();
    const issue = issues.find((item) => item.id === issueId);
    if (!issue || issue.verifiedBy.includes(userId)) return;
    const verificationCount = issue.verificationCount + 1;
    const status = verificationCount >= 3 && issue.status === "Reported" ? "Community Verified" : issue.status;
    writeLocal(
      issueKey,
      issues.map((item) =>
        item.id === issueId ? { ...item, verificationCount, status, verifiedBy: [...item.verifiedBy, userId], updatedAt: now() } : item
      )
    );
    return;
  }

  try {
    const issueRef = doc(db, "issues", issueId);
    await runTransaction(db, async (transaction) => {
      const snapshot = await transaction.get(issueRef);
      if (!snapshot.exists()) throw new Error("Issue not found.");
      const issue = mapIssue(snapshot.id, snapshot.data());
      if (issue.verifiedBy.includes(userId)) return;
      const nextCount = issue.verificationCount + 1;
      transaction.update(issueRef, {
        verificationCount: increment(1),
        verifiedBy: arrayUnion(userId),
        status: nextCount >= 3 && issue.status === "Reported" ? "Community Verified" : issue.status,
        updatedAt: serverTimestamp()
      });
    });
  } catch (error) {
    throw new Error(error instanceof Error ? `Failed to verify issue: ${error.message}` : "Failed to verify issue.");
  }
}

export async function addComment(comment: Omit<Comment, "id" | "createdAt">): Promise<void> {
  const payload: Comment = { ...comment, id: crypto.randomUUID(), createdAt: now() };

  if (!firebaseEnabled || !db) {
    const comments = readLocal<Comment[]>(commentKey, []);
    writeLocal(commentKey, [...comments, payload]);
    return;
  }

  try {
    await addDoc(collection(db, "comments"), {
      issueId: comment.issueId,
      userId: comment.userId,
      userEmail: comment.userEmail,
      text: comment.text,
      createdAt: serverTimestamp()
    });
  } catch (error) {
    throw new Error(error instanceof Error ? `Failed to add comment: ${error.message}` : "Failed to add comment.");
  }
}

export async function getCommentsByIssueId(issueId: string): Promise<Comment[]> {
  if (!firebaseEnabled || !db) {
    return readLocal<Comment[]>(commentKey, [])
      .filter((comment) => comment.issueId === issueId)
      .sort((a, b) => +new Date(a.createdAt) - +new Date(b.createdAt));
  }

  try {
    const snapshot = await getDocs(query(collection(db, "comments"), where("issueId", "==", issueId)));
    return snapshot.docs
      .map((item) => mapComment(item.id, item.data()))
      .sort((a, b) => +new Date(a.createdAt) - +new Date(b.createdAt));
  } catch (error) {
    throw new Error(error instanceof Error ? `Failed to load comments: ${error.message}` : "Failed to load comments.");
  }
}
