// Descarcă PDF-ul unei facturi emise (din SmartBill).
import { NextRequest, NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getInvoicePdf } from "@/lib/smartbill";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const session = await getAdminSession();
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const id = req.nextUrl.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "no_id" }, { status: 400 });

  const inv = await prisma.invoice.findUnique({ where: { id } });
  if (!inv?.series || !inv?.number) {
    return NextResponse.json({ error: "invoice_not_issued" }, { status: 404 });
  }

  const r = await getInvoicePdf(inv.series, inv.number);
  if (!r.ok || !r.pdf) {
    return NextResponse.json({ error: r.error ?? "pdf_failed" }, { status: 502 });
  }

  return new NextResponse(r.pdf as unknown as BodyInit, {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="${inv.series}-${inv.number}.pdf"`,
    },
  });
}
