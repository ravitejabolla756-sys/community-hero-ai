"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { MapPinned } from "lucide-react";
import { Badge } from "@/components/Badge";
import { GoogleIssueMap } from "@/components/GoogleIssueMap";
import { useAuth } from "@/components/AuthProvider";
import { AuthGate } from "@/components/AuthGate";
import { getIssuesForScope } from "@/lib/firebase/firestore";
import { Issue } from "@/lib/types";

export default function MapPage() {
  const { user, loading: authLoading } = useAuth();
  const [issues, setIssues] = useState<Issue[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const mapKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  useEffect(() => {
    if (authLoading || !user?.municipalityId) return;
    setLoading(true);
    getIssuesForScope(user?.municipalityId)
      .then(setIssues)
      .catch((err) => setError(err instanceof Error ? err.message : "Could not load map issues."))
      .finally(() => setLoading(false));
  }, [authLoading, user?.municipalityId]);

  return (
    <AuthGate label="the community map">
    <main className="shell py-8">
      <div className="page-panel rounded-lg p-6">
        <p className="page-kicker">Hyperlocal visibility</p>
        <h1 className="page-title mt-2 flex items-center gap-3 text-3xl font-black text-civic-navy sm:text-4xl">
          <MapPinned /> Community Map
        </h1>
        <p className="mt-3 max-w-2xl leading-7 text-slate-600">
          Geographic view of reported issues in {user?.municipalityName || "your municipality"} and their current status.
        </p>
      </div>
      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_0.38fr]">
        <section className="premium-card min-h-[560px] overflow-hidden rounded-lg">
          <GoogleIssueMap apiKey={mapKey} issues={issues} />
        </section>
        <aside className="space-y-3">
          {loading && <p className="rounded-lg bg-white p-5 font-bold text-slate-500 shadow-soft">Loading map issues...</p>}
          {error && <p className="rounded-lg bg-red-50 p-5 font-bold text-red-700 ring-1 ring-red-100">{error}</p>}
          {!loading && issues.map((issue) => (
            <Link key={issue.id} href={`/issues/${issue.id}`} className="premium-card block rounded-lg p-4 transition hover:-translate-y-0.5 hover:shadow-lift">
              <div className="flex flex-wrap gap-2">
                <Badge label={issue.severity} type="severity" />
                <Badge label={issue.status} type="status" />
              </div>
              <h2 className="mt-3 font-black text-civic-navy">{issue.title}</h2>
              <p className="mt-1 text-sm text-slate-500">{issue.locationText}</p>
            </Link>
          ))}
        </aside>
      </div>
    </main>
    </AuthGate>
  );
}
