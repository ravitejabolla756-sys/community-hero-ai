import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";
import { fallbackAnalyze } from "@/lib/ai";

const allowedCategories = ["Pothole", "Garbage", "Water Leakage", "Streetlight", "Drainage", "Road Damage", "Public Safety", "Other"];
const allowedSeverities = ["Low", "Medium", "High", "Critical"];
const allowedDepartments = [
  "Municipal Corporation",
  "Water Department",
  "Electricity Department",
  "Road Works Department",
  "Sanitation Department",
  "Public Safety Department"
];

function extractJson(text: string) {
  const cleaned = text.replace(/```json|```/g, "").trim();
  const start = cleaned.indexOf("{");
  const end = cleaned.lastIndexOf("}");
  if (start === -1 || end === -1 || end <= start) throw new Error("Gemini did not return JSON.");
  return JSON.parse(cleaned.slice(start, end + 1));
}

function normalizeAnalysis(data: Record<string, unknown>, title: string, description: string, selectedCategory?: string) {
  const fallback = fallbackAnalyze(title, description, selectedCategory);
  const category = typeof data.category === "string" && allowedCategories.includes(data.category) ? data.category : fallback.category;
  const severity = typeof data.severity === "string" && allowedSeverities.includes(data.severity) ? data.severity : fallback.severity;
  const suggestedDepartment =
    typeof data.suggestedDepartment === "string" && allowedDepartments.includes(data.suggestedDepartment)
      ? data.suggestedDepartment
      : fallback.suggestedDepartment;

  return {
    category,
    severity,
    suggestedDepartment,
    summary: typeof data.summary === "string" && data.summary.trim() ? data.summary.trim() : fallback.summary,
    urgencyReason: typeof data.urgencyReason === "string" && data.urgencyReason.trim() ? data.urgencyReason.trim() : fallback.urgencyReason,
    recommendedAction:
      typeof data.recommendedAction === "string" && data.recommendedAction.trim()
        ? data.recommendedAction.trim()
        : fallback.recommendedAction
  };
}

export async function POST(request: Request) {
  const { title, description, imageDataUrl, selectedCategory } = await request.json();
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return NextResponse.json(fallbackAnalyze(title, description, selectedCategory));
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
      generationConfig: { responseMimeType: "application/json", temperature: 0.2 }
    });
    const parts: Array<string | { inlineData: { data: string; mimeType: string } }> = [
      `You are a civic issue triage assistant. Analyze the citizen-reported community issue using the title, description, and optional image.

Return only safe valid JSON. Do not return markdown. Do not return explanation outside JSON.

Title: ${title}
Description: ${description}
Citizen selected category: ${selectedCategory || "Not specified"}

Rules:
- If the issue can harm people immediately, mark severity as Critical.
- If it affects traffic, water supply, electricity, or sanitation, mark severity as High or Critical.
- If description is unclear, categorize as Other and severity Medium.
- category must be one of: Pothole, Garbage, Water Leakage, Streetlight, Drainage, Road Damage, Public Safety, Other.
- severity must be one of: Low, Medium, High, Critical.
- suggestedDepartment must be one of: Municipal Corporation, Water Department, Electricity Department, Road Works Department, Sanitation Department, Public Safety Department.

Return exactly this JSON shape:
{"category":"","severity":"","suggestedDepartment":"","summary":"","urgencyReason":"","recommendedAction":""}`
    ];

    if (imageDataUrl?.startsWith("data:image")) {
      const [header, data] = imageDataUrl.split(",");
      const mimeType = header.match(/data:(.*);base64/)?.[1] ?? "image/jpeg";
      parts.push({ inlineData: { data, mimeType } });
    }

    const result = await model.generateContent(parts);
    return NextResponse.json(normalizeAnalysis(extractJson(result.response.text()), title, description, selectedCategory));
  } catch {
    return NextResponse.json(fallbackAnalyze(title, description, selectedCategory));
  }
}
