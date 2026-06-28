"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Building2, CheckCircle2, Globe2, Lock, Mail, MapPin, Phone, ShieldCheck, User, UsersRound } from "lucide-react";
import { useAuth } from "@/components/AuthProvider";
import { useToast } from "@/components/ToastProvider";
import { firebaseEnabled } from "@/lib/firebase/config";

type EntryRole = "citizen" | "owner";

const roleOptions: Record<EntryRole, {
  title: string;
  eyebrow: string;
  description: string;
  icon: typeof UsersRound;
  bullets: string[];
}> = {
  citizen: {
    title: "Citizen",
    eyebrow: "Report and track",
    description: "For residents who want to report local issues, verify nearby complaints, and follow resolution status.",
    icon: UsersRound,
    bullets: ["Submit evidence", "Track your reports", "Verify community issues"]
  },
  owner: {
    title: "Community authority",
    eyebrow: "Manage response",
    description: "For municipality officers, ward heads, sanitation leaders, district coordinators, or community heads managing local reports.",
    icon: Building2,
    bullets: ["Review area reports", "Coordinate departments", "Use admin view when authorized"]
  }
};

export default function LoginPage() {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [entryRole, setEntryRole] = useState<EntryRole>("citizen");
  const [name, setName] = useState("");
  const [mobile, setMobile] = useState("");
  const [country, setCountry] = useState("India");
  const [stateName, setStateName] = useState("");
  const [district, setDistrict] = useState("");
  const [place, setPlace] = useState("");
  const [municipalityName, setMunicipalityName] = useState("Community Demo Ward");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { login, signup } = useAuth();
  const toast = useToast();
  const router = useRouter();

  async function submit(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    try {
      const nextUser =
        mode === "signup"
          ? await signup({ name, mobile, country, state: stateName, district, place, municipalityName }, email, password)
          : await login(email, password);
      toast("Welcome to Community Hero AI", "success");
      router.push(entryRole === "owner" && nextUser?.role === "admin" ? "/admin" : "/dashboard");
    } catch (error) {
      toast(error instanceof Error ? error.message : "Authentication failed", "error");
    } finally {
      setLoading(false);
    }
  }

  async function demoLogin(demoEmail: string) {
    setLoading(true);
    try {
      await login(demoEmail, "password123");
      toast(demoEmail.startsWith("admin") ? "Admin demo mode ready" : "Citizen demo mode ready", "success");
      router.push(demoEmail.startsWith("admin") ? "/admin" : "/dashboard");
    } catch (error) {
      toast(error instanceof Error ? error.message : "Demo login failed", "error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="auth-shell shell grid min-h-[calc(100vh-72px)] items-center py-8 md:py-12">
      <section className="auth-frame grid overflow-hidden rounded-[1.35rem] bg-white shadow-[0_24px_80px_rgba(18,48,71,0.12)] ring-1 ring-slate-200 lg:grid-cols-[0.95fr_1.05fr]">
        <aside className="relative hidden min-h-[680px] overflow-hidden bg-[#102d43] p-8 text-white lg:block">
          <div className="absolute inset-0 opacity-35 [background-image:linear-gradient(rgba(255,255,255,.08)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.08)_1px,transparent_1px)] [background-size:32px_32px]" />
          <div className="absolute inset-x-0 bottom-0 h-56 bg-gradient-to-t from-[#0b1f30] to-transparent" />
          <div className="relative z-10">
            <p className="text-xs font-black uppercase tracking-[0.24em] text-emerald-300">Civic access desk</p>
            <h1 className="mt-5 max-w-sm text-5xl font-black leading-[0.95] tracking-[-0.04em]">
              One portal for reports and response.
            </h1>
            <p className="mt-5 max-w-md text-lg leading-8 text-slate-200">
              Citizens raise verified issues. Area authorities and community heads get a cleaner way to act on them.
            </p>
          </div>

          <div className="relative z-10 mt-12 grid gap-4">
            {(["citizen", "owner"] as EntryRole[]).map((role) => {
              const option = roleOptions[role];
              const Icon = option.icon;

              return (
                <div key={role} className="rounded-xl bg-white/10 p-5 shadow-inner ring-1 ring-white/15 backdrop-blur">
                  <div className="flex items-center gap-3">
                    <div className="grid h-11 w-11 place-items-center rounded-lg bg-white text-civic-navy">
                      <Icon size={22} />
                    </div>
                    <div>
                      <p className="text-xs font-black uppercase tracking-[0.18em] text-emerald-300">{option.eyebrow}</p>
                      <p className="font-black">{option.title}</p>
                    </div>
                  </div>
                  <p className="mt-4 text-sm leading-6 text-slate-200">{option.description}</p>
                </div>
              );
            })}
          </div>

          <div className="relative z-10 mt-10 rounded-xl border border-white/15 bg-white/10 p-5">
            <p className="text-sm font-bold text-slate-200">Demo tip</p>
            <p className="mt-2 text-sm leading-6 text-slate-300">
              Use citizen mode for issue reporting, then use the authority/admin path to show response operations.
            </p>
          </div>
        </aside>

        <form onSubmit={submit} className="p-5 sm:p-8 lg:p-10">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="grid h-14 w-14 place-items-center rounded-xl bg-civic-green/10 text-civic-green">
                <ShieldCheck size={28} />
              </div>
              <p className="mt-5 text-xs font-black uppercase tracking-[0.22em] text-civic-green">Choose access type</p>
              <h2 className="mt-2 text-4xl font-black leading-none tracking-[-0.04em] text-civic-navy">
                {mode === "login" ? "Sign in" : "Create account"}
              </h2>
            </div>
            <div className="rounded-lg bg-slate-50 px-3 py-2 text-right ring-1 ring-slate-200">
              <p className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-400">Mode</p>
              <p className="text-sm font-black text-civic-navy">{entryRole === "citizen" ? "Citizen" : "Authority"}</p>
            </div>
          </div>
          <p className="mt-4 max-w-xl leading-7 text-slate-600">
            Pick how you are entering Community Hero AI. Your area keeps reports scoped to the right municipality, ward, district, or community.
          </p>

          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            {(["citizen", "owner"] as EntryRole[]).map((role) => {
              const option = roleOptions[role];
              const Icon = option.icon;
              const active = entryRole === role;

              return (
                <button
                  key={role}
                  type="button"
                  onClick={() => setEntryRole(role)}
                  className={`group rounded-xl p-4 text-left ring-1 transition duration-200 hover:-translate-y-0.5 ${
                    active
                      ? "bg-civic-navy text-white shadow-[0_18px_36px_rgba(18,48,71,0.18)] ring-civic-navy"
                      : "bg-slate-50 text-civic-navy ring-slate-200 hover:bg-white hover:shadow-soft"
                  }`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className={`grid h-11 w-11 place-items-center rounded-lg ${active ? "bg-white/12 text-white" : "bg-white text-civic-green ring-1 ring-slate-200"}`}>
                      <Icon size={22} />
                    </div>
                    {active && <CheckCircle2 size={20} className="text-emerald-300" />}
                  </div>
                  <p className={`mt-4 text-[11px] font-black uppercase tracking-[0.18em] ${active ? "text-emerald-300" : "text-civic-green"}`}>{option.eyebrow}</p>
                  <h3 className="mt-1 text-xl font-black">{option.title}</h3>
                  <p className={`mt-2 text-sm leading-6 ${active ? "text-slate-200" : "text-slate-600"}`}>{option.description}</p>
                </button>
              );
            })}
          </div>

        {!firebaseEnabled && (
          <div className="mt-6 grid gap-3 rounded-xl bg-amber-50 p-3 ring-1 ring-amber-100 sm:grid-cols-2">
            <button type="button" onClick={() => demoLogin("citizen@example.com")} className="action-secondary px-4 py-3 text-sm">
              Try citizen demo
            </button>
            <button type="button" onClick={() => demoLogin("admin@example.com")} className="action-secondary px-4 py-3 text-sm">
              Try authority/admin demo
            </button>
          </div>
        )}
        <div className="mt-6 space-y-4">
          {mode === "signup" && (
            <>
              <label className="block">
                <span className="text-sm font-bold text-slate-600">Name</span>
                <div className="mt-2 flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 transition focus-within:border-civic-blue focus-within:ring-4 focus-within:ring-civic-blue/10">
                  <User size={18} />
                  <input value={name} onChange={(event) => setName(event.target.value)} required className="w-full py-3 outline-none" />
                </div>
              </label>
              <label className="block">
                <span className="text-sm font-bold text-slate-600">Mobile number</span>
                <div className="mt-2 flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 transition focus-within:border-civic-blue focus-within:ring-4 focus-within:ring-civic-blue/10">
                  <Phone size={18} />
                  <input
                    value={mobile}
                    onChange={(event) => setMobile(event.target.value)}
                    required
                    inputMode="tel"
                    pattern="[0-9+\-\s]{8,15}"
                    className="w-full py-3 outline-none"
                    placeholder="+91 98765 43210"
                  />
                </div>
              </label>
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block">
                  <span className="text-sm font-bold text-slate-600">Country</span>
                  <div className="mt-2 flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 transition focus-within:border-civic-blue focus-within:ring-4 focus-within:ring-civic-blue/10">
                    <Globe2 size={18} />
                    <input value={country} onChange={(event) => setCountry(event.target.value)} required className="w-full py-3 outline-none" />
                  </div>
                </label>
                <label className="block">
                  <span className="text-sm font-bold text-slate-600">State</span>
                  <input value={stateName} onChange={(event) => setStateName(event.target.value)} required className="field mt-2" placeholder="Telangana" />
                </label>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block">
                  <span className="text-sm font-bold text-slate-600">District</span>
                  <input value={district} onChange={(event) => setDistrict(event.target.value)} required className="field mt-2" placeholder="Hyderabad" />
                </label>
                <label className="block">
                  <span className="text-sm font-bold text-slate-600">Place / locality</span>
                  <input value={place} onChange={(event) => setPlace(event.target.value)} required className="field mt-2" placeholder="Kukatpally" />
                </label>
              </div>
              <label className="block">
                <span className="text-sm font-bold text-slate-600">Municipality / district / ward / community</span>
                <div className="mt-2 flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 transition focus-within:border-civic-blue focus-within:ring-4 focus-within:ring-civic-blue/10">
                  <MapPin size={18} />
                  <input
                    value={municipalityName}
                    onChange={(event) => setMunicipalityName(event.target.value)}
                    required
                    className="w-full py-3 outline-none"
                    placeholder="Example: Kukatpally Ward 12"
                  />
                </div>
                <span className="mt-2 block text-xs font-semibold text-slate-500">Reports and authority/admin views are filtered to this area.</span>
              </label>
            </>
          )}
          <label className="block">
            <span className="text-sm font-bold text-slate-600">Email</span>
            <div className="mt-2 flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 transition focus-within:border-civic-blue focus-within:ring-4 focus-within:ring-civic-blue/10">
              <Mail size={18} />
              <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} required className="w-full py-3 outline-none" />
            </div>
          </label>
          <label className="block">
            <span className="text-sm font-bold text-slate-600">Password</span>
            <div className="mt-2 flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 transition focus-within:border-civic-blue focus-within:ring-4 focus-within:ring-civic-blue/10">
              <Lock size={18} />
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
                minLength={6}
                className="w-full py-3 outline-none"
              />
            </div>
          </label>
        </div>
        <button disabled={loading} className="action-primary mt-6 w-full px-5 py-3 disabled:opacity-60">
          {loading ? "Please wait..." : mode === "login" ? (
            <>
              Continue as {entryRole === "citizen" ? "citizen" : "community authority"} <ArrowRight size={18} />
            </>
          ) : (
            <>
              Create {entryRole === "citizen" ? "citizen" : "authority"} account <ArrowRight size={18} />
            </>
          )}
        </button>
        <button
          type="button"
          onClick={() => setMode(mode === "login" ? "signup" : "login")}
          className="mt-4 w-full text-sm font-black text-civic-blue"
        >
          {mode === "login" ? "Need an account? Sign up" : "Already registered? Login"}
        </button>
        <div className="mt-6 grid gap-2 rounded-xl bg-slate-50 p-4 ring-1 ring-slate-200">
          {roleOptions[entryRole].bullets.map((bullet) => (
            <p key={bullet} className="flex items-center gap-2 text-sm font-semibold text-slate-600">
              <CheckCircle2 size={16} className="text-civic-green" />
              {bullet}
            </p>
          ))}
        </div>
      </form>
      </section>
    </main>
  );
}
