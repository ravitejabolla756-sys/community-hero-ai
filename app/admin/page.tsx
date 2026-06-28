"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { AlertTriangle, CheckCircle2, ClipboardList, Inbox, ShieldCheck } from "lucide-react";
import { Badge } from "@/components/Badge";
import { EmptyState } from "@/components/EmptyState";
import { StatCard } from "@/components/StatCard";
import { useAuth } from "@/components/AuthProvider";
import { useToast } from "@/components/ToastProvider";
import { getIssues, updateIssueStatus } from "@/lib/firebase/firestore";
import { categories, Issue, IssueStatus, severities, statuses } from "@/lib/types";

export default function AdminPage() {
  const { user, loading } = useAuth();
  const toast = useToast();
  const [issues, setIssues] = useState<Issue[]>([]);
  const [loadingIssues, setLoadingIssues] = useState(true);
  const [error, setError] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [severityFilter, setSeverityFilter] = useState("All");
  const [categoryFilter, setCategoryFilter] = useState("All");

  async function refresh() {
    setError("");
    try {
      setIssues(await getIssues());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load admin issues.");
    } finally {
      setLoadingIssues(false);
    }
  }

  useEffect(() => {
    refresh();
  }, []);

  if (loading) return <main className="shell py-10">Checking access...</main>;
  if (user?.role !== "admin") {
    return (
      <main className="shell grid min-h-[calc(100vh-64px)] place-items-center py-10 text-center">
        <div className="rounded-lg bg-white p-8 shadow-soft ring-1 ring-slate-100">
          <AlertTriangle className="mx-auto text-civic-amber" size={40} />
          <h1 className="mt-4 text-2xl font-black text-civic-navy">Admin access required</h1>
          <p className="mt-2 text-slate-600">Login with the configured admin email or an email containing admin in demo mode.</p>
          <Link href="/login" className="mt-5 inline-block rounded-lg bg-civic-navy px-5 py-3 font-black text-white">
            Login
          </Link>
        </div>
      </main>
    );
  }

  async function save(issueId: string, status: IssueStatus, note: string) {
    try {
      await updateIssueStatus(issueId, status, note);
      toast("Admin update saved", "success");
      refresh();
    } catch (err) {
      toast(err instanceof Error ? err.message : "Could not update issue", "error");
    }
  }

  const filteredIssues = issues.filter(
    (issue) =>
      (statusFilter === "All" || issue.status === statusFilter) &&
      (severityFilter === "All" || issue.severity === severityFilter) &&
      (categoryFilter === "All" || issue.category === categoryFilter)
  );

  return (
    <main className="shell py-8">
      <div className="page-panel rounded-lg p-6">
        <p className="page-kicker">Municipal response console</p>
        <h1 className="page-title mt-2 text-3xl font-black text-civic-navy sm:text-4xl">Admin response queue</h1>
        <p className="mt-3 max-w-2xl leading-7 text-slate-600">Prioritize reports, update workflow status, and publish official notes for transparent resolution.</p>
      </div>
      <section className="mt-6 grid gap-4 md:grid-cols-5">
        <StatCard label="All issues" value={issues.length} icon={ClipboardList} accent="#2364aa" />
        <StatCard label="High priority" value={issues.filter((issue) => issue.severity === "High" || issue.severity === "Critical").length} icon={AlertTriangle} accent="#d84727" />
        <StatCard label="Verified" value={issues.filter((issue) => issue.status === "Community Verified").length} icon={ShieldCheck} accent="#1f8a5b" />
        <StatCard label="In progress" value={issues.filter((issue) => issue.status === "In Progress").length} icon={ClipboardList} accent="#f4a261" />
        <StatCard label="Resolved" value={issues.filter((issue) => issue.status === "Resolved").length} icon={CheckCircle2} accent="#2a9d8f" />
      </section>
      <section className="premium-card mt-6 grid gap-3 rounded-lg p-4 md:grid-cols-3">
        <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} className="field">
          <option>All</option>
          {statuses.map((item) => (
            <option key={item}>{item}</option>
          ))}
        </select>
        <select value={severityFilter} onChange={(event) => setSeverityFilter(event.target.value)} className="field">
          <option>All</option>
          {severities.map((item) => (
            <option key={item}>{item}</option>
          ))}
        </select>
        <select value={categoryFilter} onChange={(event) => setCategoryFilter(event.target.value)} className="field">
          <option>All</option>
          {categories.map((item) => (
            <option key={item}>{item}</option>
          ))}
        </select>
      </section>
      <section className="mt-8 space-y-4">
        {loadingIssues && <p className="rounded-lg bg-white p-6 font-bold text-slate-500 shadow-soft">Loading admin queue...</p>}
        {error && <p className="rounded-lg bg-red-50 p-6 font-bold text-red-700 ring-1 ring-red-100">{error}</p>}
        {!loadingIssues && filteredIssues.map((issue) => (
          <AdminIssue key={issue.id} issue={issue} onSave={save} />
        ))}
        {!loadingIssues && !error && filteredIssues.length === 0 && (
          <EmptyState icon={Inbox} title="No issues in queue" text="Once matching citizen reports exist, they will appear here for status updates and official notes." />
        )}
      </section>
    </main>
  );
}

function AdminIssue({ issue, onSave }: { issue: Issue; onSave: (issueId: string, status: IssueStatus, note: string) => Promise<void> }) {
  const [status, setStatus] = useState<IssueStatus>(issue.status);
  const [note, setNote] = useState(issue.adminNote || "");
  const [saving, setSaving] = useState(false);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setSaving(true);
    try {
      await onSave(issue.id, status, note);
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={submit} className="premium-card rounded-lg p-5 transition hover:-translate-y-0.5 hover:shadow-lift">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="mb-2 flex flex-wrap gap-2">
            <Badge label={issue.severity} type="severity" />
            <Badge label={issue.status} type="status" />
          </div>
          <Link href={`/issues/${issue.id}`} className="text-xl font-black text-civic-navy">
            {issue.title}
          </Link>
          <p className="mt-1 text-sm text-slate-500">{issue.locationText} - {issue.suggestedDepartment}</p>
        </div>
        <span className="rounded-lg bg-slate-100 px-3 py-2 text-sm font-bold text-slate-600">{issue.verificationCount} verifications</span>
      </div>
      <div className="mt-4 grid gap-3 md:grid-cols-[220px_1fr_auto]">
        <select value={status} onChange={(event) => setStatus(event.target.value as IssueStatus)} className="field">
          {statuses.map((item) => (
            <option key={item}>{item}</option>
          ))}
        </select>
        <input value={note} onChange={(event) => setNote(event.target.value)} placeholder="Admin note" className="field" />
        <button disabled={saving} className="action-primary px-5 py-3 disabled:opacity-60">
          {saving ? "Saving..." : "Save"}
        </button>
      </div>
    </form>
  );
}
