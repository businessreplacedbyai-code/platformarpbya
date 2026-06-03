// Outreach search — supports single OR multi-city/multi-category batch search.
// Body: { category, city } for single, OR { categories: [], cities: [] } for batch.
import { NextRequest, NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth";
import { prisma } from "@/lib/db";

export const runtime = "nodejs";
export const maxDuration = 300; // up to 5 min for batch

const CATEGORY_QUERIES: Record<string, string> = {
  restaurant: "restaurant",
  cafenea: "cafenea coffee shop",
  hotel: "hotel pensiune",
  clinica: "clinică medicală cabinet",
  stomatolog: "cabinet stomatologic dentist",
  salon: "salon frumusețe coafor",
  farmacie: "farmacie",
  contabil: "contabilitate firma contabil",
  avocat: "cabinet avocatura avocat",
  auto: "service auto vulcanizare",
  imobiliare: "agentie imobiliara",
  constructii: "firma constructii",
  transport: "firma transport logistica",
  it: "firma IT software",
  retail: "magazin shop",
};

async function searchGooglePlaces(query: string, city: string, apiKey: string) {
  const textQuery = `${query} ${city} Romania`;

  const res = await fetch("https://places.googleapis.com/v1/places:searchText", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Goog-Api-Key": apiKey,
      "X-Goog-FieldMask":
        "places.id,places.displayName,places.formattedAddress,places.nationalPhoneNumber,places.websiteUri,places.rating,places.userRatingCount,places.primaryType",
    },
    body: JSON.stringify({
      textQuery,
      languageCode: "ro",
      regionCode: "RO",
      maxResultCount: 20,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Places API ${res.status}: ${err}`);
  }

  return res.json();
}

type SearchResult = {
  added: number;
  skipped: number;
  total: number;
  perCombo: { category: string; city: string; added: number; skipped: number }[];
};

// Domenii care NU contează ca site real — Facebook, Instagram, etc.
const SOCIAL_DOMAINS = [
  "facebook.com", "fb.com",
  "instagram.com",
  "tiktok.com",
  "twitter.com", "x.com",
  "youtube.com",
  "linkedin.com",
  "pinterest.com",
  "snapchat.com",
];

function isRealWebsite(url: string): boolean {
  if (!url) return false;
  try {
    const host = new URL(url).hostname.toLowerCase().replace(/^www\./, "");
    return !SOCIAL_DOMAINS.some((d) => host === d || host.endsWith("." + d));
  } catch {
    return false;
  }
}

async function searchOne(
  category: string,
  city: string,
  apiKey: string
): Promise<{ added: number; skipped: number; total: number }> {
  const queryTerm = CATEGORY_QUERIES[category] ?? category;
  let data: { places?: Array<Record<string, unknown>> };
  try {
    data = await searchGooglePlaces(queryTerm, city, apiKey);
  } catch (e) {
    throw e;
  }

  const places = data.places ?? [];
  let added = 0;
  let skipped = 0;

  for (const p of places) {
    const placeId = String(p.id ?? "");
    if (!placeId) continue;

    const name = (p.displayName as { text?: string })?.text ?? String(p.displayName ?? "");
    const address = String(p.formattedAddress ?? "");
    const phone = String(p.nationalPhoneNumber ?? "");
    const rawWebsite = String(p.websiteUri ?? "");
    // Facebook/Instagram/TikTok nu contează ca site real
    const website = isRealWebsite(rawWebsite) ? rawWebsite : "";
    const rating = p.rating ? Number(p.rating) : null;
    const reviewCount = p.userRatingCount ? Number(p.userRatingCount) : null;

    try {
      const existing = await prisma.outreachLead.findUnique({ where: { placeId } });
      if (existing) {
        skipped++;
        // Update fields that may have changed
        await prisma.outreachLead.update({
          where: { placeId },
          data: {
            phone: phone || undefined,
            website: website || undefined,
            rating: rating ?? undefined,
            reviewCount: reviewCount ?? undefined,
          },
        });
        continue;
      }
      await prisma.outreachLead.create({
        data: {
          placeId,
          businessName: name,
          category,
          address: address || null,
          city,
          phone: phone || null,
          website: website || null,
          // Dacă URL-ul original era social media, îl salvăm separat
          socialUrl: !isRealWebsite(rawWebsite) && rawWebsite ? rawWebsite : null,
          rating,
          reviewCount,
          status: "new",
        },
      });
      added++;
    } catch {
      skipped++;
    }
  }

  return { added, skipped, total: places.length };
}

export async function POST(req: NextRequest) {
  const session = await getAdminSession();
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "GOOGLE_PLACES_API_KEY nu e setat" },
      { status: 400 }
    );
  }

  const body = await req.json();

  // Multi-mode: array of categories AND/OR array of cities
  const categories: string[] = Array.isArray(body.categories)
    ? body.categories
    : body.category ? [body.category] : [];
  const cities: string[] = Array.isArray(body.cities)
    ? body.cities
    : body.city ? [body.city] : [];

  if (categories.length === 0 || cities.length === 0) {
    return NextResponse.json(
      { error: "Trebuie cel puțin o categorie și un oraș" },
      { status: 400 }
    );
  }

  // Hard limit to prevent excessive API spend
  const combos = categories.flatMap((cat) => cities.map((city) => ({ cat, city })));
  if (combos.length > 30) {
    return NextResponse.json(
      { error: `Maxim 30 combinații per request (acum: ${combos.length})` },
      { status: 400 }
    );
  }

  const result: SearchResult = { added: 0, skipped: 0, total: 0, perCombo: [] };

  for (const { cat, city } of combos) {
    try {
      const r = await searchOne(cat, city, apiKey);
      result.added += r.added;
      result.skipped += r.skipped;
      result.total += r.total;
      result.perCombo.push({ category: cat, city, added: r.added, skipped: r.skipped });
    } catch (e) {
      result.perCombo.push({ category: cat, city, added: 0, skipped: 0 });
    }
  }

  return NextResponse.json(result);
}
