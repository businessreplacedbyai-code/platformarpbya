import { AdminShell } from "@/components/admin/AdminShell";
import { prisma } from "@/lib/db";
import Link from "next/link";
import { LeadsTable } from "./LeadsTable";
import { KanbanBoard } from "./KanbanBoard";
import { LayoutList, Kanban } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function LeadsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; sector?: string; minScore?: string; view?: string }>;
}) {
  const sp = await searchParams;
  const view = sp.view === "kanban" ? "kanban" : "table";

  const where: Record<string, unknown> = {};
  if (view === "table") {
    if (sp.status && sp.status !== "all") where.status = sp.status;
    if (sp.sector) where.sector = sp.sector;
    if (sp.minScore) {
      const n = Number(sp.minScore);
      if (!Number.isNaN(n)) where.score = { gte: n };
    }
  } else {
    // Kanban arată toate leads-urile active
    where.status = { notIn: ["won", "lost"] };
  }

  const leads = await prisma.lead.findMany({
    where,
    orderBy: [{ score: "desc" }, { createdAt: "desc" }],
    select: {
      id: true,
      name: true,
      business: true,
      phone: true,
      email: true,
      status: true,
      score: true,
      sector: true,
      employees: true,
      urgency: true,
      cui: true,
      cuiValid: true,
      city: true,
      createdAt: true,
    },
  });

  return (
    <AdminShell>
      <header className="mb-6 flex items-end justify-between gap-4">
        <div>
          <p className="eyebrow mb-2">Leads</p>
          <h1 className="h-display text-3xl">Inbox cereri</h1>
          <p className="text-[13px] text-[var(--ink-3)] mt-1">
            {leads.length} {leads.length === 1 ? "rezultat" : "rezultate"}{view === "table" ? " · sortate după scor" : " · activi"}
          </p>
        </div>
        {/* View toggle */}
        <div className="flex items-center gap-1 p-1 rounded-xl border border-[var(--border)] bg-[var(--bg-2)]">
          <Link
            href="/admin/leads?view=table"
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] transition-colors ${view === "table" ? "bg-[var(--ink)] text-[var(--bg-2)]" : "text-[var(--ink-2)] hover:bg-[var(--bg-3)]"}`}
          >
            <LayoutList size={13} /> Tabel
          </Link>
          <Link
            href="/admin/leads?view=kanban"
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] transition-colors ${view === "kanban" ? "bg-[var(--ink)] text-[var(--bg-2)]" : "text-[var(--ink-2)] hover:bg-[var(--bg-3)]"}`}
          >
            <Kanban size={13} /> Kanban
          </Link>
        </div>
      </header>

      {view === "kanban" ? (
        <KanbanBoard
          initialLeads={leads.map((l) => ({
            ...l,
            createdAt: l.createdAt.toISOString(),
          }))}
        />
      ) : (
        <LeadsTable
          leads={leads}
          currentStatus={sp.status}
          currentSector={sp.sector}
          currentMinScore={sp.minScore ? Number(sp.minScore) : undefined}
        />
      )}
    </AdminShell>
  );
}
