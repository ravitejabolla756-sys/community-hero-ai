import Link from "next/link";
import { ArrowRight, BarChart3, Bot, Building2, CheckCircle2, Clock3, FileCheck2, MapPinned, Megaphone, Route, ShieldCheck, UsersRound } from "lucide-react";

const features = [
  { icon: Megaphone, title: "Citizen reports", text: "Capture title, evidence, category, and precise location from mobile." },
  { icon: Bot, title: "AI triage", text: "Gemini classifies severity, department, urgency, and next action." },
  { icon: ShieldCheck, title: "Community verification", text: "Residents verify once, and three confirmations promote the case." },
  { icon: CheckCircle2, title: "Authority response", text: "Officials move issues through assignment, progress, and closure." }
];

const queue = [
  { title: "Road damage outside public school", meta: "Road Works Department", status: "Verified", severity: "High", eta: "24h" },
  { title: "Streetlight outage near bus stand", meta: "Electricity Department", status: "Reported", severity: "High", eta: "12h" },
  { title: "Garbage pile beside market entrance", meta: "Sanitation Department", status: "In progress", severity: "Medium", eta: "36h" }
];

export default function Home() {
  return (
    <main>
      <section className="hero-civic">
        <div className="shell relative z-10 flex min-h-[calc(100dvh-4.6rem)] flex-col justify-center py-12 sm:py-16">
          <div className="max-w-4xl">
            <p className="mb-5 inline-flex rounded-md border border-white/20 bg-white/12 px-3 py-1.5 text-xs font-black uppercase tracking-[0.2em] text-emerald-200 shadow-sm backdrop-blur">
              Civic issue ops for every locality
            </p>
            <h1 className="max-w-4xl text-5xl font-black leading-[0.92] tracking-[-0.06em] text-white sm:text-6xl lg:text-7xl">
              Turn street complaints into accountable public response.
            </h1>
            <p className="mt-6 max-w-[62ch] text-base leading-8 text-slate-100 sm:text-lg">
              Citizens report local issues with evidence. Community authorities receive a scoped queue, AI triage, verification signals, and a public trail from report to resolution.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href="/report" className="action-primary px-5 py-3">
                Report as citizen <ArrowRight size={18} />
              </Link>
              <Link href="/login" className="inline-flex items-center justify-center gap-2 rounded-md border border-white/25 bg-white/12 px-5 py-3 font-black text-white shadow-sm backdrop-blur transition hover:-translate-y-0.5 hover:bg-white/20">
                Authority login
              </Link>
            </div>
          </div>

          <div className="mt-10 grid gap-4 lg:grid-cols-[0.72fr_1fr] lg:items-end">
            <div className="hero-proof rounded-lg p-4 text-white">
              <div className="grid gap-3 sm:grid-cols-3">
                {[
                  ["AI", "triage JSON"],
                  ["3", "community checks"],
                  ["Area", "scoped queue"]
                ].map(([value, label]) => (
                  <div key={label} className="rounded-md bg-white/10 p-4 ring-1 ring-white/12">
                    <p className="font-mono text-3xl font-black tracking-[-0.05em]">{value}</p>
                    <p className="mt-1 text-xs font-black uppercase tracking-[0.14em] text-slate-200">{label}</p>
                  </div>
                ))}
              </div>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <div className="rounded-md bg-white/10 p-4 ring-1 ring-white/12">
                  <div className="flex items-center gap-3">
                    <UsersRound size={20} className="text-emerald-200" />
                    <p className="font-black">Citizen mode</p>
                  </div>
                  <p className="mt-2 text-sm leading-6 text-slate-200">Report, verify, comment, and track status in your selected area.</p>
                </div>
                <div className="rounded-md bg-white/10 p-4 ring-1 ring-white/12">
                  <div className="flex items-center gap-3">
                    <Building2 size={20} className="text-emerald-200" />
                    <p className="font-black">Authority mode</p>
                  </div>
                  <p className="mt-2 text-sm leading-6 text-slate-200">Review citizen reports, update status, and publish official response notes.</p>
                </div>
              </div>
            </div>

            <div className="authority-board overflow-hidden rounded-lg p-3">
              <div className="overflow-hidden rounded-md border border-slate-200 bg-[#f7faf9]">
                <div className="flex items-center justify-between border-b border-slate-200 bg-white/90 px-4 py-4">
                  <div>
                    <p className="text-xs font-black uppercase tracking-[0.18em] text-civic-green">Live area command</p>
                    <h2 className="mt-1 text-2xl font-black tracking-[-0.04em] text-civic-navy">Response board</h2>
                  </div>
                  <span className="rounded-md bg-emerald-50 px-2.5 py-1 text-xs font-black text-emerald-700 ring-1 ring-emerald-200">Active</span>
                </div>
                <div className="grid gap-3 p-3">
                  {queue.map((item, index) => (
                    <div key={item.title} className="rounded-md border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-soft">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex gap-3">
                          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-md bg-slate-100 font-mono text-sm font-black text-civic-navy">
                            0{index + 1}
                          </span>
                          <div>
                            <h3 className="font-black leading-snug text-civic-navy">{item.title}</h3>
                            <p className="mt-1 text-sm text-slate-500">{item.meta}</p>
                          </div>
                        </div>
                        <span className="rounded-md bg-amber-50 px-2 py-1 text-xs font-black text-amber-800 ring-1 ring-amber-200">{item.severity}</span>
                      </div>
                      <div className="mt-4 grid grid-cols-3 gap-2 border-t border-slate-100 pt-3 text-sm">
                        <span className="font-bold text-slate-600">{item.status}</span>
                        <span className="font-bold text-slate-500">SLA {item.eta}</span>
                        <Link href="/issues" className="text-right font-black text-civic-green">
                          Open
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-3 border-t border-slate-200 bg-white/90">
                  {[
                    [Clock3, "12 pending"],
                    [MapPinned, "8 locations"],
                    [BarChart3, "47% resolved"]
                  ].map(([Icon, label]) => (
                    <div key={String(label)} className="flex items-center gap-2 border-r border-slate-200 px-3 py-3 text-sm font-bold text-slate-600 last:border-r-0">
                      <Icon className="text-civic-green" size={17} />
                      {label as string}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="shell relative z-10 -mt-4 py-16">
        <div className="mb-8 grid gap-4 lg:grid-cols-[0.75fr_1fr] lg:items-end">
          <div>
            <p className="page-kicker">How the system works</p>
            <h2 className="mt-2 text-4xl font-black tracking-[-0.045em] text-civic-navy">From complaint to closure, without losing public trust.</h2>
          </div>
          <p className="max-w-2xl leading-7 text-slate-600">
            The product separates citizen reporting from authority response, then keeps every case searchable, scoped, and auditable.
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <div key={feature.title} className="premium-card rounded-lg p-5 transition duration-200 hover:-translate-y-0.5 hover:shadow-lift">
                <div className="grid h-11 w-11 place-items-center rounded-md bg-emerald-50 text-civic-green ring-1 ring-emerald-100">
                  <Icon size={20} />
                </div>
                <h3 className="mt-5 text-lg font-black text-civic-navy">{feature.title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">{feature.text}</p>
              </div>
            );
          })}
        </div>
        <div className="premium-card mt-6 grid gap-4 rounded-lg p-5 lg:grid-cols-[auto_1fr_auto] lg:items-center">
          <div className="grid h-12 w-12 place-items-center rounded-md bg-civic-navy text-white">
            <Route size={22} />
          </div>
          <div>
            <h3 className="text-xl font-black tracking-[-0.03em] text-civic-navy">Built for scoped civic data, not one global noise feed.</h3>
            <p className="mt-1 max-w-3xl leading-7 text-slate-600">Every signup captures country, state, district, locality, and municipality/community so citizens and authorities see the right area.</p>
          </div>
          <Link href="/login" className="action-secondary px-5 py-3">
            Create account <FileCheck2 size={18} />
          </Link>
        </div>
      </section>
    </main>
  );
}
