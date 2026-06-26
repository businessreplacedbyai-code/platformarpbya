// Găsește numele patronului/administratorului din DATE PUBLICE (site-ul lor + pagina
// de Facebook). NU date personale private — doar ce e publicat de firmă.
import { NextRequest, NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth";
import { prisma } from "@/lib/db";

export const runtime = "nodejs";
export const maxDuration = 25;

async function fetchHtml(url: string): Promise<string | null> {
  if (!url) return null;
  const u = url.startsWith("http") ? url : `https://${url}`;
  try {
    const res = await fetch(u, {
      signal: AbortSignal.timeout(7000),
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0 Safari/537.36",
        Accept: "text/html,application/xhtml+xml",
        "Accept-Language": "ro-RO,ro;q=0.9",
      },
    });
    if (!res.ok) return null;
    return await res.text();
  } catch {
    return null;
  }
}

const NAME = "[A-ZȘȚĂÂÎ][a-zșțăâî]{2,}(?:[ -][A-ZȘȚĂÂÎ][a-zșțăâî]{2,}){1,2}";
const BAD = /(Politic|Cookie|Termeni|Condi|Drepturi|Rezervat|Confiden|Acas|Contact|Despre|Servic|Program|Bun[ăa] Ziua|Bucure|Cluj|Timi|Constanț|Rom[âa]nia|Google|Facebook)/i;

function extractOwner(html: string): string | null {
  const og = html.match(/<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']+)["']/i)?.[1] || "";
  const title = html.match(/<title[^>]*>([^<]+)<\/title>/i)?.[1] || "";
  const text = html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ");
  const hay = `${og} ${title} ${text}`.slice(0, 40000);

  const candidates: string[] = [];
  for (const m of hay.matchAll(new RegExp(`Dr\\.?\\s+(${NAME})`, "g"))) candidates.push("Dr. " + m[1]);
  for (const m of hay.matchAll(new RegExp(`(?:fondator|fondatoare|administrator|administratoare|proprietar|proprietara|titular|patron|coordonator|medic primar|medic specialist)[^.]{0,40}?(${NAME})`, "gi"))) candidates.push(m[1]);
  for (const m of hay.matchAll(new RegExp(`(${NAME})[ ,–—-]{1,4}(?:medic|administrator|fondator|proprietar|stomatolog|dentist|titular|coordonator)`, "gi"))) candidates.push(m[1]);

  for (const c of candidates) {
    const clean = c.replace(/\s+/g, " ").trim();
    const core = clean.replace(/^Dr\.?\s+/, "");
    if (BAD.test(core)) continue;
    if (core.split(/[ -]/).length < 2) continue;
    return clean;
  }
  return null;
}

export async function POST(req: NextRequest) {
  const session = await getAdminSession();
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { leadId } = await req.json();
  const lead = await prisma.outreachLead.findUnique({ where: { id: leadId } });
  if (!lead) return NextResponse.json({ error: "Lead negăsit" }, { status: 404 });

  let owner: string | null = null;
  const sources: [string, string | null][] = [
    ["website", lead.website],
    ["facebook", lead.socialUrl],
  ];
  for (const [, url] of sources) {
    if (!url) continue;
    const html = await fetchHtml(url);
    if (!html) continue;
    owner = extractOwner(html);
    if (owner) break;
  }

  if (owner) {
    await prisma.outreachLead.update({ where: { id: leadId }, data: { ownerName: owner } });
  }
  return NextResponse.json({ ok: true, ownerName: owner });
}
