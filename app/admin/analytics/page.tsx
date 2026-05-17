import { AdminShell } from "@/components/admin/AdminShell";
import { prisma } from "@/lib/db";
import {
  TrendingUp,
  Users,
  Inbox,
  CheckCircle2,
  Flame,
  Activity,
  Target,
} from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AnalyticsPage() {
  const now = new Date();
  const d30 = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const d7 = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const d1 = new Date(now.getTime() - 24 * 60 * 60 * 1000);

  const [
    leads30,
    leads7,
    leads1,
    won30,
    leadStatuses,
    leadSectors,
    leadSources,
    topScores,
    mrr,
    clientCount,
    onboardingCount,
    liveCount,
    churnedCount,
    paymentSum,
    pendingPayments,
    leadsByDay,
    avgScore,
  ] = await Promise.all([
    prisma.lead.count({ where: { createdAt: { gte: d30 } } }),
    prisma.lead.count({ where: { createdAt: { gte: d7 } } }),
    prisma.lead.count({ where: { createdAt: { gte: d1 } } }),
    prisma.lead.count({ where: { status: "won", createdAt: { gte: d30 } } }),
    prisma.lead.groupBy({ by: ["status"], _count: true }),
    prisma.lead.groupBy({
      by: ["sector"],
      _count: true,
      where: { sector: { not: null } },
    }),
    prisma.lead.groupBy({
      by: ["utmSource"],
      _count: true,
      where: { utmSource: { not: null } },
    }),
    prisma.lead.findMany({
      orderBy: { score: "desc" },
      take: 5,
      where: { status: { in: ["new", "contacted"] } },
    }),
    prisma.client.aggregate({
      _sum: { monthlyFee: true },
      where: { status: "live" },
    }),
    prisma.client.count(),
    prisma.client.count({ where: { status: "onboarding" } }),
    prisma.client.count({ where: { status: "live" } }),
    prisma.client.count({ where: { status: "churned" } }),
    prisma.payment.aggregate({
      _sum: { amount: true },
      where: { status: "paid", paidAt: { gte: d30 } },
    }),
    prisma.payment.count({ where: { status: "pending" } }),
    prisma.$queryRaw<Array<{ d: string; n: number }>>`
      SELECT date(createdAt) as d, COUNT(*) as n
      FROM Lead
      WHERE createdAt >= ${d30}
      GROUP BY date(createdAt)
      ORDER BY d ASC
    `,
    prisma.lead.aggregate({
      _avg: { score: true },
      where: { createdAt: { gte: d30 } },
    }),
  ]);

  const mrrEUR = (mrr._sum.monthlyFee ?? 0) / 100;
  const cashEUR = (paymentSum._sum.amount ?? 0) / 100;
  const conversionRate = leads30 > 0 ? Math.round((won30 / leads30) * 100) : 0;
  const avg = Math.round(avgScore._avg.score ?? 0);

  // Build daily chart data
  const days: { date: string; count: number }[] = [];
  for (let i = 29; i >= 0; i--) {
    const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
    const key = d.toISOString().slice(0, 10);
    const found = leadsByDay.find((row) => row.d === key);
    days.push({
      date: key,
      count: Number(found?.n ?? 0),
    });
  }
  const maxDay = Math.max(1, ...days.map((d) => d.count));

  return (
    <AdminShell>
      <header className="mb-8">
        <p className="eyebrow mb-2">Analytics</p>
        <h1 className="h-display text-3xl">Cum merge afacerea</h1>
        <p className="text-[14px] text-[var(--ink-3)] mt-1">Ultimele 30 de zile.</p>
      </header>

      {/* KPI primary row */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
        <Kpi icon={TrendingUp} label="MRR" value={`${mrrEUR.toLocaleString("ro-RO")}€`} hint="lunar recurent" />
        <Kpi icon={Activity} label="Cash 30d" value={`${cashEUR.toLocaleString("ro-RO")}€`} hint={`${pendingPayments} plăți în așteptare`} />
        <Kpi icon={Inbox} label="Leads 30d" value={leads30} hint={`${leads7} în 7z · ${leads1} azi`} />
        <Kpi icon={Target} label="Rata conversie" value={`${conversionRate}%`} hint={`${won30} câștigate / ${leads30} leads`} />
      </section>

      {/* Daily chart */}
      <section className="rounded-2xl border border-[var(--border)] bg-[var(--bg-2)] p-5 mb-8">
        <h2 className="text-[14px] font-medium mb-4">Leads pe zi (ultimele 30)</h2>
        <div className="flex items-end gap-1 h-32">
          {days.map((d) => (
            <div
              key={d.date}
              className="flex-1 bg-[var(--ink)] hover:bg-[var(--ink-1)] rounded-t-sm transition-all relative group"
              style={{ height: `${(d.count / maxDay) * 100}%`, minHeight: d.count > 0 ? 4 : 1 }}
              title={`${d.date}: ${d.count}`}
            >
              <span className="absolute -top-7 left-1/2 -translate-x-1/2 text-[10px] bg-[var(--ink)] text-[var(--bg-2)] px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                {d.count}
              </span>
            </div>
          ))}
        </div>
        <div className="flex justify-between text-[10px] text-[var(--ink-3)] mt-2">
          <span>{days[0]?.date.slice(5)}</span>
          <span>{days[days.length - 1]?.date.slice(5)}</span>
        </div>
      </section>

      <section className="grid lg:grid-cols-2 gap-6 mb-8">
        <Panel title="Pipeline leads">
          <Distribution
            items={leadStatuses.map((s) => ({
              label: s.status,
              count: s._count,
            }))}
          />
        </Panel>

        <Panel title="Sectoare top">
          <Distribution
            items={leadSectors.map((s) => ({
              label: s.sector ?? "—",
              count: s._count,
            }))}
          />
        </Panel>

        <Panel title="Surse trafic (UTM)">
          {leadSources.length === 0 ? (
            <Empty>Niciun UTM încă.</Empty>
          ) : (
            <Distribution
              items={leadSources.map((s) => ({
                label: s.utmSource ?? "—",
                count: s._count,
              }))}
            />
          )}
        </Panel>

        <Panel title="Hot leads de contactat">
          {topScores.length === 0 ? (
            <Empty>Nu sunt leads cu scor mare în pipeline.</Empty>
          ) : (
            <ul className="divide-y divide-[var(--border)]">
              {topScores.map((l) => (
                <li key={l.id} className="py-2.5 flex items-center justify-between">
                  <div className="min-w-0">
                    <div className="text-[13.5px] font-medium truncate">{l.business}</div>
                    <div className="text-[11.5px] text-[var(--ink-3)] truncate">
                      {l.name} · {l.sector ?? "—"} · {l.urgency ?? "—"}
                    </div>
                  </div>
                  <ScoreBadge score={l.score} />
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </section>

      <section className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <MiniStat icon={Users} label="Clienți total" value={clientCount} />
        <MiniStat icon={CheckCircle2} label="Live" value={liveCount} accent="emerald" />
        <MiniStat icon={Activity} label="Onboarding" value={onboardingCount} accent="amber" />
        <MiniStat icon={Flame} label="Scor mediu" value={avg} suffix="/100" />
      </section>
    </AdminShell>
  );
}

function Kpi({
  icon: Icon,
  label,
  value,
  hint,
}: {
  icon: typeof TrendingUp;
  label: string;
  value: string | number;
  hint: string;
}) {
  return (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-2)] p-5">
      <div className="w-9 h-9 rounded-lg bg-[var(--bg-3)] flex items-center justify-center mb-4">
        <Icon size={16} />
      </div>
      <div className="h-display text-3xl mb-1 tabular-nums">{value}</div>
      <div className="text-[12px] eyebrow">{label}</div>
      <div className="text-[11px] text-[var(--ink-3)] mt-1">{hint}</div>
    </div>
  );
}

function MiniStat({
  icon: Icon,
  label,
  value,
  suffix,
  accent,
}: {
  icon: typeof TrendingUp;
  label: string;
  value: number;
  suffix?: string;
  accent?: "emerald" | "amber";
}) {
  const tone =
    accent === "emerald"
      ? "bg-emerald-50 text-emerald-700"
      : accent === "amber"
      ? "bg-amber-50 text-amber-700"
      : "bg-[var(--bg-3)] text-[var(--ink-1)]";
  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-2)] p-4 flex items-center gap-3">
      <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${tone}`}>
        <Icon size={15} />
      </div>
      <div>
        <div className="text-xl font-medium tabular-nums">
          {value}
          {suffix && <span className="text-sm text-[var(--ink-3)]">{suffix}</span>}
        </div>
        <div className="text-[11px] text-[var(--ink-3)]">{label}</div>
      </div>
    </div>
  );
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-2)]">
      <div className="px-5 py-3 border-b border-[var(--border)]">
        <h2 className="text-[13px] font-medium">{title}</h2>
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}

function Distribution({ items }: { items: { label: string; count: number }[] }) {
  const sorted = [...items].sort((a, b) => b.count - a.count);
  const total = sorted.reduce((s, x) => s + x.count, 0) || 1;
  if (sorted.length === 0) return <Empty>Nimic încă.</Empty>;
  return (
    <ul className="space-y-2.5">
      {sorted.map((it) => {
        const pct = Math.round((it.count / total) * 100);
        return (
          <li key={it.label}>
            <div className="flex items-baseline justify-between text-[13px] mb-1">
              <span className="capitalize">{it.label}</span>
              <span className="text-[12px] text-[var(--ink-3)] tabular-nums">
                {it.count} · {pct}%
              </span>
            </div>
            <div className="h-1.5 bg-[var(--bg-3)] rounded-full overflow-hidden">
              <div className="h-full bg-[var(--ink)]" style={{ width: `${pct}%` }} />
            </div>
          </li>
        );
      })}
    </ul>
  );
}

function ScoreBadge({ score }: { score: number }) {
  const tone =
    score >= 65
      ? "bg-red-50 text-red-700 border-red-200"
      : score >= 35
      ? "bg-amber-50 text-amber-700 border-amber-200"
      : "bg-[var(--bg-3)] text-[var(--ink-3)] border-[var(--border)]";
  return (
    <span className={`text-[11px] px-2 py-0.5 rounded-full border tabular-nums ${tone}`}>
      {score}
    </span>
  );
}

function Empty({ children }: { children: React.ReactNode }) {
  return <p className="text-center text-[12.5px] text-[var(--ink-3)] py-6">{children}</p>;
}
