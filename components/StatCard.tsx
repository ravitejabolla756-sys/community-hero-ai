import { LucideIcon } from "lucide-react";

export function StatCard({ label, value, icon: Icon, accent }: { label: string; value: string | number; icon: LucideIcon; accent: string }) {
  return (
    <div className="group rounded-lg border border-slate-200 bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-soft">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-slate-500">{label}</p>
          <p className="mt-2 font-mono text-3xl font-black tracking-[-0.04em] text-civic-navy">{value}</p>
        </div>
        <div className="grid h-10 w-10 place-items-center rounded-md bg-slate-50 ring-1 ring-slate-200 transition group-hover:scale-105" style={{ color: accent }}>
          <Icon size={20} />
        </div>
      </div>
    </div>
  );
}
