import { LucideIcon } from "lucide-react";

export function StatCard({ label, value, icon: Icon, accent }: { label: string; value: string | number; icon: LucideIcon; accent: string }) {
  return (
    <div className="premium-card group relative overflow-hidden rounded-lg p-5 transition duration-200 hover:-translate-y-0.5 hover:shadow-lift">
      <div className="absolute inset-x-0 top-0 h-1 opacity-80" style={{ background: accent }} />
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.14em] text-slate-500">{label}</p>
          <p className="mt-2 font-mono text-3xl font-black tracking-[-0.04em] text-civic-navy">{value}</p>
        </div>
        <div className="grid h-11 w-11 place-items-center rounded-md bg-white/80 ring-1 ring-slate-200 transition group-hover:scale-105" style={{ color: accent }}>
          <Icon size={20} />
        </div>
      </div>
    </div>
  );
}
