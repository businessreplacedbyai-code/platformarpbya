import { AdminShell } from "@/components/admin/AdminShell";
import { prisma } from "@/lib/db";
import Link from "next/link";
import { ChevronRight, PlusCircle, Users2 } from "lucide-react";
import { ClientsToolbar } from "@/components/admin/ClientsToolbar";
import { computeHealthScore } from "@/lib/client-health";

export const dynamic = "force-dynamic";

export default async function ClientsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; q?: string }>;
}) {
  const { status, q } = await searchParams;

  const where: Record<string, unknown> = {};
  if (status) where.status = status;
  if (q && q.trim()) {
    const term = q.trim();
    where.OR = [
      { businessName: { contains: term } },
      { contactName: { contains: term } },
      { email: { contains: term } },
      { phone: { contains: term } },
    ];
  }

  const [clients, grouped] = await Promise.all([
    prisma.client.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        _count: { select: { tasks: true } },
        tasks: { where: { done: true }, select: { id: true } },
        agents: { select: { status: true } },
        intake: {
          select: {
            toneOfVoice: true, workingHours: true, locations: true,
            services: true, mainPhone: true, contactEmail: true,
            calendarSystem: true, crmSystem: true, faqText: true, testerName: true,
          },
        },
      },
    }),
    prisma.client.groupBy({
      by: ["status"],
      _count: { _all: true },
    }),
  ]);

  const counts: Record<string, number> = { all: 0 };
  for (const g of grouped) {
    counts[g.status] = g._count._all;
    counts.all += g._count._all;
  }

  return (
    <AdminShell>
      <header className="mb-8 flex items-end justify-between gap-4">
        <div>
          <p className="eyebrow mb-2">Clienți</p>
          <h1 className="h-display text-3xl">Portofoliu</h1>
        </div>
        <Link
          href="/admin/clients/new"
          className="px-4 py-2.5 rounded-xl bg-[var(--ink)] text-[var(--bg-2)] text-[14px] flex items-center gap-2 hover:-translate-y-0.5 transition-all"
        >
          <PlusCircle size={15} /> Client nou
        </Link>
      </header>

      <ClientsToolbar counts={counts} />

      <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-2)] overflow-hidden">
        {clients.length === 0 ? (
          <div className="text-center text-[14px] text-[var(--ink-3)] py-16 flex flex-col items-center gap-3">
            <Users2 size={32} className="text-[var(--ink-3)] opacity-40" />
            {q || status
              ? "Niciun rezultat pentru filtrele curente."
              : "Niciun client încă. Convertește un lead sau crează unul direct."}
          </div>
        ) : (
          <ul className="divide-y divide-[var(--border)]">
            {clients.map((c) => {
              const done = c.tasks.length;
              const total = c._count.tasks;
              const pct = total > 0 ? Math.round((done / total) * 100) : 0;
              const health = computeHealthScore({
                intakeSubmittedAt: c.intakeSubmittedAt,
                intake: c.intake as Record<string, unknown> | null,
                agents: c.agents,
                tasksDone: done,
                tasksTotal: total,
                lastLoginAt: c.lastLoginAt,
              });
              const healthCls = {
                emerald: "text-emerald-700 bg-emerald-50 border-emerald-200",
                amber: "text-amber-700 bg-amber-50 border-amber-200",
                red: "text-red-700 bg-red-50 border-red-200",
              }[health.color];
              return (
                <li key={c.id}>
                  <Link
                    href={`/admin/clients/${c.slug}`}
                    className="flex items-center gap-4 px-5 py-4 hover:bg-[var(--bg-3)] transition-colors"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[14.5px] font-medium truncate">{c.businessName}</span>
                        <span className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full border ${badge(c.status)}`}>
                          {c.status}
                        </span>
                      </div>
                      <div className="text-[12px] text-[var(--ink-3)] truncate">
                        {c.contactName} · {c.phone} · {c.plan ?? "fără plan"}
                      </div>
                    </div>
                    <div className="w-28 hidden md:block">
                      <div className="text-[11px] text-[var(--ink-3)] mb-1">
                        {done}/{total} taskuri
                      </div>
                      <div className="h-1.5 rounded-full bg-[var(--bg-3)] overflow-hidden">
                        <div className="h-full bg-[var(--ink)]" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                    <div className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[10px] font-medium ${healthCls}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${health.color === "emerald" ? "bg-emerald-500" : health.color === "amber" ? "bg-amber-400" : "bg-red-500"}`} />
                      {health.score}
                    </div>
                    <ChevronRight size={16} className="text-[var(--ink-3)]" />
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </AdminShell>
  );
}

function badge(status: string) {
  switch (status) {
    case "onboarding":
      return "border-amber-200 text-amber-700 bg-amber-50";
    case "live":
      return "border-emerald-200 text-emerald-700 bg-emerald-50";
    case "paused":
      return "border-blue-200 text-blue-700 bg-blue-50";
    case "churned":
      return "border-red-200 text-red-700 bg-red-50";
    default:
      return "border-[var(--border)] text-[var(--ink-3)] bg-[var(--bg-3)]";
  }
}
