"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Bot, ListChecks, LogOut, CreditCard, UserCircle, Plus } from "lucide-react";

const nav = [
  { href: "/portal", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/portal/agents", label: "Agenții mei", icon: Bot },
  { href: "/portal/implementation", label: "Implementare", icon: ListChecks },
  { href: "/portal/extra", label: "Extra & contact", icon: Plus },
  { href: "/portal/billing", label: "Facturare", icon: CreditCard },
  { href: "/portal/account", label: "Cont", icon: UserCircle },
];

export function ClientNav({
  businessName,
  contactName,
  logout,
}: {
  businessName: string;
  contactName: string;
  logout: () => Promise<void>;
}) {
  const path = usePathname();
  return (
    <header className="border-b border-[var(--border)] bg-[var(--bg-2)] sticky top-0 z-30 backdrop-blur-md bg-[var(--bg-2)]/85">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center gap-3 sm:gap-6">
        <Link href="/portal" className="flex items-center gap-2">
          <span className="w-8 h-8 rounded-lg bg-[var(--ink)] text-[var(--bg-2)] flex items-center justify-center text-[13px] font-bold">
            R
          </span>
          <div className="hidden md:block">
            <div className="text-[13px] font-medium leading-tight">{businessName}</div>
            <div className="text-[10.5px] text-[var(--ink-3)] leading-tight">{contactName}</div>
          </div>
        </Link>

        <nav className="flex items-center gap-1 flex-1 overflow-x-auto">
          {nav.map((n) => {
            const active = n.exact ? path === n.href : path.startsWith(n.href);
            const Icon = n.icon;
            return (
              <Link
                key={n.href}
                href={n.href}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[13px] transition-colors whitespace-nowrap ${
                  active
                    ? "bg-[var(--ink)] text-[var(--bg-2)]"
                    : "text-[var(--ink-2)] hover:text-[var(--ink)] hover:bg-[var(--bg-3)]"
                }`}
              >
                <Icon size={14} />
                <span className="hidden sm:inline">{n.label}</span>
              </Link>
            );
          })}
        </nav>

        <form action={logout}>
          <button
            type="submit"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[13px] text-[var(--ink-3)] hover:text-[var(--ink)] hover:bg-[var(--bg-3)]"
          >
            <LogOut size={13} />
            <span className="hidden sm:inline">Ieșire</span>
          </button>
        </form>
      </div>
    </header>
  );
}
