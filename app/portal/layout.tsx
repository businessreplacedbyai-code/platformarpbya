import { getClientSession } from "@/lib/auth";
import { logoutClient } from "@/app/(auth)/login/actions";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { ClientNav } from "@/components/portal/ClientNav";

export default async function PortalLayout({ children }: { children: React.ReactNode }) {
  const session = await getClientSession();
  if (!session) redirect("/login?type=client");
  const client = await prisma.client.findUnique({
    where: { slug: session.clientSlug! },
    select: { businessName: true, contactName: true, slug: true },
  });
  if (!client) redirect("/login?type=client");

  return (
    <div className="min-h-screen bg-[var(--bg)]">
      <ClientNav
        businessName={client.businessName}
        contactName={client.contactName}
        logout={logoutClient}
      />
      <main className="max-w-6xl mx-auto px-6 py-10">{children}</main>
    </div>
  );
}
