"use client";

import { useEffect, useMemo, useState } from "react";
import { Inbox, Search } from "lucide-react";
import { EmptyState } from "@/components/EmptyState";
import { IssueCard } from "@/components/IssueCard";
import { CardGridSkeleton } from "@/components/Skeletons";
import { useAuth } from "@/components/AuthProvider";
import { getIssuesForScope } from "@/lib/firebase/firestore";
import { categories, Issue, severities, statuses } from "@/lib/types";

export default function IssuesPage() {
  const { user } = useAuth();
  const [issues, setIssues] = useState<Issue[]>([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [severity, setSeverity] = useState("All");
  const [status, setStatus] = useState("All");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    getIssuesForScope(user?.municipalityId)
      .then(setIssues)
      .catch((err) => setError(err instanceof Error ? err.message : "Could not load issues."))
      .finally(() => setLoading(false));
  }, [user?.municipalityId]);

  const filtered = useMemo(
    () =>
      issues.filter((issue) => {
        const matchesSearch = `${issue.title} ${issue.locationText}`.toLowerCase().includes(search.toLowerCase());
        return matchesSearch && (category === "All" || issue.category === category) && (severity === "All" || issue.severity === severity) && (status === "All" || issue.status === status);
      }),
    [category, issues, search, severity, status]
  );

  return (
    <main className="shell py-8">
      <div className="page-panel rounded-lg p-6">
        <p className="page-kicker">Transparent issue tracking</p>
        <h1 className="page-title mt-2 text-3xl font-black text-civic-navy sm:text-4xl">Public issue tracker</h1>
        <p className="mt-3 max-w-2xl leading-7 text-slate-600">
          Browse reports from {user?.municipalityName || "your selected municipality"}, filter by severity, and open any case for verification.
        </p>
      </div>
      <section className="premium-card mt-6 grid gap-3 rounded-lg p-4 md:grid-cols-4">
        <label className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3">
          <Search size={18} />
          <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search title or location" className="w-full py-3 outline-none" />
        </label>
        <select value={category} onChange={(event) => setCategory(event.target.value)} className="field">
          <option>All</option>
          {categories.map((item) => (
            <option key={item}>{item}</option>
          ))}
        </select>
        <select value={severity} onChange={(event) => setSeverity(event.target.value)} className="field">
          <option>All</option>
          {severities.map((item) => (
            <option key={item}>{item}</option>
          ))}
        </select>
        <select value={status} onChange={(event) => setStatus(event.target.value)} className="field">
          <option>All</option>
          {statuses.map((item) => (
            <option key={item}>{item}</option>
          ))}
        </select>
      </section>
      <section className="mt-6 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {loading && <CardGridSkeleton count={6} />}
        {!loading && filtered.map((issue) => (
          <IssueCard key={issue.id} issue={issue} />
        ))}
      </section>
      {error && <p className="mt-10 rounded-lg bg-red-50 p-8 text-center font-bold text-red-700 ring-1 ring-red-100">{error}</p>}
      {!loading && !error && !filtered.length && (
        <div className="mt-8">
          <EmptyState icon={Inbox} title="No issues found" text="Try changing filters or report a new community issue for others to verify." actionHref="/report" actionLabel="Report an issue" />
        </div>
      )}
    </main>
  );
}
