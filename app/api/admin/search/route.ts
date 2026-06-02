import { NextRequest, NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET(req: NextRequest) {
  const session = await getAdminSession();
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const q = req.nextUrl.searchParams.get("q")?.trim() ?? "";
  if (q.length < 2) return NextResponse.json({ clients: [], leads: [] });

  const [clients, leads] = await Promise.all([
    prisma.client.findMany({
      where: {
        OR: [
          { businessName: { contains: q, mode: "insensitive" } },
          { contactName: { contains: q, mode: "insensitive" } },
          { email: { contains: q, mode: "insensitive" } },
          { phone: { contains: q } },
        ],
      },
      select: { slug: true, businessName: true, contactName: true, status: true },
      take: 5,
    }),
    prisma.lead.findMany({
      where: {
        OR: [
          { business: { contains: q, mode: "insensitive" } },
          { name: { contains: q, mode: "insensitive" } },
          { email: { contains: q, mode: "insensitive" } },
          { phone: { contains: q } },
        ],
      },
      select: { id: true, business: true, name: true, status: true, score: true },
      orderBy: { score: "desc" },
      take: 5,
    }),
  ]);

  return NextResponse.json({ clients, leads });
}
