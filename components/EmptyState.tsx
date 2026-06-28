import Link from "next/link";
import { LucideIcon } from "lucide-react";

export function EmptyState({
  icon: Icon,
  title,
  text,
  actionHref,
  actionLabel
}: {
  icon: LucideIcon;
  title: string;
  text: string;
  actionHref?: string;
  actionLabel?: string;
}) {
  return (
    <div className="premium-card grid place-items-center rounded-lg p-8 text-center">
      <div className="grid h-14 w-14 place-items-center rounded-lg bg-civic-blue/10 text-civic-blue">
        <Icon size={26} />
      </div>
      <h3 className="mt-4 text-xl font-black text-civic-navy">{title}</h3>
      <p className="mt-2 max-w-md leading-7 text-slate-600">{text}</p>
      {actionHref && actionLabel && (
        <Link href={actionHref} className="action-primary mt-5 px-5 py-3">
          {actionLabel}
        </Link>
      )}
    </div>
  );
}
