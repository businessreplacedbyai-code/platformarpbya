import { AdminShell } from "@/components/admin/AdminShell";
import { agents } from "@/lib/agents";
import { prisma } from "@/lib/db";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function AgentCatalogPage() {
  // Stats: câți clienți au fiecare agent
  const allClientAgents = await prisma.clientAgent.findMany({
    select: { agentSlug: true, status: true },
  });
  const counts = new Map<string, { total: number; live: number }>();
  for (const ca of allClientAgents) {
    const cur = counts.get(ca.agentSlug) ?? { total: 0, live: 0 };
    cur.total++;
    if (ca.status === "live") cur.live++;
    counts.set(ca.agentSlug, cur);
  }

  return (
    <AdminShell>
      <header className="mb-8">
        <p className="eyebrow mb-2">Catalog</p>
        <h1 className="h-display text-3xl">Agenți disponibili pentru clienți</h1>
        <p className="text-[14.5px] text-[var(--ink-2)] mt-2">
          Cei 15 agenți pe care îi poți instanția pentru orice client. Datele de
          pricing sunt cele afișate pe site.
        </p>
      </header>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {agents.map((a) => {
          const stat = counts.get(a.slug);
          return (
            <div
              key={a.slug}
              className="rounded-2xl border border-[var(--border)] bg-[var(--bg-2)] p-6 hover:shadow-[0_20px_40px_-20px_rgba(0,0,0,0.1)] transition-all"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="w-11 h-11 rounded-xl bg-[var(--bg-3)] flex items-center justify-center text-[var(--ink-1)]">
                  <a.icon size={18} />
                </div>
                {stat && (
                  <div className="text-right">
                    <div className="text-[10px] eyebrow text-[var(--ink-3)]">Activi</div>
                    <div className="text-[14px] font-medium tabular-nums">
                      {stat.live}/{stat.total}
                    </div>
                  </div>
                )}
              </div>
              <div className="mb-3">
                <div className="text-[10px] eyebrow text-[var(--ink-3)] mb-1">{a.role}</div>
                <h3 className="text-[16px] font-medium mb-1">{a.name}</h3>
                <p className="text-[13px] text-[var(--ink-2)] leading-relaxed">
                  {a.short}
                </p>
              </div>
              <div className="flex items-center justify-between pt-3 border-t border-[var(--border)]">
                <div>
                  <div className="text-[10px] eyebrow text-[var(--ink-3)]">Setup</div>
                  <div className="text-[13px] font-medium tabular-nums">{a.setupFrom} €</div>
                </div>
                <div className="text-right">
                  <div className="text-[10px] eyebrow text-[var(--ink-3)]">Lunar</div>
                  <div className="text-[13px] font-medium tabular-nums">{a.monthlyFrom} €</div>
                </div>
                <Link
                  href={`/agenti/${a.slug}`}
                  className="text-[12px] text-[var(--ink-3)] hover:text-[var(--ink)] hover:underline"
                  target="_blank"
                >
                  Vezi pagina
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </AdminShell>
  );
}
