import { NextRequest, NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth";
import { prisma } from "@/lib/db";

export const runtime = "nodejs";

// Caller loghează un deal închis.
export async function POST(req: NextRequest) {
  const session = await getAdminSession();
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const b = await req.json();
  const businessName = String(b.businessName || "").trim();
  if (!businessName) return NextResponse.json({ error: "Lipsește numele firmei" }, { status: 400 });

  const deal = await prisma.deal.create({
    data: {
      businessName: businessName.slice(0, 300),
      contactName: b.contactName ? String(b.contactName).slice(0, 200) : null,
      phone: b.phone ? String(b.phone).slice(0, 50) : null,
      city: b.city ? String(b.city).slice(0, 120) : null,
      packageWanted: b.packageWanted ? String(b.packageWanted).slice(0, 4000) : null,
      value: b.value ? Math.max(0, parseInt(String(b.value), 10) || 0) : null,
      notes: b.notes ? String(b.notes).slice(0, 4000) : null,
      leadId: b.leadId ? String(b.leadId) : null,
      callerEmail: session.email,
      status: "nou",
    },
  });
  return NextResponse.json({ ok: true, id: deal.id });
}

// Admin schimbă statusul (livrare). Caller NU are voie.
export async function PATCH(req: NextRequest) {
  const session = await getAdminSession();
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (session.staffRole === "CALLER") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const { id, status } = await req.json();
  const allowed = ["nou", "in_lucru", "livrat"];
  if (!id || !allowed.includes(status)) {
    return NextResponse.json({ error: "Parametri invalizi" }, { status: 400 });
  }
  await prisma.deal.update({ where: { id }, data: { status } });
  return NextResponse.json({ ok: true });
}
