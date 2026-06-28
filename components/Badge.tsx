import { clsx } from "clsx";

const severityClass: Record<string, string> = {
  Low: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  Medium: "bg-amber-50 text-amber-800 ring-amber-200",
  High: "bg-orange-50 text-orange-800 ring-orange-200",
  Critical: "bg-red-50 text-red-800 ring-red-200"
};

const statusClass: Record<string, string> = {
  Reported: "bg-slate-100 text-slate-700 ring-slate-200",
  "Community Verified": "bg-blue-50 text-blue-700 ring-blue-200",
  Assigned: "bg-indigo-50 text-indigo-700 ring-indigo-200",
  "In Progress": "bg-purple-50 text-purple-700 ring-purple-200",
  Resolved: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  Rejected: "bg-red-50 text-red-700 ring-red-200"
};

export function Badge({ label, type = "neutral" }: { label: string; type?: "severity" | "status" | "neutral" }) {
  return (
    <span
      className={clsx(
        "inline-flex items-center rounded-md px-2.5 py-1 text-xs font-black ring-1 shadow-sm backdrop-blur",
        type === "severity" && severityClass[label],
        type === "status" && statusClass[label],
        type === "neutral" && "bg-white text-civic-navy ring-slate-200"
      )}
    >
      {label}
    </span>
  );
}
