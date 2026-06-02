import { AdminShell } from "@/components/admin/AdminShell";
import { prisma } from "@/lib/db";
import { OutreachClient } from "./OutreachClient";

export const metadata = { title: "Outreach · Admin" };
export const dynamic = "force-dynamic";

export default async function OutreachPage() {
  const leads = await prisma.outreachLead.findMany({
    orderBy: [{ createdAt: "desc" }],
    take: 200,
  });

  const hasApiKey = !!process.env.GOOGLE_PLACES_API_KEY;

  return (
    <AdminShell>
      <OutreachClient
        initialLeads={leads.map((l) => ({
          ...l,
          sentAt: l.sentAt ?? null,
          repliedAt: l.repliedAt ?? null,
          ignoredAt: l.ignoredAt ?? null,
        }))}
        hasApiKey={hasApiKey}
      />
    </AdminShell>
  );
}
