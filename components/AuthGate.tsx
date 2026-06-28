"use client";

import { LockKeyhole } from "lucide-react";
import { EmptyState } from "@/components/EmptyState";
import { useAuth } from "@/components/AuthProvider";

export function AuthGate({ children, label = "this area" }: { children: React.ReactNode; label?: string }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <main className="shell py-10 font-bold text-slate-600">Checking access...</main>;
  }

  if (!user) {
    return (
      <main className="shell py-10">
        <EmptyState
          icon={LockKeyhole}
          title="Login required"
          text={`Sign in to view ${label}. Reports are filtered by your municipality, district, ward, or community area.`}
          actionHref="/login"
          actionLabel="Login"
        />
      </main>
    );
  }

  return <>{children}</>;
}
