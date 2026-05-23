import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { authClient } from "@/lib/api-auth";

export const runtime = "nodejs";

// GET /api/v1/agents — listă agenți ai clientului (pentru n8n / Zapier).
export async function GET(req: Request) {
  const auth = await authClient(req);
  if (auth instanceof NextResponse) return auth;

  const agents = await prisma.clientAgent.findMany({
    where: { clientId: auth.id },
    select: {
      id: true,
      agentSlug: true,
      status: true,
      configNotes: true,
      goLiveAt: true,
      updatedAt: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(
    { client: auth.slug, count: agents.length, agents },
    { headers: { "Cache-Control": "no-store" } }
  );
}
