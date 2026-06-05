// Bearer auth helper pentru endpoint-urile publice /api/v1/*.
// Validează cheia clientului și actualizează lastUsedAt.
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { hashApiKey } from "@/lib/client-api";
import { isSubscriptionActive } from "@/lib/subscription";

export type AuthedClient = {
  id: string;
  slug: string;
  businessName: string;
  email: string;
  keyId: string;
};

export async function authClient(req: Request): Promise<AuthedClient | NextResponse> {
  const auth = req.headers.get("authorization") || "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7).trim() : "";
  if (!token) {
    return NextResponse.json({ error: "missing_bearer" }, { status: 401 });
  }
  const key = await prisma.clientApiKey.findUnique({
    where: { hashedKey: hashApiKey(token) },
    include: {
      client: {
        select: {
          id: true, slug: true, businessName: true, email: true, status: true,
          subscriptionStatus: true, currentPeriodEnd: true,
        },
      },
    },
  });
  if (!key || key.revokedAt) {
    return NextResponse.json({ error: "invalid_key" }, { status: 401 });
  }
  if (key.client.status === "churned" || key.client.status === "paused") {
    return NextResponse.json({ error: "account_inactive" }, { status: 403 });
  }
  // ─── GATE ABONAMENT: fără abonament activ → serviciile se opresc ───
  if (!isSubscriptionActive(key.client.subscriptionStatus, key.client.currentPeriodEnd)) {
    return NextResponse.json(
      {
        error: "subscription_inactive",
        message: "Abonamentul nu este activ. Reactivează-l în portal pentru a folosi serviciile.",
        portal: "https://www.replacedbyai.ro/portal/billing",
      },
      { status: 402 } // Payment Required
    );
  }

  // Fire-and-forget lastUsedAt update.
  prisma.clientApiKey
    .update({ where: { id: key.id }, data: { lastUsedAt: new Date() } })
    .catch(() => {});

  return {
    id: key.client.id,
    slug: key.client.slug,
    businessName: key.client.businessName,
    email: key.client.email,
    keyId: key.id,
  };
}
