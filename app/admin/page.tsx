import { AdminShell } from "@/components/admin/AdminShell";
import { prisma } from "@/lib/db";
import Link from "next/link";
import {
  ArrowUpRight,
  Inbox,
  Users,
  CheckCircle2,
  Clock,
  Sparkles,
  ShoppingBag,
  TrendingUp,
} from "lucide-react";
import { agents as catalogAgents } from "@/lib/agents";

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

  const totalRevenue = await prisma.client.aggregate({
    _sum: { monthlyFee: true },
    where: { status: "live" },
  });
  const mrrEUR = (totalRevenue._sum.monthlyFee ?? 0) / 100;

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
      </section>

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

      <section className="grid lg:grid-cols-2 gap-6">
        <Panel title="Ultimele leads" href="/admin/leads" empty={recentLeads.length === 0}>
          {recentLeads.map((l) => (
            <Link
              key={l.id}
              href={`/admin/leads/${l.id}`}
              className="flex items-center justify-between gap-3 px-4 py-3 hover:bg-[var(--bg-3)] rounded-lg transition-colors"
            >
              <div className="min-w-0">
                <div className="text-[14px] font-medium truncate">{l.business}</div>
                <div className="text-[12px] text-[var(--ink-3)] truncate">
                  {l.name} · {l.phone}
                </div>
              </div>
              <span className={`text-[10px] uppercase tracking-wider px-2 py-1 rounded-full border ${statusBadge(l.status)}`}>
                {l.status}
              </span>
            </Link>
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
