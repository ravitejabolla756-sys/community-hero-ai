import Link from "next/link";
import { ArrowRight, BarChart3, Bot, CheckCircle2, Clock3, MapPinned, Megaphone, Route, ShieldCheck } from "lucide-react";

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
      <section className="relative overflow-hidden border-b border-slate-200/70">
        <div className="shell grid min-h-[calc(100dvh-116px)] items-center gap-10 py-10 lg:grid-cols-[0.92fr_1.08fr] lg:py-16">
          <div className="relative z-10">
            <p className="mb-5 inline-flex rounded-md border border-emerald-200 bg-white/80 px-3 py-1.5 text-xs font-black uppercase tracking-[0.18em] text-civic-green shadow-sm backdrop-blur">
              Civic issue ops for any locality
            </p>
            <h1 className="max-w-3xl text-5xl font-black leading-[0.94] tracking-[-0.055em] text-civic-navy sm:text-6xl lg:text-7xl">
              Report, verify, and resolve local problems in one public loop.
            </h1>
            <p className="mt-6 max-w-[60ch] text-base leading-8 text-slate-600 sm:text-lg">
              Community Hero AI gives citizens a clean reporting flow and gives authorities a scoped response queue for their municipality, district, ward, or community.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href="/report" className="action-primary px-5 py-3">
                Start citizen report <ArrowRight size={18} />
              </Link>
              <Link href="/login" className="action-secondary px-5 py-3">
                Authority access
              </Link>
            </div>
            <div className="mt-9 grid max-w-2xl grid-cols-3 overflow-hidden rounded-lg border border-slate-200 bg-white/76 shadow-soft backdrop-blur">
              {[
                ["AI", "triage"],
                ["3", "verifications"],
                ["Area", "scoping"]
              ].map(([value, label]) => (
                <div key={label} className="border-r border-slate-200 p-4 last:border-r-0">
                  <p className="font-mono text-3xl font-black tracking-[-0.05em] text-civic-navy">{value}</p>
                  <p className="mt-1 text-xs font-black uppercase tracking-[0.14em] text-slate-500">{label}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="relative z-10 lg:pl-4">
            <div className="premium-card overflow-hidden rounded-lg p-3">
              <div className="overflow-hidden rounded-md border border-slate-200 bg-[#f7faf9]">
                <div className="flex items-center justify-between border-b border-slate-200 bg-white/90 px-4 py-4">
                  <div>
                    <p className="text-xs font-black uppercase tracking-[0.18em] text-civic-green">Area command queue</p>
                    <h2 className="mt-1 text-2xl font-black tracking-[-0.04em] text-civic-navy">Civic response board</h2>
                  </div>
                  <span className="rounded-md bg-emerald-50 px-2.5 py-1 text-xs font-black text-emerald-700 ring-1 ring-emerald-200">Live</span>
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
            <div className="premium-card ml-auto mt-4 grid max-w-md grid-cols-[auto_1fr] gap-3 rounded-lg p-4">
              <div className="grid h-11 w-11 place-items-center rounded-md bg-civic-navy text-white">
                <Route size={21} />
              </div>
              <div>
                <p className="text-sm font-black text-civic-navy">Role-scoped data</p>
                <p className="mt-1 text-sm leading-6 text-slate-600">Citizens see their reports. Authorities see only their selected area queue.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="shell py-16">
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
      </section>
    </main>
  );
}
