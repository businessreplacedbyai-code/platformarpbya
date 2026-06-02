import { AdminShell } from "@/components/admin/AdminShell";
import { prisma } from "@/lib/db";
import Link from "next/link";
import {
  ArrowUpRight,
  Inbox,
  CheckCircle2,
  Clock,
  Sparkles,
  ShoppingBag,
  TrendingUp,
  AlertTriangle,
  Settings2,
  CalendarClock,
  PhoneCall,
  UserPlus,
  Mail,
  CalendarDays,
} from "lucide-react";
import { agents as catalogAgents } from "@/lib/agents";
import { updateLeadStatus } from "./admin-actions";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const [
    newLeads,
    totalLeads,
    activeClients,
    onboardingClients,
    liveAgents,
    pendingRequests,
    recentLeads,
    recentClients,
    recentRequests,
  ] = await Promise.all([
    prisma.lead.count({ where: { status: "new" } }),
    prisma.lead.count(),
    prisma.client.count({ where: { status: "live" } }),
    prisma.client.count({ where: { status: "onboarding" } }),
    prisma.clientAgent.count({ where: { status: "live" } }),
    prisma.agentPurchaseRequest.count({ where: { status: "pending" } }),
    prisma.lead.findMany({ orderBy: { createdAt: "desc" }, take: 5 }),
    prisma.client.findMany({ orderBy: { createdAt: "desc" }, take: 5 }),
    prisma.agentPurchaseRequest.findMany({
      where: { status: "pending" },
      orderBy: { createdAt: "desc" },
      take: 5,
      include: { client: true },
    }),
  ]);

  // Agenți blocați > 5 zile în configuring sau testing
  const stalledThreshold = new Date(Date.now() - 5 * 24 * 60 * 60 * 1000);
  const stalledAgents = await prisma.clientAgent.findMany({
    where: {
      status: { in: ["configuring", "testing"] },
      updatedAt: { lt: stalledThreshold },
    },
    include: { client: true },
    orderBy: { updatedAt: "asc" },
    take: 10,
  });

  // Emailuri necitite în inbox
  const unreadEmails = await prisma.emailThread.count({ where: { status: "open" } });

  // Evenimentele de azi din calendar
  const todayStart = new Date(); todayStart.setHours(0, 0, 0, 0);
  const todayEnd = new Date(); todayEnd.setHours(23, 59, 59, 999);
  const todayEvents = await prisma.calendarEvent.findMany({
    where: { startAt: { gte: todayStart, lte: todayEnd } },
    orderBy: { startAt: "asc" },
    take: 5,
  });

  // Follow-up-uri din azi + următori 7 zile
  const followUpEnd = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  const upcomingFollowUps = await prisma.lead.findMany({
    where: {
      followUpAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000), lte: followUpEnd },
      status: { notIn: ["won", "lost"] },
    },
    orderBy: { followUpAt: "asc" },
    take: 8,
    select: { id: true, business: true, name: true, followUpAt: true, status: true },
  });

  const totalRevenue = await prisma.client.aggregate({
    _sum: { monthlyFee: true },
    where: { status: "live" },
  });
  const mrrEUR = (totalRevenue._sum.monthlyFee ?? 0) / 100;

  // Revenue trend: clienți live/churned în ultima lună
  const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
  const [newMRRThisMonth, churnedThisMonth, clientsWonThisMonth] = await Promise.all([
    prisma.client.aggregate({
      _sum: { monthlyFee: true },
      where: { goLiveAt: { gte: startOfMonth }, status: "live" },
    }),
    prisma.client.count({ where: { status: "churned", updatedAt: { gte: startOfMonth } } }),
    prisma.client.count({ where: { createdAt: { gte: startOfMonth } } }),
  ]);

  return (
    <AdminShell>
      <header className="mb-10 flex items-end justify-between gap-4">
        <div>
          <p className="eyebrow mb-2">Dashboard</p>
          <h1 className="h-display text-3xl md:text-4xl">Bună dimineața.</h1>
          <p className="text-[15px] text-[var(--ink-2)] mt-2">
            Iată ce s-a întâmplat de când n-ai fost aici.
          </p>
        </div>
      </header>

      {/* KPI grid */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
        <StatCard
          icon={Inbox}
          label="Leads noi"
          value={newLeads}
          hint={`${totalLeads} total`}
          accent="amber"
          href="/admin/leads?status=new"
        />
        <StatCard
          icon={Clock}
          label="În onboarding"
          value={onboardingClients}
          hint="implementări active"
          accent="blue"
          href="/admin/clients?status=onboarding"
        />
        <StatCard
          icon={CheckCircle2}
          label="Clienți live"
          value={activeClients}
          hint={`${liveAgents} agenți activi`}
          accent="emerald"
          href="/admin/clients?status=live"
        />
        <StatCard
          icon={TrendingUp}
          label="MRR"
          value={mrrEUR}
          suffix="€"
          hint="lunar recurent"
          accent="violet"
          href="/admin/clients?status=live"
        />
        <StatCard
          icon={Mail}
          label="Inbox necitit"
          value={unreadEmails}
          hint="emailuri deschise"
          accent="amber"
          href="/admin/inbox"
        />
      </section>

      {/* Azi: calendar + rezumat rapid */}
      {todayEvents.length > 0 && (
        <section className="mb-8 rounded-2xl border border-[var(--border)] bg-[var(--bg-2)] overflow-hidden">
          <div className="flex items-center gap-3 px-5 py-4 border-b border-[var(--border)]">
            <CalendarDays size={15} className="text-[var(--ink-3)]" />
            <h2 className="text-[14px] font-medium">Azi — {todayEvents.length} {todayEvents.length === 1 ? "eveniment" : "evenimente"}</h2>
            <Link href="/admin/calendar" className="ml-auto text-[12px] text-[var(--ink-3)] hover:text-[var(--ink)] flex items-center gap-1">
              Calendar <ArrowUpRight size={12} />
            </Link>
          </div>
          <div className="flex flex-wrap gap-2 p-4">
            {todayEvents.map((ev) => {
              const time = ev.allDay ? "Toată ziua" : new Date(ev.startAt).toLocaleTimeString("ro-RO", { hour: "2-digit", minute: "2-digit" });
              const colorCls: Record<string, string> = {
                blue: "bg-blue-50 border-blue-200 text-blue-800",
                green: "bg-emerald-50 border-emerald-200 text-emerald-800",
                amber: "bg-amber-50 border-amber-200 text-amber-800",
                red: "bg-red-50 border-red-200 text-red-800",
                violet: "bg-violet-50 border-violet-200 text-violet-800",
                slate: "bg-slate-50 border-slate-200 text-slate-700",
              };
              return (
                <Link
                  key={ev.id}
                  href={`/admin/calendar?edit=${ev.id}`}
                  className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-[12.5px] font-medium hover:opacity-80 transition-opacity ${colorCls[ev.color] ?? colorCls.blue}`}
                >
                  <span>{time}</span>
                  <span className="opacity-40">·</span>
                  <span>{ev.title}</span>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {/* Revenue trend luna aceasta */}
      {(clientsWonThisMonth > 0 || churnedThisMonth > 0 || (newMRRThisMonth._sum.monthlyFee ?? 0) > 0) && (
        <section className="grid grid-cols-3 gap-3 mb-8">
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
            <div className="text-[11px] eyebrow text-emerald-700 mb-1">MRR nou luna aceasta</div>
            <div className="h-display text-2xl text-emerald-800 tabular-nums">
              +{((newMRRThisMonth._sum.monthlyFee ?? 0) / 100).toFixed(0)}
              <span className="text-base ml-0.5 opacity-60">€</span>
            </div>
          </div>
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-2)] p-4">
            <div className="text-[11px] eyebrow text-[var(--ink-3)] mb-1">Clienți noi luna aceasta</div>
            <div className="h-display text-2xl tabular-nums flex items-center gap-2">
              {clientsWonThisMonth}
              <UserPlus size={16} className="text-[var(--ink-3)]" />
            </div>
          </div>
          <div className={`rounded-2xl border p-4 ${churnedThisMonth > 0 ? "border-red-200 bg-red-50" : "border-[var(--border)] bg-[var(--bg-2)]"}`}>
            <div className={`text-[11px] eyebrow mb-1 ${churnedThisMonth > 0 ? "text-red-700" : "text-[var(--ink-3)]"}`}>Churn luna aceasta</div>
            <div className={`h-display text-2xl tabular-nums ${churnedThisMonth > 0 ? "text-red-800" : ""}`}>
              {churnedThisMonth}
            </div>
          </div>
        </section>
      )}

      {/* Pending requests banner */}
      {pendingRequests > 0 && (
        <Link
          href="/admin/requests"
          className="block mb-8 rounded-2xl border border-amber-300 bg-gradient-to-r from-amber-50 to-orange-50 p-5 hover:-translate-y-0.5 transition-all"
        >
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
              <ShoppingBag size={18} />
            </div>
            <div className="flex-1">
              <div className="text-[14.5px] font-medium text-amber-900">
                {pendingRequests} {pendingRequests === 1 ? "cerere nouă" : "cereri noi"} de agenți
              </div>
              <div className="text-[12.5px] text-amber-700">
                Clienții au cerut agenți noi din portal. Aprobă sau respinge.
              </div>
            </div>
            <ArrowUpRight size={18} className="text-amber-700" />
          </div>
        </Link>
      )}

      {/* Agenți blocați */}
      {stalledAgents.length > 0 && (
        <section className="mb-8">
          <div className="rounded-2xl border border-red-200 bg-red-50 overflow-hidden">
            <div className="flex items-center gap-3 px-5 py-4 border-b border-red-200">
              <AlertTriangle size={16} className="text-red-600" />
              <h2 className="text-[14px] font-medium text-red-800">
                {stalledAgents.length} {stalledAgents.length === 1 ? "agent blocat" : "agenți blocați"} — fără progres 5+ zile
              </h2>
            </div>
            <div className="p-2">
              {stalledAgents.map((sa) => {
                const agent = catalogAgents.find((a) => a.slug === sa.agentSlug);
                const daysSince = Math.floor((Date.now() - sa.updatedAt.getTime()) / (1000 * 60 * 60 * 24));
                return (
                  <Link
                    key={sa.id}
                    href={`/admin/clients/${sa.client.slug}/agents/${sa.id}`}
                    className="flex items-center gap-3 px-4 py-3 hover:bg-red-100/50 rounded-lg transition-colors"
                  >
                    <div className="w-9 h-9 rounded-lg bg-red-100 flex items-center justify-center text-red-700 shrink-0">
                      {agent?.icon ? <agent.icon size={15} /> : <Sparkles size={15} />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[13.5px] font-medium text-red-900 truncate">
                        {agent?.name ?? sa.agentSlug} · {sa.client.businessName}
                      </div>
                      <div className="text-[12px] text-red-600">
                        {daysSince} zile în „{sa.status}"
                      </div>
                    </div>
                    <Settings2 size={14} className="text-red-500 shrink-0" />
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* Follow-up-uri programate */}
      {upcomingFollowUps.length > 0 && (
        <section className="mb-8">
          <div className="rounded-2xl border border-blue-200 bg-blue-50 overflow-hidden">
            <div className="flex items-center gap-3 px-5 py-4 border-b border-blue-200">
              <CalendarClock size={16} className="text-blue-600" />
              <h2 className="text-[14px] font-medium text-blue-800">
                {upcomingFollowUps.length} follow-up{upcomingFollowUps.length > 1 ? "-uri" : ""} în următoarele 7 zile
              </h2>
            </div>
            <div className="p-2">
              {upcomingFollowUps.map((lead) => {
                const date = new Date(lead.followUpAt!);
                const isToday = date.toDateString() === new Date().toDateString();
                const isTomorrow = date.toDateString() === new Date(Date.now() + 86400000).toDateString();
                const label = isToday ? "Azi" : isTomorrow ? "Mâine" : date.toLocaleDateString("ro-RO", { day: "2-digit", month: "short" });
                return (
                  <Link
                    key={lead.id}
                    href={`/admin/leads/${lead.id}`}
                    className="flex items-center gap-3 px-4 py-3 hover:bg-blue-100/50 rounded-lg transition-colors"
                  >
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center text-[11px] font-medium shrink-0 ${isToday ? "bg-blue-600 text-white" : "bg-blue-100 text-blue-700"}`}>
                      {label}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[13.5px] font-medium text-blue-900 truncate">{lead.business}</div>
                      <div className="text-[12px] text-blue-600">{lead.name}</div>
                    </div>
                    <span className={`text-[10px] uppercase tracking-wider px-2 py-1 rounded-full border ${statusBadge(lead.status)}`}>
                      {lead.status}
                    </span>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      )}

      <section className="grid lg:grid-cols-2 gap-6">
        <Panel title="Ultimele leads" href="/admin/leads" empty={recentLeads.length === 0}>
          {recentLeads.map((l) => (
            <div key={l.id} className="flex items-center gap-2 px-4 py-2.5 hover:bg-[var(--bg-3)] rounded-lg transition-colors group">
              <Link href={`/admin/leads/${l.id}`} className="flex-1 min-w-0">
                <div className="text-[13.5px] font-medium truncate">{l.business}</div>
                <div className="text-[11.5px] text-[var(--ink-3)] truncate">
                  {l.name} · {l.phone}
                </div>
              </Link>
              <span className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full border shrink-0 ${statusBadge(l.status)}`}>
                {l.status}
              </span>
              {l.status === "new" && (
                <form action={async () => {
                  "use server";
                  await updateLeadStatus(l.id, "contacted");
                }}>
                  <button
                    type="submit"
                    title="Marchează ca Contacted"
                    className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-lg bg-blue-50 border border-blue-200 text-blue-700 hover:bg-blue-100"
                  >
                    <PhoneCall size={11} />
                  </button>
                </form>
              )}
            </div>
          ))}
        </Panel>

        <Panel title="Clienți recenți" href="/admin/clients" empty={recentClients.length === 0}>
          {recentClients.map((c) => (
            <Link
              key={c.id}
              href={`/admin/clients/${c.slug}`}
              className="flex items-center justify-between gap-3 px-4 py-3 hover:bg-[var(--bg-3)] rounded-lg transition-colors"
            >
              <div className="min-w-0">
                <div className="text-[14px] font-medium truncate">{c.businessName}</div>
                <div className="text-[12px] text-[var(--ink-3)] truncate">{c.contactName}</div>
              </div>
              <span className={`text-[10px] uppercase tracking-wider px-2 py-1 rounded-full border ${statusBadge(c.status)}`}>
                {c.status}
              </span>
            </Link>
          ))}
        </Panel>

        {recentRequests.length > 0 && (
          <Panel title="Cereri agenți" href="/admin/requests" empty={false}>
            {recentRequests.map((r) => {
              const agent = catalogAgents.find((a) => a.slug === r.agentSlug);
              return (
                <Link
                  key={r.id}
                  href={`/admin/requests`}
                  className="flex items-center gap-3 px-4 py-3 hover:bg-[var(--bg-3)] rounded-lg transition-colors"
                >
                  <div className="w-9 h-9 rounded-lg bg-[var(--bg-3)] flex items-center justify-center text-[var(--ink-1)] shrink-0">
                    {agent?.icon ? <agent.icon size={15} /> : <Sparkles size={15} />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-[13.5px] font-medium truncate">
                      {agent?.name ?? r.agentSlug}
                    </div>
                    <div className="text-[12px] text-[var(--ink-3)] truncate">
                      {r.client.businessName}
                    </div>
                  </div>
                  <span className="text-[10px] uppercase tracking-wider px-2 py-1 rounded-full border border-amber-200 text-amber-700 bg-amber-50">
                    {r.status}
                  </span>
                </Link>
              );
            })}
          </Panel>
        )}
      </section>
    </AdminShell>
  );
}

function statusBadge(status: string) {
  switch (status) {
    case "new":
    case "onboarding":
      return "border-amber-200 text-amber-700 bg-amber-50";
    case "qualified":
    case "live":
    case "won":
      return "border-emerald-200 text-emerald-700 bg-emerald-50";
    case "lost":
    case "churned":
      return "border-red-200 text-red-700 bg-red-50";
    case "contacted":
      return "border-blue-200 text-blue-700 bg-blue-50";
    default:
      return "border-[var(--border)] text-[var(--ink-3)] bg-[var(--bg-3)]";
  }
}

function StatCard({
  icon: Icon,
  label,
  value,
  hint,
  href,
  accent,
  suffix,
}: {
  icon: typeof Inbox;
  label: string;
  value: number;
  hint: string;
  href: string;
  accent: "amber" | "blue" | "emerald" | "violet";
  suffix?: string;
}) {
  const accents = {
    amber: "bg-amber-50 text-amber-700",
    blue: "bg-blue-50 text-blue-700",
    emerald: "bg-emerald-50 text-emerald-700",
    violet: "bg-violet-50 text-violet-700",
  };
  return (
    <Link
      href={href}
      className="group block rounded-2xl border border-[var(--border)] bg-[var(--bg-2)] p-5 hover:-translate-y-0.5 hover:shadow-[0_20px_40px_-20px_rgba(0,0,0,0.1)] transition-all"
    >
      <div className="flex items-center justify-between mb-4">
        <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${accents[accent]}`}>
          <Icon size={16} />
        </div>
        <ArrowUpRight size={14} className="text-[var(--ink-3)] group-hover:text-[var(--ink)] transition-colors" />
      </div>
      <div className="h-display text-3xl mb-1 tabular-nums">
        {value}
        {suffix && <span className="text-xl ml-0.5 text-[var(--ink-3)]">{suffix}</span>}
      </div>
      <div className="text-[12px] eyebrow">{label}</div>
      {hint && <div className="text-[11px] text-[var(--ink-3)] mt-1">{hint}</div>}
    </Link>
  );
}

function Panel({
  title,
  href,
  children,
  empty,
}: {
  title: string;
  href: string;
  children: React.ReactNode;
  empty?: boolean;
}) {
  return (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-2)] overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--border)]">
        <h2 className="text-[14px] font-medium">{title}</h2>
        <Link
          href={href}
          className="text-[12px] text-[var(--ink-3)] hover:text-[var(--ink)] flex items-center gap-1 transition-colors"
        >
          Vezi toate <ArrowUpRight size={12} />
        </Link>
      </div>
      <div className="p-2">
        {empty ? (
          <div className="text-center text-[13px] text-[var(--ink-3)] py-10">Nimic încă.</div>
        ) : (
          children
        )}
      </div>
    </div>
  );
}
