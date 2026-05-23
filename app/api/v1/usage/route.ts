import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { authClient } from "@/lib/api-auth";

export const runtime = "nodejs";

// GET /api/v1/usage — info abonament + consum.
export async function GET(req: Request) {
  const auth = await authClient(req);
  if (auth instanceof NextResponse) return auth;

  const client = await prisma.client.findUnique({
    where: { id: auth.id },
    select: {
      planKey: true,
      subscriptionStatus: true,
      currentPeriodEnd: true,
      goLiveAt: true,
      _count: { select: { agents: true } },
    },
  });

  return NextResponse.json(
    {
      client: auth.slug,
      plan: client?.planKey ?? null,
      status: client?.subscriptionStatus ?? "inactive",
      currentPeriodEnd: client?.currentPeriodEnd ?? null,
      goLiveAt: client?.goLiveAt ?? null,
      agentsActive: client?._count.agents ?? 0,
    },
    { headers: { "Cache-Control": "no-store" } }
  );
}
