"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3, Home, LayoutDashboard, LogOut, Map, Megaphone, Shield } from "lucide-react";
import { clsx } from "clsx";
import { useAuth } from "@/components/AuthProvider";

const links = [
  { href: "/", label: "Home", icon: Home },
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/report", label: "Report", icon: Megaphone },
  { href: "/issues", label: "Issues", icon: Shield },
  { href: "/map", label: "Map", icon: Map },
  { href: "/impact", label: "Impact", icon: BarChart3 }
];

export function Navbar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const visibleLinks = links.filter((link) => !(user?.role === "admin" && link.href === "/report"));
  const roleLabel = user ? (user.role === "admin" ? "Authority" : "Citizen") : "";
  const roleTone = user?.role === "admin" ? "text-amber-800 ring-amber-200" : "text-emerald-800 ring-emerald-200";

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/86 shadow-sm backdrop-blur-xl">
      <div className="shell flex h-[4.6rem] items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-3 font-black text-civic-navy">
          <span className="grid h-11 w-11 place-items-center rounded-lg bg-civic-navy text-sm text-white shadow-sm ring-1 ring-civic-navy/10">
            CH
          </span>
          <span className="leading-tight">
            Community Hero
            <span className="block text-xs font-black uppercase tracking-[0.14em] text-civic-green">Civic issue ops</span>
          </span>
        </Link>
        <nav className="hidden items-center gap-1 lg:flex">
          {visibleLinks.map((link) => {
            const Icon = link.icon;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={clsx(
                  "inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-black transition",
                  pathname === link.href ? "bg-civic-navy text-white shadow-sm" : "text-slate-600 hover:bg-white/80 hover:text-civic-navy hover:shadow-sm"
                )}
              >
                <Icon size={16} />
                {link.label}
              </Link>
            );
          })}
        </nav>
        <div className="flex items-center gap-2">
          {user && (
            <div className={`role-chip hidden min-w-[9.5rem] rounded-lg px-3 py-2 ring-1 sm:flex sm:flex-col ${roleTone}`}>
              <span className="text-[10px] font-black uppercase tracking-[0.18em] leading-none">{roleLabel}</span>
              <span className="mt-1 truncate text-[11px] font-semibold opacity-80">{user.municipalityName}</span>
            </div>
          )}
          {user?.role === "admin" && (
            <Link href="/admin" className="hidden rounded-lg bg-amber-100 px-3 py-2 text-sm font-black text-civic-navy ring-1 ring-amber-200 transition hover:bg-amber-200 sm:block">
              Queue
            </Link>
          )}
          {user ? (
            <button onClick={logout} className="action-secondary px-3 py-2 text-sm">
              <LogOut size={17} />
              <span className="hidden sm:inline">Sign out</span>
            </button>
          ) : (
            <Link href="/login" className="action-primary px-4 py-2 text-sm">
              Login
            </Link>
          )}
        </div>
      </div>
      <nav className="shell flex gap-1 overflow-x-auto border-t border-slate-100 py-2 lg:hidden">
        {user && (
          <div className={`role-chip flex min-w-[9rem] shrink-0 flex-col rounded-md px-3 py-2 ring-1 ${roleTone}`}>
            <span className="text-[10px] font-black uppercase tracking-[0.18em] leading-none">{roleLabel}</span>
            <span className="mt-1 truncate text-[11px] font-semibold opacity-80">{user.municipalityName}</span>
          </div>
        )}
        {visibleLinks.map((link) => {
          const Icon = link.icon;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={clsx(
                "flex min-h-10 shrink-0 items-center gap-1.5 rounded-md px-3 py-2 text-xs font-bold transition",
                pathname === link.href ? "bg-civic-navy text-white shadow-sm" : "text-slate-600 hover:bg-slate-100"
              )}
            >
              <Icon size={15} />
              {link.label}
            </Link>
          );
        })}
      </nav>
    </header>
  );
}
