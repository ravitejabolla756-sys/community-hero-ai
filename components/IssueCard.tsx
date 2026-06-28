import Link from "next/link";
import { ArrowRight, CalendarDays, MapPin, ShieldCheck } from "lucide-react";
import { Badge } from "@/components/Badge";
import { IssueImage } from "@/components/IssueImage";
import { Issue } from "@/lib/types";

export function IssueCard({ issue }: { issue: Issue }) {
  return (
    <article className="premium-card group overflow-hidden rounded-lg transition duration-200 hover:-translate-y-1 hover:shadow-lift">
      <div className="relative h-52 bg-slate-100">
        <IssueImage src={issue.imageUrl} alt={issue.title} category={issue.category} className="h-full w-full transition duration-500 group-hover:scale-105" />
        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-civic-navy/65 to-transparent" />
        <div className="absolute left-4 top-4 flex flex-wrap gap-2">
          <Badge label={issue.severity} type="severity" />
          <Badge label={issue.status} type="status" />
        </div>
        <div className="absolute bottom-4 left-4 rounded-md bg-white/90 px-3 py-1.5 text-[11px] font-black uppercase tracking-[0.14em] text-civic-navy shadow-sm ring-1 ring-white/70 backdrop-blur">
          {issue.category}
        </div>
      </div>
      <div className="space-y-4 p-5">
        <div>
          <h3 className="line-clamp-2 text-xl font-black leading-tight tracking-[-0.03em] text-civic-navy">{issue.title}</h3>
        </div>
        <p className="line-clamp-2 min-h-10 text-sm leading-6 text-slate-600">{issue.aiSummary || issue.description}</p>
        <div className="grid gap-2 text-sm text-slate-500">
          <span className="flex items-center gap-2">
            <MapPin size={16} className="text-civic-green" />
            <span className="line-clamp-1">{issue.locationText}</span>
          </span>
          <span className="flex items-center gap-2">
            <CalendarDays size={16} className="text-civic-blue" />
            {new Date(issue.createdAt).toLocaleDateString()}
          </span>
        </div>
        <div className="flex items-center justify-between border-t border-slate-100 pt-4">
          <span className="inline-flex items-center gap-2 text-sm font-black text-civic-green">
            <ShieldCheck size={17} />
            {issue.verificationCount} verifications
          </span>
          <Link href={`/issues/${issue.id}`} className="inline-flex items-center gap-1 rounded-md bg-civic-navy px-4 py-2 text-sm font-extrabold text-white transition hover:bg-civic-green">
            Details <ArrowRight size={15} />
          </Link>
        </div>
      </div>
    </article>
  );
}
