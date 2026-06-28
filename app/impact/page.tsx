"use client";

import { useEffect, useMemo, useState } from "react";
import { BarChart3, CheckCircle2, Clock, ShieldCheck } from "lucide-react";
import { Badge } from "@/components/Badge";
import { StatCard } from "@/components/StatCard";
import { getIssues } from "@/lib/firebase/firestore";
import { categories, Issue, severities, statuses } from "@/lib/types";

export default function ImpactPage() {
  const [issues, setIssues] = useState<Issue[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    getIssues()
      .then(setIssues)
      .catch((err) => setError(err instanceof Error ? err.message : "Could not load impact metrics."))
      .finally(() => setLoading(false));
  }, []);

  const stats = useMemo(() => {
    const resolved = issues.filter((issue) => issue.status === "Resolved").length;
    return {
      total: issues.length,
      resolved,
      pending: issues.filter((issue) => issue.status !== "Resolved").length,
      verified: issues.filter((issue) => issue.status === "Community Verified").length,
      progress: issues.length ? Math.round((resolved / issues.length) * 100) : 0
    };
  }, [issues]);

  return (
    <main className="shell py-8">
      <div className="page-panel rounded-lg p-6">
        <p className="page-kicker">Community intelligence</p>
        <h1 className="page-title mt-2 text-3xl font-black text-civic-navy sm:text-4xl">Impact dashboard</h1>
        <p className="mt-3 max-w-2xl leading-7 text-slate-600">Transparent metrics for community participation, verification, and municipal response.</p>
      </div>
      {loading && <p className="mt-6 rounded-lg bg-white p-6 font-bold text-slate-500 shadow-soft">Loading impact metrics...</p>}
      {error && <p className="mt-6 rounded-lg bg-red-50 p-6 font-bold text-red-700 ring-1 ring-red-100">{error}</p>}
      <section className="mt-6 grid gap-4 md:grid-cols-4">
        <StatCard label="Total issues" value={stats.total} icon={BarChart3} accent="#2364aa" />
        <StatCard label="Resolved" value={stats.resolved} icon={CheckCircle2} accent="#1f8a5b" />
        <StatCard label="Pending" value={stats.pending} icon={Clock} accent="#f4a261" />
        <StatCard label="Verified" value={stats.verified} icon={ShieldCheck} accent="#2a9d8f" />
      </section>
      <section className="mt-8 grid gap-6 lg:grid-cols-2">
        <Chart title="Issues by category" labels={categories} getValue={(label) => issues.filter((issue) => issue.category === label).length} total={issues.length} />
        <Chart title="Issues by severity" labels={severities} getValue={(label) => issues.filter((issue) => issue.severity === label).length} total={issues.length} />
        <Chart title="Issues by status" labels={statuses} getValue={(label) => issues.filter((issue) => issue.status === label).length} total={issues.length} />
        <div className="premium-card rounded-lg p-6">
          <h2 className="text-xl font-black text-civic-navy">Recent civic activity</h2>
          <div className="mt-5 space-y-3">
            {issues.slice(0, 6).map((issue) => (
              <div key={issue.id} className="rounded-lg border border-slate-100 bg-white p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="font-black text-civic-navy">{issue.title}</p>
                  <Badge label={issue.status} type="status" />
                </div>
                <p className="mt-1 text-sm text-slate-500">{issue.locationText} - {new Date(issue.updatedAt).toLocaleDateString()}</p>
              </div>
            ))}
            {!issues.length && <p className="rounded-lg bg-slate-50 p-4 text-sm font-semibold text-slate-500">No activity yet.</p>}
          </div>
        </div>
      </section>
      <section className="premium-card mt-8 rounded-lg p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-black text-civic-navy">Average resolution progress</h2>
          <span className="text-2xl font-black text-civic-green">{stats.progress}%</span>
        </div>
        <div className="mt-4 h-4 overflow-hidden rounded-full bg-slate-100">
          <div className="h-full rounded-full bg-civic-green" style={{ width: `${stats.progress}%` }} />
        </div>
      </section>
    </main>
  );
}

function Chart({ title, labels, getValue, total }: { title: string; labels: string[]; getValue: (label: string) => number; total: number }) {
  return (
    <div className="premium-card rounded-lg p-6 transition hover:-translate-y-0.5 hover:shadow-lift">
      <h2 className="text-xl font-black text-civic-navy">{title}</h2>
      <div className="mt-5 space-y-4">
        {labels.map((label) => {
          const value = getValue(label);
          const width = total ? Math.max(6, (value / total) * 100) : 0;
          return (
            <div key={label}>
              <div className="mb-1 flex justify-between text-sm font-bold text-slate-600">
                <span>{label}</span>
                <span>{value}</span>
              </div>
              <div className="h-3 overflow-hidden rounded-full bg-slate-100">
                <div className="h-full rounded-full bg-gradient-to-r from-civic-green to-civic-blue" style={{ width: `${width}%` }} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
