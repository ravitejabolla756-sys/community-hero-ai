export type Role = "citizen" | "admin";

export type Severity = "Low" | "Medium" | "High" | "Critical";

export type IssueStatus = "Reported" | "Community Verified" | "Assigned" | "In Progress" | "Resolved" | "Rejected";

export type IssueCategory =
  | "Pothole"
  | "Garbage"
  | "Water Leakage"
  | "Streetlight"
  | "Drainage"
  | "Road Damage"
  | "Public Safety"
  | "Other";

export type AppUser = {
  uid: string;
  name: string;
  email: string;
  role: Role;
  createdAt: string;
};

export type Issue = {
  id: string;
  title: string;
  description: string;
  category: IssueCategory;
  severity: Severity;
  status: IssueStatus;
  imageUrl: string;
  locationText: string;
  lat?: number;
  lng?: number;
  aiSummary: string;
  suggestedDepartment: string;
  urgencyReason: string;
  recommendedAction: string;
  reportedBy: string;
  reportedByEmail: string;
  verificationCount: number;
  verifiedBy: string[];
  adminNote?: string;
  createdAt: string;
  updatedAt: string;
};

export type Comment = {
  id: string;
  issueId: string;
  userId: string;
  userEmail: string;
  text: string;
  createdAt: string;
};

export type AiAnalysis = {
  category: IssueCategory;
  severity: Severity;
  suggestedDepartment: string;
  summary: string;
  urgencyReason: string;
  recommendedAction: string;
};

export const categories: IssueCategory[] = [
  "Pothole",
  "Garbage",
  "Water Leakage",
  "Streetlight",
  "Drainage",
  "Road Damage",
  "Public Safety",
  "Other"
];

export const severities: Severity[] = ["Low", "Medium", "High", "Critical"];

export const statuses: IssueStatus[] = ["Reported", "Community Verified", "Assigned", "In Progress", "Resolved", "Rejected"];
