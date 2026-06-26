// Hartă lead-uri — servește firmele (OutreachLead) cu coordonate, filtrate.
// „Fără website" = website null (social media nu contează ca site real).
import { NextRequest, NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import type { Prisma } from "@prisma/client";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAP_CAP = 2500; // câți pini randăm pe hartă (performanță)

export async function GET(req: NextRequest) {
  const session = await getAdminSession();
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const sp = req.nextUrl.searchParams;
  const noWebsite = sp.get("noWebsite") === "1";
  const city = sp.get("city") || "";
  const category = sp.get("category") || "";
  const minRating = parseFloat(sp.get("minRating") || "0") || 0;
  const q = (sp.get("q") || "").trim();

  const where: Prisma.OutreachLeadWhereInput = {
    lat: { not: null },
    lng: { not: null },
  };
  if (noWebsite) where.website = null;
  if (city) where.city = city;
  if (category) where.category = category;
  if (minRating > 0) where.rating = { gte: minRating };
  if (q) where.businessName = { contains: q, mode: "insensitive" };

  const [total, leads, cityRows, catRows] = await Promise.all([
    prisma.outreachLead.count({ where }),
    prisma.outreachLead.findMany({
      where,
      select: {
        id: true, businessName: true, category: true, city: true, address: true,
        phone: true, website: true, rating: true, reviewCount: true,
        lat: true, lng: true, status: true, ownerName: true,
      },
      orderBy: [{ reviewCount: "desc" }],
      take: MAP_CAP,
    }),
    prisma.outreachLead.findMany({ distinct: ["city"], select: { city: true }, orderBy: { city: "asc" } }),
    prisma.outreachLead.findMany({ distinct: ["category"], select: { category: true }, orderBy: { category: "asc" } }),
  ]);

  return NextResponse.json({
    total,
    capped: total > MAP_CAP,
    shown: leads.length,
    leads,
    cities: cityRows.map((c) => c.city).filter(Boolean),
    categories: catRows.map((c) => c.category).filter(Boolean),
  });
}
