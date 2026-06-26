import { NextRequest, NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth";
import { prisma } from "@/lib/db";

export const runtime = "nodejs";

// Marchează manual statusul unui lead (ex. "Am trimis" pe WhatsApp/Instagram) sau resetează.
export async function POST(req: NextRequest) {
  const session = await getAdminSession();
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { leadId, status } = await req.json();
  const allowed = ["new", "ready", "sent", "replied", "ignored", "called"];
  if (!leadId || !allowed.includes(status)) {
    return NextResponse.json({ error: "Parametri invalizi" }, { status: 400 });
  }

  const data: { status: string; sentAt?: Date | null; ignoredAt?: Date | null } = { status };
  if (status === "sent" || status === "called") data.sentAt = new Date();
  if (status === "new") { data.sentAt = null; data.ignoredAt = null; }

  await prisma.outreachLead.update({ where: { id: leadId }, data });
  return NextResponse.json({ ok: true });
}
