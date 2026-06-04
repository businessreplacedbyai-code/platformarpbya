// Găsire email AGRESIVĂ în masă (forțat) — pentru toate firmele fără email.
// Strategie pe lead: scrape paralel multi-pagină → decodare obfuscări → AI (Claude) fallback.
import { NextRequest, NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth";
import { prisma } from "@/lib/db";

export const runtime = "nodejs";
export const maxDuration = 300;

const EMAIL_RE = /[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}/g;
const SPAM = ["sentry", "pixel", "example", "schema", "wix.com", "wordpress", "jquery",
  "google", "facebook", "instagram", "tiktok", "gstatic", "cloudflare", "w3.org", ".png", ".jpg", ".jpeg", ".gif", ".svg", ".webp", ".js", ".css"];
const GENERIC = ["gmail.com", "yahoo.com", "hotmail.com", "outlook.com", "yahoo.ro"];

function cleanEmail(e: string): boolean {
  const low = e.toLowerCase();
  if (SPAM.some((d) => low.includes(d))) return false;
  if (low.includes("noreply") || low.includes("no-reply")) return false;
  if (!low.includes("@") || !low.includes(".")) return false;
  if (low.length > 60 || low.split("@")[0].length < 2) return false;
  return true;
}

function scoreEmail(email: string, domain: string | null): number {
  const low = email.toLowerCase();
  const local = low.split("@")[0];
  const dom = low.split("@")[1] ?? "";
  let s = 50;
  if (domain && dom.includes(domain)) s += 35;
  if (GENERIC.includes(dom)) s -= 15;
  if (["contact", "office", "info", "rezervari", "comenzi", "secretariat", "receptie", "programari"].some((p) => local.startsWith(p))) s += 18;
  if (local.length < 4) s -= 8;
  return s;
}

function extractDomain(url: string): string | null {
  try {
    return new URL(url.startsWith("http") ? url : `https://${url}`).hostname.replace(/^www\./, "");
  } catch { return null; }
}

// Decodează emailuri obfuscate: "nume [at] domeniu [dot] ro", entități HTML, spații.
function deobfuscate(html: string): string[] {
  const out: string[] = [];
  let text = html
    .replace(/&#64;|&commat;/gi, "@")
    .replace(/&#46;/g, ".")
    .replace(/\s*\[\s*at\s*\]\s*|\s*\(\s*at\s*\)\s*|\s+at\s+/gi, "@")
    .replace(/\s*\[\s*dot\s*\]\s*|\s*\(\s*dot\s*\)\s*|\s+dot\s+/gi, ".")
    .replace(/\s*\[\s*punct\s*\]\s*|\s+punct\s+/gi, ".");
  const m = text.match(EMAIL_RE) ?? [];
  for (const e of m) if (cleanEmail(e)) out.push(e);
  return out;
}

function stripToText(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .slice(0, 7000);
}

async function fetchPage(url: string): Promise<string | null> {
  try {
    const res = await fetch(url, {
      signal: AbortSignal.timeout(6000),
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0 Safari/537.36",
        Accept: "text/html,application/xhtml+xml",
        "Accept-Language": "ro-RO,ro;q=0.9",
      },
    });
    if (!res.ok) return null;
    return await res.text();
  } catch { return null; }
}

// AI fallback — Claude citește textul și extrage emailul de contact.
async function aiExtractEmail(businessName: string, text: string, apiKey: string): Promise<string | null> {
  try {
    const prompt = `Extrage adresa de email de CONTACT a firmei "${businessName}" din textul de mai jos (site-ul lor).
Reguli:
- Răspunde DOAR cu adresa de email, nimic altceva.
- Dacă nu există un email clar, răspunde exact: none
- Preferă email de business (contact@, office@, info@) nu personal.
- Ignoră emailuri de tip noreply, exemple, sau ale altor firme (Google, Facebook).

TEXT:
${text}`;
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "x-api-key": apiKey, "anthropic-version": "2023-06-01", "content-type": "application/json" },
      body: JSON.stringify({ model: "claude-haiku-4-5-20251001", max_tokens: 60, messages: [{ role: "user", content: prompt }] }),
      signal: AbortSignal.timeout(15000),
    });
    if (!res.ok) return null;
    const data = await res.json();
    const out = (data.content?.[0]?.text ?? "").trim().toLowerCase();
    if (!out || out === "none" || !out.includes("@")) return null;
    const m = out.match(EMAIL_RE);
    const e = m?.[0];
    return e && cleanEmail(e) ? e : null;
  } catch { return null; }
}

const CONTACT_PATHS = ["", "/contact", "/contacte", "/contact-us", "/despre", "/despre-noi"];

async function findEmailAggressive(
  lead: { businessName: string; website: string | null },
  anthropicKey: string | undefined
): Promise<{ email: string | null; source: string }> {
  if (!lead.website) return { email: null, source: "" };
  const base = lead.website.startsWith("http") ? lead.website : `https://${lead.website}`;
  const domain = extractDomain(base);

  // 1. Fetch paginile relevante în paralel
  const urls = CONTACT_PATHS.map((p) => {
    try { return p ? new URL(p, base).href : base; } catch { return base; }
  });
  const pages = await Promise.allSettled(urls.map(fetchPage));
  const htmls = pages.map((p) => (p.status === "fulfilled" ? p.value : null)).filter(Boolean) as string[];
  if (htmls.length === 0) {
    // site inaccesibil → pattern guess
    return domain ? { email: `contact@${domain}`, source: "pattern-guess" } : { email: null, source: "" };
  }

  // 2. Regex + mailto + deobfuscare pe tot conținutul
  const combined = htmls.join(" ");
  const mailtoRe = /mailto:([a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,})/gi;
  const candidates = new Set<string>();
  [...combined.matchAll(mailtoRe)].forEach((m) => { if (cleanEmail(m[1])) candidates.add(m[1]); });
  (combined.match(EMAIL_RE) ?? []).forEach((e) => { if (cleanEmail(e)) candidates.add(e); });
  deobfuscate(combined).forEach((e) => candidates.add(e));

  if (candidates.size > 0) {
    const best = [...candidates].sort((a, b) => scoreEmail(b, domain) - scoreEmail(a, domain))[0];
    return { email: best, source: "scrape" };
  }

  // 3. AI fallback — Claude citește textul curat
  if (anthropicKey) {
    const text = stripToText(combined);
    const ai = await aiExtractEmail(lead.businessName, text, anthropicKey);
    if (ai) return { email: ai, source: "ai" };
  }

  // 4. Pattern guess final
  return domain ? { email: `contact@${domain}`, source: "pattern-guess" } : { email: null, source: "" };
}

export async function POST(req: NextRequest) {
  const session = await getAdminSession();
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const leadIds: string[] | undefined = Array.isArray(body.leadIds) ? body.leadIds : undefined;
  const limit = Math.min(Number(body.limit) || 25, 25); // max 25/request (timp)

  // Selectează lead-urile fără email (sau cele cerute), cu website
  const where = leadIds
    ? { id: { in: leadIds } }
    : { email: null, status: { not: "ignored" }, website: { not: null } };
  const leads = await prisma.outreachLead.findMany({
    where,
    take: limit,
    orderBy: { createdAt: "asc" },
  });

  const anthropicKey = process.env.ANTHROPIC_API_KEY;
  const results: { leadId: string; email: string | null; source: string }[] = [];
  let found = 0;

  for (const lead of leads) {
    const r = await findEmailAggressive(lead, anthropicKey);
    if (r.email) {
      await prisma.outreachLead.update({
        where: { id: lead.id },
        data: { email: r.email, emailSource: r.source },
      });
      found++;
    }
    results.push({ leadId: lead.id, email: r.email, source: r.source });
  }

  // Câte mai rămân fără email (ca să știe UI dacă să repete)
  const remaining = await prisma.outreachLead.count({
    where: { email: null, status: { not: "ignored" }, website: { not: null } },
  });

  return NextResponse.json({ processed: leads.length, found, remaining, results });
}
