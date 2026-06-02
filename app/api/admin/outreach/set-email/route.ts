import { NextRequest, NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth";
import { prisma } from "@/lib/db";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const session = await getAdminSession();
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { leadId, email } = await req.json();
  if (!leadId || !email?.includes("@")) {
    return NextResponse.json({ error: "Date invalide" }, { status: 400 });
  }

  await prisma.outreachLead.update({
    where: { id: leadId },
    data: { email: email.trim().toLowerCase(), emailSource: "manual" },
  });

  return NextResponse.json({ ok: true });
}
