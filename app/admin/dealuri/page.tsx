import { AdminShell } from "@/components/admin/AdminShell";
import { prisma } from "@/lib/db";
import { DealsClient } from "./DealsClient";

export const metadata = { title: "Dealuri · Admin" };
export const dynamic = "force-dynamic";

export default async function Page() {
  const deals = await prisma.deal.findMany({ orderBy: { createdAt: "desc" }, take: 300 });
  return (
    <AdminShell>
      <DealsClient
        initial={deals.map((d) => ({
          id: d.id,
          businessName: d.businessName,
          contactName: d.contactName,
          phone: d.phone,
          city: d.city,
          packageWanted: d.packageWanted,
          value: d.value,
          notes: d.notes,
          status: d.status,
          callerEmail: d.callerEmail,
          createdAt: d.createdAt.toISOString(),
        }))}
      />
    </AdminShell>
  );
}
