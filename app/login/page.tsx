"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { Lock, Mail, ShieldCheck, User } from "lucide-react";
import { useAuth } from "@/components/AuthProvider";
import { useToast } from "@/components/ToastProvider";
import { firebaseEnabled } from "@/lib/firebase/config";

export default function LoginPage() {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [name, setName] = useState("");
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
      if (mode === "signup") await signup(name, email, password);
      else await login(email, password);
      toast("Welcome to Community Hero AI", "success");
      router.push("/dashboard");
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
    <main className="shell grid min-h-[calc(100vh-64px)] place-items-center py-10">
      <form onSubmit={submit} className="premium-card w-full max-w-md rounded-lg p-6">
        <div className="grid h-14 w-14 place-items-center rounded-lg bg-civic-green/10 text-civic-green">
          <ShieldCheck size={28} />
        </div>
        <h1 className="mt-4 text-3xl font-black text-civic-navy">{mode === "login" ? "Login" : "Create account"}</h1>
        <p className="mt-2 text-slate-600">Use email/password to access citizen and admin workflows. Demo login works locally until Firebase is configured.</p>
        {!firebaseEnabled && (
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <button type="button" onClick={() => demoLogin("citizen@example.com")} className="action-secondary px-4 py-3 text-sm">
              Citizen demo
            </button>
            <button type="button" onClick={() => demoLogin("admin@example.com")} className="action-secondary px-4 py-3 text-sm">
              Admin demo
            </button>
          </div>
        )}
        <div className="mt-6 space-y-4">
          {mode === "signup" && (
            <label className="block">
              <span className="text-sm font-bold text-slate-600">Name</span>
              <div className="mt-2 flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 transition focus-within:border-civic-blue focus-within:ring-4 focus-within:ring-civic-blue/10">
                <User size={18} />
                <input value={name} onChange={(event) => setName(event.target.value)} required className="w-full py-3 outline-none" />
              </div>
            </label>
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
          {loading ? "Please wait..." : mode === "login" ? "Login" : "Sign up"}
        </button>
        <button
          type="button"
          onClick={() => setMode(mode === "login" ? "signup" : "login")}
          className="mt-4 w-full text-sm font-black text-civic-blue"
        >
          {mode === "login" ? "Need an account? Sign up" : "Already registered? Login"}
        </button>
      </form>
    </main>
  );
}
