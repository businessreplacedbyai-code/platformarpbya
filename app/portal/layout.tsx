import { getClientSession } from "@/lib/auth";
import { logoutClient } from "@/app/(auth)/login/actions";
import { redirect } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { ClientNav } from "@/components/portal/ClientNav";
import { isSubscriptionActive, subscriptionMessage } from "@/lib/subscription";

export default async function PortalLayout({ children }: { children: React.ReactNode }) {
  const session = await getClientSession();
  if (!session) redirect("/login?type=client");
  const client = await prisma.client.findUnique({
    where: { slug: session.clientSlug! },
    select: {
      businessName: true, contactName: true, slug: true,
      subscriptionStatus: true, currentPeriodEnd: true,
    },
  });
  if (!client) redirect("/login?type=client");

  const subActive = isSubscriptionActive(client.subscriptionStatus, client.currentPeriodEnd);

  return (
    <div className="min-h-screen bg-[var(--bg)]">
      <ClientNav
        businessName={client.businessName}
        contactName={client.contactName}
        logout={logoutClient}
      />
      {!subActive && (
        <div style={{ background: "#FEF2F2", borderBottom: "1px solid #FECACA" }}>
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-[13px]" style={{ color: "#991B1B" }}>
              <span>⚠️</span>
              <span>{subscriptionMessage(client.subscriptionStatus)}</span>
            </div>
            <Link
              href="/portal/billing"
              className="text-[12.5px] font-medium px-4 py-1.5 rounded-lg whitespace-nowrap"
              style={{ background: "#991B1B", color: "#fff" }}
            >
              Reactivează abonamentul →
            </Link>
          </div>
        </div>
      )}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-10">{children}</main>
    </div>
  );
}
