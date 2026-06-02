import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  // Verifică secretul webhook — previne injectarea de emailuri false
  const webhookSecret = process.env.INBOUND_WEBHOOK_SECRET;
  if (webhookSecret) {
    const providedSecret =
      req.headers.get("x-webhook-secret") ??
      req.nextUrl.searchParams.get("secret");
    if (providedSecret !== webhookSecret) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  // Rate limiting pe IP — max 100 emailuri/oră per sursă
  const ip = req.headers.get("cf-connecting-ip") ?? req.headers.get("x-forwarded-for") ?? "unknown";
  const { rateLimit } = await import("@/lib/rate-limit");
  const rl = rateLimit(`inbound:${ip}`, 100, 3600_000);
  if (!rl.ok) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  try {
    const contentType = req.headers.get("content-type") ?? "";
    let payload: Record<string, string> = {};

    if (contentType.includes("application/json")) {
      payload = await req.json();
    } else {
      // multipart/form-data
      const form = await req.formData();
      for (const [key, value] of form.entries()) {
        if (typeof value === "string") payload[key] = value;
      }
    }

    const fromRaw: string = payload.from ?? payload.From ?? "";
    const toRaw: string = payload.to ?? payload.To ?? "";
    const subject: string = payload.subject ?? payload.Subject ?? extractHeader(payload.text ?? "", "Subject") ?? "(fără subiect)";
    const rawText: string = payload.text ?? payload.Text ?? "";
    const bodyText: string = extractBody(rawText);
    const bodyHtml: string = payload.html ?? payload.Html ?? "";
    const inReplyTo: string = payload.inReplyTo ?? payload["In-Reply-To"] ?? "";

    if (!fromRaw) return NextResponse.json({ ok: false, error: "no_from" });

    // Parse "Name <email>" format
    const { email: fromEmail, name: fromName } = parseEmail(fromRaw);
    const { email: toEmail } = parseEmail(toRaw);

    // Normalizare subiect pentru threading (scoate Re:, Fwd:, etc.)
    const normalizedSubject = subject.replace(/^(re|fwd|fw|răspuns):\s*/gi, "").trim();

    // Caută thread existent după subiect + fromEmail
    let thread = await prisma.emailThread.findFirst({
      where: {
        fromEmail,
        subject: { contains: normalizedSubject, mode: "insensitive" },
        status: { not: "archived" },
      },
      orderBy: { lastAt: "desc" },
    });

    // Dacă nu există, creează unul nou
    if (!thread) {
      // Încearcă să lege automat de un lead sau client
      const lead = await prisma.lead.findFirst({
        where: { email: fromEmail },
        select: { id: true },
      });
      const client = await prisma.client.findFirst({
        where: { email: fromEmail },
        select: { slug: true },
      });

      thread = await prisma.emailThread.create({
        data: {
          subject: normalizedSubject || subject,
          fromEmail,
          fromName: fromName || null,
          status: "open",
          leadId: lead?.id ?? null,
          clientSlug: client?.slug ?? null,
          lastAt: new Date(),
        },
      });
    } else {
      // Actualizează lastAt și marchează ca open
      await prisma.emailThread.update({
        where: { id: thread.id },
        data: { lastAt: new Date(), status: "open" },
      });
    }

    await prisma.emailMessage.create({
      data: {
        threadId: thread.id,
        direction: "in",
        fromEmail,
        fromName: fromName || null,
        toEmail,
        subject,
        bodyText: bodyText || null,
        bodyHtml: bodyHtml || null,
      },
    });

    return NextResponse.json({ ok: true, threadId: thread.id });
  } catch (err) {
    console.error("inbound email error:", err);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}

function parseEmail(raw: string): { email: string; name: string | null } {
  const match = raw.match(/^(.+?)\s*<([^>]+)>$/);
  if (match) return { email: match[2].trim().toLowerCase(), name: match[1].trim() || null };
  return { email: raw.trim().toLowerCase(), name: null };
}

// Extrage header specific din email raw
function extractHeader(raw: string, name: string): string | null {
  const regex = new RegExp(`^${name}:\\s*(.+)$`, "mi");
  const m = raw.match(regex);
  return m ? m[1].trim() : null;
}

function extractBody(raw: string): string {
  // Dacă e email multipart MIME, extrage secțiunea text/plain
  const boundaryMatch = raw.match(/boundary="?([^"\r\n;]+)"?/i);
  if (boundaryMatch) {
    const boundary = boundaryMatch[1];
    const sections = raw.split(new RegExp(`--${escapeRegex(boundary)}(?:--)?`));
    for (const section of sections) {
      if (/content-type:\s*text\/plain/i.test(section)) {
        // Sare headerele secțiunii și returnează corpul
        const bodyStart = section.indexOf("\n\n");
        if (bodyStart !== -1) {
          return section.slice(bodyStart).trim();
        }
      }
    }
  }

  // Email simplu (non-multipart): sare headerele principale
  const lines = raw.split(/\r?\n/);
  let inHeaders = true;
  const bodyLines: string[] = [];
  for (const line of lines) {
    if (inHeaders) {
      if (line.trim() === "") inHeaders = false;
    } else {
      bodyLines.push(line);
    }
  }
  const body = bodyLines.join("\n").trim();

  // Dacă tot arată ca headere tehnice, returnează raw ca fallback
  if (body.match(/^(Received:|ARC-|DKIM-|Content-Type:)/m) && body.length > 500) {
    return "(Email primit — conținut tehnic, deschide în Gmail pentru vizualizare completă)";
  }

  return body || raw.trim();
}

function escapeRegex(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
