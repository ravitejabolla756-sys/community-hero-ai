import Link from "next/link";
import { ArrowRight, BarChart3, Bot, CheckCircle2, Clock3, MapPinned, Megaphone, ShieldCheck } from "lucide-react";

const features = [
  { icon: Megaphone, title: "Citizen reports", text: "Capture title, evidence, category, and precise location from mobile." },
  { icon: Bot, title: "AI triage", text: "Gemini classifies severity, department, urgency, and next action." },
  { icon: ShieldCheck, title: "Community verification", text: "Residents verify once, and three confirmations promote the case." },
  { icon: CheckCircle2, title: "Admin resolution", text: "Officials move issues through assignment, progress, and closure." }
];

const queue = [
  { title: "Road damage outside public school", meta: "Road Works Department", status: "Community Verified", severity: "High" },
  { title: "Streetlight outage near bus stand", meta: "Electricity Department", status: "Reported", severity: "High" },
  { title: "Garbage pile beside market entrance", meta: "Sanitation Department", status: "In Progress", severity: "Medium" }
];

export default function Home() {
  return (
    <main>
      <section className="border-b border-slate-200 bg-[#f8fafc]">
        <div className="shell grid min-h-[calc(100dvh-116px)] items-center gap-10 py-10 lg:grid-cols-[0.9fr_1.1fr] lg:py-16">
          <div>
            <p className="mb-5 inline-flex rounded-md border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-civic-green shadow-sm">
              Hyperlocal civic operations
            </p>
            <h1 className="max-w-3xl text-4xl font-black leading-[1.02] tracking-[-0.035em] text-civic-navy sm:text-5xl lg:text-6xl">
              Report local issues. Track public response.
            </h1>
            <p className="mt-5 max-w-[62ch] text-base leading-8 text-slate-600 sm:text-lg">
              Community Hero AI turns scattered civic complaints into verified, prioritized, and accountable municipal workflows.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href="/report" className="action-primary px-5 py-3">
                Report an issue <ArrowRight size={18} />
              </Link>
              <Link href="/issues" className="action-secondary px-5 py-3">
                View public tracker
              </Link>
            </div>
            <div className="mt-8 grid max-w-xl grid-cols-3 divide-x divide-slate-200 rounded-lg border border-slate-200 bg-white shadow-sm">
              {[
                ["AI", "triage"],
                ["3", "verifications"],
                ["Live", "status"]
              ].map(([value, label]) => (
                <div key={label} className="p-4">
                  <p className="font-mono text-2xl font-black tracking-[-0.04em] text-civic-navy">{value}</p>
                  <p className="mt-1 text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">{label}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-lg border border-slate-200 bg-white p-3 shadow-lift">
            <div className="overflow-hidden rounded-md border border-slate-200 bg-slate-50">
              <div className="flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Ward 12 queue</p>
                  <h2 className="mt-1 text-xl font-black tracking-[-0.02em] text-civic-navy">Civic response board</h2>
                </div>
                <span className="rounded-md bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700 ring-1 ring-emerald-200">Live</span>
              </div>
              <div className="grid gap-3 p-3">
                {queue.map((item) => (
                  <div key={item.title} className="rounded-md border border-slate-200 bg-white p-4 shadow-sm">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="font-bold leading-snug text-civic-navy">{item.title}</h3>
                        <p className="mt-1 text-sm text-slate-500">{item.meta}</p>
                      </div>
                      <span className="rounded-md bg-slate-100 px-2 py-1 text-xs font-bold text-slate-700">{item.severity}</span>
                    </div>
                    <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 text-sm">
                      <span className="font-semibold text-slate-600">{item.status}</span>
                      <Link href="/issues" className="font-bold text-civic-green">
                        Open
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-3 border-t border-slate-200 bg-white">
                {[
                  [Clock3, "12 pending"],
                  [MapPinned, "8 locations"],
                  [BarChart3, "47% resolved"]
                ].map(([Icon, label]) => (
                  <div key={String(label)} className="flex items-center gap-2 border-r border-slate-200 px-3 py-3 text-sm font-semibold text-slate-600 last:border-r-0">
                    <Icon className="text-civic-green" size={17} />
                    {label as string}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="shell py-14">
        <div className="mb-8 max-w-2xl">
          <p className="text-sm font-semibold text-civic-green">How the system works</p>
          <h2 className="mt-2 text-3xl font-black tracking-[-0.03em] text-civic-navy">From complaint to closure, without losing public trust.</h2>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <div key={feature.title} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-soft">
                <div className="grid h-10 w-10 place-items-center rounded-md bg-emerald-50 text-civic-green">
                  <Icon size={20} />
                </div>
                <h3 className="mt-5 text-lg font-black text-civic-navy">{feature.title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">{feature.text}</p>
              </div>
            );
          })}
        </div>
      </section>
    </main>
  );
}
