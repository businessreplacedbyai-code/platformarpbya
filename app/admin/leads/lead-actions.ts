"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { audit } from "@/lib/audit";
import { z } from "zod";

const idsSchema = z.array(z.string().cuid()).min(1).max(500);

export async function bulkUpdateLeadStatus(ids: string[], status: string) {
  const parsed = idsSchema.safeParse(ids);
  if (!parsed.success) return { error: "ID-uri invalide" };
  if (!["new", "contacted", "qualified", "won", "lost"].includes(status))
    return { error: "Status invalid" };

  const result = await prisma.lead.updateMany({
    where: { id: { in: parsed.data } },
    data: { status },
  });
  await audit({
    action: "lead.bulk_status",
    targetType: "lead",
    metadata: { count: result.count, status, ids: parsed.data },
  });
  revalidatePath("/admin/leads");
  return { success: true, count: result.count };
}

export async function bulkDeleteLeads(ids: string[]) {
  const parsed = idsSchema.safeParse(ids);
  if (!parsed.success) return { error: "ID-uri invalide" };

  const result = await prisma.lead.deleteMany({
    where: { id: { in: parsed.data } },
  });
  await audit({
    action: "lead.bulk_delete",
    targetType: "lead",
    metadata: { count: result.count, ids: parsed.data },
  });
  revalidatePath("/admin/leads");
  return { success: true, count: result.count };
}

export async function exportLeadsCSV(filters: {
  status?: string;
  sector?: string;
  minScore?: number;
}) {
  const where: Record<string, unknown> = {};
  if (filters.status && filters.status !== "all") where.status = filters.status;
  if (filters.sector) where.sector = filters.sector;
  if (typeof filters.minScore === "number") where.score = { gte: filters.minScore };

  const rows = await prisma.lead.findMany({
    where,
    orderBy: { createdAt: "desc" },
  });

  await audit({
    action: "lead.export_csv",
    targetType: "lead",
    metadata: { count: rows.length, filters },
  });

  // CSV
  const header = [
    "id",
    "createdAt",
    "name",
    "business",
    "phone",
    "email",
    "status",
    "score",
    "sector",
    "employees",
    "monthlyBudget",
    "urgency",
    "cui",
    "cuiValid",
    "city",
    "website",
    "source",
    "utmSource",
    "utmMedium",
    "utmCampaign",
    "message",
  ];
  const escape = (v: unknown) => {
    if (v === null || v === undefined) return "";
    const s = String(v).replace(/"/g, '""');
    return /[",\n]/.test(s) ? `"${s}"` : s;
  };
  const lines = [header.join(",")];
  for (const r of rows) {
    lines.push(
      header
        .map((h) => {
          const val = (r as unknown as Record<string, unknown>)[h];
          if (val instanceof Date) return escape(val.toISOString());
          return escape(val);
        })
        .join(",")
    );
  }
  return lines.join("\n");
}
