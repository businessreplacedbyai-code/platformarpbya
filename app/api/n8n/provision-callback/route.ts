// Callback de la n8n — actualizează statusul unui agent după provisioning.
// n8n POSTează aici (semnat HMAC) când a terminat setup-ul: configuring → testing → live.
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { verifyProvisionSignature } from "@/lib/n8n";

export const runtime = "nodejs";

const VALID_STATUS = ["configuring", "testing", "live", "paused", "planned"];

export async function POST(req: NextRequest) {
  const raw = await req.text();
  const sig = req.headers.get("x-replacedbyai-signature");
  if (!verifyProvisionSignature(raw, sig)) {
    return NextResponse.json({ error: "invalid_signature" }, { status: 401 });
  }

  let body: {
    clientId?: string;
    clientSlug?: string;
    agentSlug?: string;
    status?: string;
    channel?: string;
    error?: string;
  };
  try {
    body = JSON.parse(raw);
  } catch {
    return NextResponse.json({ error: "bad_json" }, { status: 400 });
  }

  const { agentSlug, status, channel } = body;
  if (!agentSlug || !status || !VALID_STATUS.includes(status)) {
    return NextResponse.json({ error: "bad_params" }, { status: 400 });
  }

  // Identifică clientul (prin id sau slug)
  let clientId = body.clientId ?? null;
  if (!clientId && body.clientSlug) {
    const c = await prisma.client.findUnique({ where: { slug: body.clientSlug }, select: { id: true } });
    clientId = c?.id ?? null;
  }
  if (!clientId) return NextResponse.json({ error: "client_not_found" }, { status: 404 });

  const ca = await prisma.clientAgent.findUnique({
    where: { clientId_agentSlug: { clientId, agentSlug } },
  });
  if (!ca) return NextResponse.json({ error: "agent_not_found" }, { status: 404 });

  await prisma.clientAgent.update({
    where: { clientId_agentSlug: { clientId, agentSlug } },
    data: {
      status,
      channel: channel ?? undefined,
      goLiveAt: status === "live" && !ca.goLiveAt ? new Date() : undefined,
      lastError: body.error ?? null,
    },
  });

  return NextResponse.json({ ok: true });
}
