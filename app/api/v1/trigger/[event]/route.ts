import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { authClient } from "@/lib/api-auth";
import { signWebhookPayload } from "@/lib/client-api";

export const runtime = "nodejs";

// POST /api/v1/trigger/[event]
// n8n / Zapier / Make pot apela aici ca să declanșeze evenimente în contul clientului.
// Eventul e propagat către webhook-urile configurate de client (outbound),
// astfel poți face full bi-direcțional cu n8n.
export async function POST(
  req: Request,
  ctx: { params: Promise<{ event: string }> }
) {
  const auth = await authClient(req);
  if (auth instanceof NextResponse) return auth;
  const { event } = await ctx.params;

  let body: unknown = {};
  try {
    body = await req.json();
  } catch {
    body = {};
  }

  // Log acțiunea (folosim AuditLog generic).
  await prisma.auditLog.create({
    data: {
      actorEmail: auth.email,
      action: `trigger.${event}`,
      targetType: "client",
      targetId: auth.id,
      metadata: JSON.stringify(body).slice(0, 4000),
    },
  });

  // Forward către webhook-urile active ale clientului pentru același eveniment.
  const hooks = await prisma.clientWebhook.findMany({
    where: { clientId: auth.id, event, active: true },
  });

  const payload = {
    event,
    client: auth.slug,
    timestamp: new Date().toISOString(),
    data: body,
  };
  const payloadStr = JSON.stringify(payload);

  // Best-effort delivery, paralel.
  await Promise.allSettled(
    hooks.map(async (h) => {
      const signature = h.secret
        ? signWebhookPayload(h.secret, payloadStr)
        : "";
      const r = await fetch(h.url, {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "X-ReplacedByAI-Event": event,
          "X-ReplacedByAI-Signature": signature,
        },
        body: payloadStr,
      });
      await prisma.clientWebhook.update({
        where: { id: h.id },
        data: { lastDeliveredAt: new Date(), lastStatus: r.status },
      });
    })
  );

  return NextResponse.json({
    ok: true,
    event,
    delivered: hooks.length,
  });
}
