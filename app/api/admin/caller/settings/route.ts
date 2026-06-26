import { NextRequest, NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth";
import { prisma } from "@/lib/db";

export const runtime = "nodejs";

// Caller își setează mailul personal unde primește lista zilnică de 50 firme.
export async function POST(req: NextRequest) {
  const s = await getAdminSession();
  if (!s || s.role !== "admin" || !s.sub) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { notifyEmail } = await req.json();
  const email = String(notifyEmail || "").trim().slice(0, 200);
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "Email invalid" }, { status: 400 });
  }
  await prisma.adminUser.update({ where: { id: s.sub }, data: { notifyEmail: email || null } });
  return NextResponse.json({ ok: true });
}
