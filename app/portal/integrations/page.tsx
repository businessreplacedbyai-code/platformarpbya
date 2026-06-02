import { redirect } from "next/navigation";
import { getClientSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { IntegrationsClient } from "./IntegrationsClient";

export const metadata = { title: "Integrări · Portal" };
export const dynamic = "force-dynamic";

export default async function IntegrationsPage() {
  const session = await getClientSession();
  if (!session?.sub) redirect("/login?next=/portal/integrations");

  const [apiKeys, webhooks] = await Promise.all([
    prisma.clientApiKey.findMany({
      where: { clientId: session.sub, revokedAt: null },
      select: { id: true, name: true, prefix: true, lastUsedAt: true, createdAt: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.clientWebhook.findMany({
      where: { clientId: session.sub },
      select: {
        id: true,
        event: true,
        url: true,
        active: true,
        lastDeliveredAt: true,
        lastStatus: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  return <IntegrationsClient apiKeys={apiKeys} webhooks={webhooks} />;
}
