import { AiAnalysis, IssueCategory, Severity, categories, severities } from "@/lib/types";

const departments = [
  "Municipal Corporation",
  "Water Department",
  "Electricity Department",
  "Road Works Department",
  "Sanitation Department",
  "Public Safety Department"
];

const keywordMap: Array<{ words: string[]; category: IssueCategory; severity: Severity; department: string; action: string }> = [
  {
    words: ["pothole", "hole", "pit"],
    category: "Pothole",
    severity: "High",
    department: "Road Works Department",
    action: "Dispatch a road maintenance crew to barricade the spot and repair the damaged surface."
  },
  {
    words: ["garbage", "trash", "waste", "dump"],
    category: "Garbage",
    severity: "High",
    department: "Sanitation Department",
    action: "Assign a sanitation team for cleanup and schedule follow-up waste collection."
  },
  {
    words: ["leak", "water", "pipe"],
    category: "Water Leakage",
    severity: "High",
    department: "Water Department",
    action: "Send a water works crew to isolate the leak and repair the damaged pipeline."
  },
  {
    words: ["light", "streetlight", "lamp", "dark", "electric"],
    category: "Streetlight",
    severity: "High",
    department: "Electricity Department",
    action: "Inspect the electrical fixture and restore lighting in the affected area."
  },
  {
    words: ["drain", "sewage", "clog", "flood"],
    category: "Drainage",
    severity: "Critical",
    department: "Municipal Corporation",
    action: "Send an emergency drainage team to clear the blockage and disinfect the area."
  },
  {
    words: ["road", "crack", "damage"],
    category: "Road Damage",
    severity: "High",
    department: "Road Works Department",
    action: "Inspect road damage, add temporary warning signs, and schedule repair work."
  },
  {
    words: ["danger", "accident", "unsafe", "broken", "injury", "fire", "collapse"],
    category: "Public Safety",
    severity: "Critical",
    department: "Public Safety Department",
    action: "Send public safety responders immediately and secure the hazardous area."
  }
];

function normalizeCategory(value: string): IssueCategory {
  return categories.find((category) => category.toLowerCase() === value?.toLowerCase()) ?? "Other";
}

function normalizeSeverity(value: string): Severity {
  return severities.find((severity) => severity.toLowerCase() === value?.toLowerCase()) ?? "Medium";
}

function normalizeDepartment(value: string): string {
  return departments.find((department) => department.toLowerCase() === value?.toLowerCase()) ?? "Municipal Corporation";
}

export function fallbackAnalyze(title: string, description: string, selectedCategory?: string): AiAnalysis {
  const text = `${title} ${description}`.toLowerCase();
  const selected = selectedCategory && selectedCategory !== "Other" ? keywordMap.find((item) => item.category === selectedCategory) : undefined;
  const hit = keywordMap.find((item) => item.words.some((word) => text.includes(word))) ?? selected;
  const unclear = `${title} ${description}`.trim().length < 16;
  const criticalContext = ["school", "hospital", "accident", "injury", "fire", "collapse", "electric shock"].some((word) => text.includes(word));
  const highContext = ["traffic", "main road", "drinking water", "night", "unsafe", "public", "bus stop"].some((word) => text.includes(word));
  const severity = unclear ? "Medium" : criticalContext ? "Critical" : highContext && hit ? "High" : hit?.severity ?? "Medium";

  return {
    category: unclear ? "Other" : hit?.category ?? "Other",
    severity,
    suggestedDepartment: unclear ? "Municipal Corporation" : hit?.department ?? "Municipal Corporation",
    summary: unclear
      ? "The report does not contain enough detail to confidently classify the issue."
      : `${hit?.category ?? "Community"} issue reported by a citizen and ready for local verification.`,
    urgencyReason:
      !unclear && severity === "Critical"
        ? "Potential safety or health risk requires immediate attention."
        : !unclear && severity === "High"
          ? "The issue may affect traffic, sanitation, water, electricity, or public access if delayed."
        : "Timely action can prevent escalation and improve neighborhood conditions.",
    recommendedAction: unclear
      ? "Ask the reporter for clearer details, image evidence, and precise location before assigning a field team."
      : hit?.action ?? "Route the report to the municipal helpdesk for inspection and assignment."
  };
}

export async function analyzeIssue(title: string, description: string, imageDataUrl?: string, selectedCategory?: string): Promise<AiAnalysis> {
  try {
    const response = await fetch("/api/analyze", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, description, imageDataUrl, selectedCategory })
    });

    if (!response.ok) throw new Error("AI service unavailable");
    const data = await response.json();
    const fallback = fallbackAnalyze(title, description, selectedCategory);

    return {
      category: normalizeCategory(data.category),
      severity: normalizeSeverity(data.severity),
      suggestedDepartment: normalizeDepartment(data.suggestedDepartment),
      summary: typeof data.summary === "string" && data.summary.trim() ? data.summary : fallback.summary,
      urgencyReason: typeof data.urgencyReason === "string" && data.urgencyReason.trim() ? data.urgencyReason : fallback.urgencyReason,
      recommendedAction:
        typeof data.recommendedAction === "string" && data.recommendedAction.trim() ? data.recommendedAction : fallback.recommendedAction
    };
  } catch {
    return fallbackAnalyze(title, description, selectedCategory);
  }
}
