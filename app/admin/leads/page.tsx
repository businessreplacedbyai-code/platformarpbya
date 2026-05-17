import { AdminShell } from "@/components/admin/AdminShell";
import { prisma } from "@/lib/db";
import { LeadsTable } from "./LeadsTable";

export const dynamic = "force-dynamic";

export default async function LeadsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; sector?: string; minScore?: string }>;
}) {
  const sp = await searchParams;
  const where: Record<string, unknown> = {};
  if (sp.status && sp.status !== "all") where.status = sp.status;
  if (sp.sector) where.sector = sp.sector;
  if (sp.minScore) {
    const n = Number(sp.minScore);
    if (!Number.isNaN(n)) where.score = { gte: n };
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
            {leads.length} {leads.length === 1 ? "rezultat" : "rezultate"} · sortate după scor
          </p>
        </div>
      </header>

      <LeadsTable
        leads={leads}
        currentStatus={sp.status}
        currentSector={sp.sector}
        currentMinScore={sp.minScore ? Number(sp.minScore) : undefined}
      />
    </AdminShell>
  );
}
