"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { AlertTriangle, CheckCircle2, Clock, FileWarning, Inbox, Plus, ShieldCheck } from "lucide-react";
import { EmptyState } from "@/components/EmptyState";
import { IssueCard } from "@/components/IssueCard";
import { CardGridSkeleton } from "@/components/Skeletons";
import { StatCard } from "@/components/StatCard";
import { useAuth } from "@/components/AuthProvider";
import { AuthGate } from "@/components/AuthGate";
import { getIssuesForScope } from "@/lib/firebase/firestore";
import { Issue } from "@/lib/types";

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const [issues, setIssues] = useState<Issue[]>([]);
  const [loadingIssues, setLoadingIssues] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (authLoading || !user?.municipalityId) return;
    setLoadingIssues(true);
    getIssuesForScope(user?.municipalityId)
      .then(setIssues)
      .catch((err) => setError(err instanceof Error ? err.message : "Could not load dashboard issues."))
      .finally(() => setLoadingIssues(false));
  }, [authLoading, user?.municipalityId]);

  const isAuthority = user?.role === "admin";
  const dashboardIssues = useMemo(() => {
    if (!user) return issues;
    if (user.role === "admin") return issues;
    return issues.filter((issue) => issue.reportedBy === user.uid || issue.reportedByEmail === user.email);
  }, [issues, user]);

  return (
    <AuthGate label="your dashboard">
    <main className="shell py-8">
      <div className="page-panel rounded-lg p-6">
        <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
        <div>
          <p className="page-kicker">{isAuthority ? "Authority command center" : "Citizen command center"}</p>
          <h1 className="page-title mt-2 text-3xl font-black text-civic-navy sm:text-4xl">
            {isAuthority ? "Area response queue" : "Your civic reports"}
          </h1>
          <p className="mt-3 max-w-2xl leading-7 text-slate-600">
            {isAuthority
              ? `Review citizen reports for ${user?.municipalityName || "your area"}, update progress, and coordinate municipal response.`
              : `Track reports you created in ${user?.municipalityName || "your municipality"}, see verification progress, and jump back into the public tracker.`}
          </p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row">
          {isAuthority ? (
            <Link href="/admin" className="action-primary px-5 py-3">
              <ShieldCheck size={18} /> Open response queue
            </Link>
          ) : (
            <Link href="/report" className="action-primary px-5 py-3">
              <Plus size={18} /> Report new issue
            </Link>
          )}
          <Link href="/issues" className="action-secondary px-5 py-3">
            View public tracker
          </Link>
        </div>
        </div>
      </div>
      <section className="mt-6 grid gap-4 md:grid-cols-5">
        <StatCard label={isAuthority ? "Area reports" : "Total reported"} value={dashboardIssues.length} icon={FileWarning} accent="#2364aa" />
        <StatCard label="Verified" value={dashboardIssues.filter((issue) => issue.status === "Community Verified").length} icon={ShieldCheck} accent="#1f8a5b" />
        <StatCard label="Resolved" value={dashboardIssues.filter((issue) => issue.status === "Resolved").length} icon={CheckCircle2} accent="#2a9d8f" />
        <StatCard label="Pending" value={dashboardIssues.filter((issue) => issue.status !== "Resolved").length} icon={Clock} accent="#f4a261" />
        <StatCard label="High priority" value={dashboardIssues.filter((issue) => issue.severity === "High" || issue.severity === "Critical").length} icon={AlertTriangle} accent="#d84727" />
      </section>
      <section className="mt-8">
        <h2 className="mb-4 text-2xl font-black text-civic-navy">{isAuthority ? "Recent area reports" : "Recent issues"}</h2>
        {loadingIssues && (
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            <CardGridSkeleton count={3} />
          </div>
        )}
        {error && <p className="rounded-lg bg-red-50 p-6 font-bold text-red-700 ring-1 ring-red-100">{error}</p>}
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {!loadingIssues && dashboardIssues.slice(0, 6).map((issue) => (
            <IssueCard key={issue.id} issue={issue} />
          ))}
        </div>
        {!loadingIssues && !error && dashboardIssues.length === 0 && (
          <EmptyState
            icon={Inbox}
            title={isAuthority ? "No area reports yet" : "No reports yet"}
            text={
              isAuthority
                ? "Citizen reports for this area will appear here for review, status updates, and resolution."
                : "Start by reporting one local issue. Your reports will appear here with verification and resolution status."
            }
            actionHref={isAuthority ? "/admin" : "/report"}
            actionLabel={isAuthority ? "Open response queue" : "Report first issue"}
          />
        )}
      </section>
    </main>
    </AuthGate>
  );
}
