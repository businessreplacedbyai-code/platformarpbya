"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Inbox,
  Users,
  LogOut,
  PlusCircle,
  Sparkles,
  ShoppingBag,
  BarChart3,
  History,
  CalendarDays,
  Mail,
  Crosshair,
  Receipt,
} from "lucide-react";
import { GlobalSearch } from "./GlobalSearch";

export function AdminNav({
  email,
  logout,
}: {
  email?: string;
  logout: () => Promise<void>;
}) {
  const pathname = usePathname();

  const items = [
    { href: "/admin", icon: LayoutDashboard, label: "Dashboard" },
    { href: "/admin/analytics", icon: BarChart3, label: "Analytics" },
    { href: "/admin/outreach", icon: Crosshair, label: "Outreach" },
    { href: "/admin/leads", icon: Inbox, label: "Leads" },
    { href: "/admin/clients", icon: Users, label: "Clienți" },
    { href: "/admin/facturi", icon: Receipt, label: "Facturare" },
    { href: "/admin/inbox", icon: Mail, label: "Inbox email" },
    { href: "/admin/calendar", icon: CalendarDays, label: "Calendar" },
    { href: "/admin/agents", icon: Sparkles, label: "Catalog agenți" },
    { href: "/admin/requests", icon: ShoppingBag, label: "Cereri agenți" },
    { href: "/admin/audit", icon: History, label: "Audit log" },
    { href: "/admin/clients/new", icon: PlusCircle, label: "Client nou" },
  ];

  return (
    <aside className="w-64 shrink-0 border-r border-[var(--border)] bg-[var(--bg-2)] flex flex-col">
      <div className="px-5 py-5 border-b border-[var(--border)]">
        <Link href="/admin" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-[var(--ink)] text-[var(--bg-2)] flex items-center justify-center font-bold text-sm">
            R
          </div>
          <div>
            <div className="text-[14px] font-medium leading-tight">ReplacedByAI</div>
            <div className="text-[11px] text-[var(--ink-3)] leading-tight">Admin panel</div>
          </div>
        </Link>
      </div>

      <div className="px-3 py-3 border-b border-[var(--border)]">
        <GlobalSearch />
      </div>

      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {items.map((it) => {
          const active =
            it.href === "/admin"
              ? pathname === "/admin"
              : pathname.startsWith(it.href);
          return (
            <Link
              key={it.href}
              href={it.href}
              className={`flex items-center gap-2.5 px-3 py-2 text-[13.5px] rounded-lg transition-colors ${
                active
                  ? "bg-[var(--ink)] text-[var(--bg-2)]"
                  : "text-[var(--ink-1)] hover:bg-[var(--bg-3)]"
              }`}
            >
              <it.icon size={15} />
              {it.label}
            </Link>
          );
        })}
      </nav>

      <div className="px-3 py-3 border-t border-[var(--border)]">
        <div className="px-3 py-2 text-[12px] text-[var(--ink-3)] truncate">{email}</div>
        <form action={logout}>
          <button
            type="submit"
            className="w-full flex items-center gap-2 px-3 py-2 text-[13px] text-[var(--ink-2)] hover:text-[var(--ink)] hover:bg-[var(--bg-3)] rounded-lg transition-colors"
          >
            <LogOut size={14} />
            Logout
          </button>
        </form>
      </div>
    </aside>
  );
}
