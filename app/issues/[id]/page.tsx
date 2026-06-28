"use client";

import Link from "next/link";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { Clock, MapPin, MessageSquare, ShieldCheck, Sparkles } from "lucide-react";
import { Badge } from "@/components/Badge";
import { IssueImage } from "@/components/IssueImage";
import { useAuth } from "@/components/AuthProvider";
import { useToast } from "@/components/ToastProvider";
import { addComment, getCommentsByIssueId, getIssueById, getIssuesForScope, verifyIssue } from "@/lib/firebase/firestore";
import { Comment, Issue, statuses } from "@/lib/types";

export default function IssueDetailsPage() {
  const params = useParams<{ id: string }>();
  const { user } = useAuth();
  const toast = useToast();
  const [issue, setIssue] = useState<Issue | null>(null);
  const [issues, setIssues] = useState<Issue[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function refresh() {
    setError("");
    try {
      const [loadedIssue, loadedIssues, loadedComments] = await Promise.all([
        getIssueById(params.id),
        getIssuesForScope(user?.municipalityId),
        getCommentsByIssueId(params.id)
      ]);
      if (loadedIssue && user?.municipalityId && loadedIssue.municipalityId !== user.municipalityId) {
        setIssue(null);
        setIssues([]);
        setComments([]);
        setError("This report belongs to another municipality or service area.");
        return;
      }
      setIssue(loadedIssue);
      setIssues(loadedIssues);
      setComments(loadedComments);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load issue details.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refresh();
  }, [params.id, user?.municipalityId]);

  const similar = useMemo(() => issues.filter((item) => item.id !== issue?.id && item.category === issue?.category).slice(0, 3), [issue, issues]);
  const alreadyVerified = Boolean(user && issue?.verifiedBy.includes(user.uid));

  async function verify() {
    if (!user || !issue) return toast("Please login to verify", "error");
    setSaving(true);
    try {
      await verifyIssue(issue.id, user.uid);
      toast("Verification recorded", "success");
      await refresh();
    } catch (err) {
      toast(err instanceof Error ? err.message : "Could not verify issue", "error");
    } finally {
      setSaving(false);
    }
  }

  async function submitComment(event: FormEvent) {
    event.preventDefault();
    if (!user || !issue) return toast("Please login to comment", "error");
    setSaving(true);
    try {
      await addComment({ issueId: issue.id, text: comment, userId: user.uid, userEmail: user.email });
      setComment("");
      await refresh();
    } catch (err) {
      toast(err instanceof Error ? err.message : "Could not add comment", "error");
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <main className="shell py-10 font-bold text-slate-600">Loading issue...</main>;
  if (error) return <main className="shell py-10 rounded-lg text-red-700">{error}</main>;
  if (!issue) return <main className="shell py-10 font-bold text-slate-600">Issue not found.</main>;

  return (
    <main className="shell py-8">
      <div className="grid gap-6 lg:grid-cols-[1fr_0.42fr]">
        <section className="premium-card overflow-hidden rounded-lg">
          <div className="relative h-80">
            <IssueImage src={issue.imageUrl} alt={issue.title} category={issue.category} className="h-full w-full" />
            <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-civic-navy/80 to-transparent" />
            <div className="absolute bottom-5 left-5 right-5">
              <p className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-black uppercase text-white ring-1 ring-white/20 backdrop-blur">
                <Sparkles size={14} /> AI triaged report
              </p>
            </div>
          </div>
          <div className="space-y-6 p-6">
            <div className="flex flex-wrap gap-2">
              <Badge label={issue.category} />
              <Badge label={issue.severity} type="severity" />
              <Badge label={issue.status} type="status" />
            </div>
            <div>
              <h1 className="text-3xl font-black text-civic-navy sm:text-4xl">{issue.title}</h1>
              <p className="mt-3 leading-8 text-slate-700">{issue.description}</p>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <Info label="AI summary" value={issue.aiSummary} />
              <Info label="Suggested department" value={issue.suggestedDepartment} />
              <Info label="Urgency reason" value={issue.urgencyReason} />
              <Info label="Recommended action" value={issue.recommendedAction} />
              <Info label="Location" value={issue.locationText} />
              <Info label="Municipality" value={issue.municipalityName} />
            </div>
            <section>
              <h2 className="mb-3 flex items-center gap-2 text-xl font-black text-civic-navy">
                <Clock /> Status timeline
              </h2>
              <div className="grid gap-3">
                {statuses.map((status) => (
                  <div key={status} className="flex items-center gap-3">
                    <span className={`status-dot ${status === issue.status ? "bg-civic-green" : "bg-slate-300"}`} />
                    <span className={status === issue.status ? "font-black text-civic-navy" : "text-slate-500"}>{status}</span>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </section>
        <aside className="space-y-5">
          <div className="premium-card rounded-lg p-5">
            <h2 className="flex items-center gap-2 text-xl font-black text-civic-navy">
              <ShieldCheck /> Community verification
            </h2>
            <p className="mt-2 text-slate-600">{issue.verificationCount}/3 verifications before community-verified status.</p>
            <div className="mt-4 h-3 overflow-hidden rounded-full bg-slate-100">
              <div className="h-full rounded-full bg-gradient-to-r from-civic-green to-civic-blue" style={{ width: `${Math.min(100, (issue.verificationCount / 3) * 100)}%` }} />
            </div>
            <button disabled={saving || alreadyVerified} onClick={verify} className="action-primary mt-4 w-full px-5 py-3 disabled:opacity-60">
              {saving ? "Saving..." : alreadyVerified ? "Already verified" : "Verify this issue"}
            </button>
          </div>
          <div className="premium-card rounded-lg p-5">
            <h2 className="flex items-center gap-2 text-xl font-black text-civic-navy">
              <MapPin /> Location
            </h2>
            <p className="mt-2 text-slate-600">{issue.locationText}</p>
            <Link href="/map" className="action-secondary mt-4 px-4 py-2">
              Open map
            </Link>
          </div>
          <div className="premium-card rounded-lg p-5">
            <h2 className="flex items-center gap-2 text-xl font-black text-civic-navy">
              <MessageSquare /> Comments
            </h2>
            <form onSubmit={submitComment} className="mt-4 flex gap-2">
              <input value={comment} onChange={(event) => setComment(event.target.value)} required placeholder="Add update..." className="field py-2" />
              <button disabled={saving} className="action-primary px-4 py-2 disabled:opacity-60">Post</button>
            </form>
            <div className="mt-4 space-y-3">
              {comments.map((item) => (
                <div key={item.id} className="rounded-lg bg-slate-50 p-3">
                  <p className="text-sm text-slate-700">{item.text}</p>
                  <p className="mt-1 text-xs font-bold text-slate-400">{item.userEmail}</p>
                </div>
              ))}
              {!comments.length && <p className="rounded-lg bg-slate-50 p-3 text-sm font-semibold text-slate-500">No comments yet. Add the first community update.</p>}
            </div>
          </div>
        </aside>
      </div>
      {!!similar.length && (
        <section className="premium-card mt-8 rounded-lg p-5">
          <h2 className="text-xl font-black text-civic-navy">Similar nearby issues</h2>
          <div className="mt-4 grid gap-3 md:grid-cols-3">
            {similar.map((item) => (
              <Link key={item.id} href={`/issues/${item.id}`} className="rounded-lg border border-slate-200 bg-white p-4 font-bold text-civic-navy transition hover:-translate-y-0.5 hover:border-civic-blue/40">
                {item.title}
              </Link>
            ))}
          </div>
        </section>
      )}
    </main>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-slate-100 bg-slate-50 p-4">
      <p className="text-xs font-black uppercase tracking-wider text-slate-400">{label}</p>
      <p className="mt-2 font-semibold leading-7 text-slate-700">{value}</p>
    </div>
  );
}
