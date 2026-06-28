"use client";

import { ChangeEvent, FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { Bot, Camera, CheckCircle2, FileText, LocateFixed, MapPin, Upload } from "lucide-react";
import { useAuth } from "@/components/AuthProvider";
import { AuthGate } from "@/components/AuthGate";
import { useToast } from "@/components/ToastProvider";
import { analyzeIssue } from "@/lib/ai";
import { createIssue } from "@/lib/firebase/firestore";
import { categories, IssueCategory } from "@/lib/types";

export default function ReportPage() {
  const { user } = useAuth();
  const toast = useToast();
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<IssueCategory>("Other");
  const [locationText, setLocationText] = useState("");
  const [lat, setLat] = useState<number | undefined>();
  const [lng, setLng] = useState<number | undefined>();
  const [imageDataUrl, setImageDataUrl] = useState("");
  const [loading, setLoading] = useState(false);

  function readImage(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setImageDataUrl(String(reader.result));
    reader.readAsDataURL(file);
  }

  function useCurrentLocation() {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLat(position.coords.latitude);
        setLng(position.coords.longitude);
        setLocationText(`${position.coords.latitude.toFixed(5)}, ${position.coords.longitude.toFixed(5)}`);
        toast("Location captured", "success");
      },
      () => toast("Could not access location", "error")
    );
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (!user) {
      toast("Please login before reporting an issue", "error");
      router.push("/login");
      return;
    }

    setLoading(true);
    try {
      const ai = await analyzeIssue(title, description, imageDataUrl, category);
      const issue = await createIssue({
        title,
        description,
        category: category === "Other" ? ai.category : category,
        severity: ai.severity,
        status: "Reported",
        imageUrl: imageDataUrl,
        locationText,
        lat,
        lng,
        aiSummary: ai.summary,
        suggestedDepartment: ai.suggestedDepartment,
        urgencyReason: ai.urgencyReason,
        recommendedAction: ai.recommendedAction,
        reportedBy: user.uid,
        reportedByEmail: user.email,
        municipalityId: user.municipalityId,
        municipalityName: user.municipalityName
      });
      toast("Issue reported with AI triage", "success");
      router.push(`/issues/${issue.id}`);
    } catch (error) {
      toast(error instanceof Error ? error.message : "Could not submit report", "error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthGate label="the report form">
    <main className="shell py-8">
      <div className="page-panel mb-6 rounded-lg p-6">
        <p className="page-kicker">AI assisted civic intake</p>
        <div className="mt-3 flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
          <div>
            <h1 className="page-title text-3xl font-black text-civic-navy sm:text-4xl">Report a civic issue</h1>
            <p className="mt-3 max-w-2xl leading-7 text-slate-600">
              Submit a clean, verifiable case for {user?.municipalityName || "your municipality"} with evidence, location, AI severity, department routing, and public tracking.
            </p>
          </div>
          <div className="grid grid-cols-3 gap-2 rounded-lg border border-slate-200 bg-white p-2 text-center shadow-sm">
            {["Evidence", "AI triage", "Public status"].map((item, index) => (
              <div key={item} className="rounded-md bg-slate-50 px-3 py-2">
                <p className="font-mono text-sm font-black text-civic-green">0{index + 1}</p>
                <p className="mt-1 text-xs font-bold text-slate-600">{item}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
      <form onSubmit={submit} className="grid gap-6 lg:grid-cols-[1fr_0.8fr]">
        <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-5 flex items-center gap-3">
            <div className="grid h-11 w-11 place-items-center rounded-md bg-emerald-50 text-civic-green ring-1 ring-emerald-100">
              <FileText />
            </div>
            <div>
              <h2 className="text-xl font-black tracking-[-0.02em] text-civic-navy">Case details</h2>
              <p className="text-sm text-slate-500">Clear evidence helps the authority act faster.</p>
            </div>
          </div>
          <div className="grid gap-5">
            <label>
              <span className="text-sm font-bold text-slate-600">Issue title</span>
              <input value={title} onChange={(event) => setTitle(event.target.value)} required className="field mt-2" placeholder="Large pothole near school gate" />
            </label>
            <label>
              <span className="text-sm font-bold text-slate-600">Description</span>
              <textarea
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                required
                rows={5}
                className="field mt-2"
                placeholder="Describe what happened, who is affected, and how urgent it feels."
              />
            </label>
            <label>
              <span className="text-sm font-bold text-slate-600">Category</span>
              <select value={category} onChange={(event) => setCategory(event.target.value as IssueCategory)} className="field mt-2">
                {categories.map((item) => (
                  <option key={item}>{item}</option>
                ))}
              </select>
            </label>
            <label>
              <span className="text-sm font-bold text-slate-600">Location</span>
              <div className="mt-2 flex gap-2">
                <input value={locationText} onChange={(event) => setLocationText(event.target.value)} required className="field" placeholder="Area, street, landmark, or coordinates" />
                <button type="button" onClick={useCurrentLocation} className="action-primary px-4" title="Use current location">
                  <LocateFixed />
                </button>
              </div>
              <span className="mt-2 block text-xs font-semibold text-slate-500">This report will be visible in {user?.municipalityName || "your selected municipality"}.</span>
            </label>
            <label className="grid min-h-40 cursor-pointer place-items-center rounded-lg border border-dashed border-slate-300 bg-slate-50 p-6 text-center transition hover:border-civic-green hover:bg-emerald-50/60">
              <Upload className="text-civic-green" size={30} />
              <span className="mt-2 font-bold text-civic-navy">Upload issue image</span>
              <span className="mt-1 text-sm text-slate-500">Photo evidence improves AI triage accuracy.</span>
              <input type="file" accept="image/*" onChange={readImage} className="hidden" />
            </label>
          </div>
        </section>
        <aside className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm lg:sticky lg:top-24 lg:self-start">
          <div className="grid h-12 w-12 place-items-center rounded-md bg-civic-navy text-white">
            <Bot size={28} />
          </div>
          <h2 className="mt-4 text-2xl font-black tracking-[-0.03em] text-civic-navy">AI triage preview</h2>
          <p className="mt-3 leading-7 text-slate-600">
            Gemini analyzes the report and returns category, severity, responsible department, summary, urgency reason, and recommended action.
          </p>
          <div className="mt-5 grid gap-3">
            {[
              ["Evidence", imageDataUrl ? "Image attached" : "Awaiting image"],
              ["Location", locationText ? "Location captured" : "Manual or GPS"],
              ["AI output", "JSON triage + action"]
            ].map(([label, value]) => (
              <div key={label} className="flex items-center justify-between rounded-md border border-slate-200 bg-slate-50 p-3">
                <span className="inline-flex items-center gap-2 font-bold text-slate-600">
                  {label === "Location" ? <MapPin size={16} /> : <CheckCircle2 size={16} />}
                  {label}
                </span>
                <span className="text-sm font-black text-civic-navy">{value}</span>
              </div>
            ))}
          </div>
          {imageDataUrl ? (
            <img src={imageDataUrl} alt="Preview" className="mt-5 h-64 w-full rounded-lg border border-slate-200 object-cover" />
          ) : (
            <div className="mt-5 grid h-64 place-items-center rounded-lg border border-dashed border-slate-300 bg-slate-50 text-center">
              <div>
                <Camera className="mx-auto text-slate-400" />
                <p className="mt-2 text-sm font-bold text-slate-500">Image preview appears here</p>
              </div>
            </div>
          )}
          <button disabled={loading} className="action-primary mt-6 w-full px-5 py-3 disabled:opacity-60">
            {loading ? "Analyzing and submitting..." : "Submit report"}
          </button>
        </aside>
      </form>
    </main>
    </AuthGate>
  );
}
