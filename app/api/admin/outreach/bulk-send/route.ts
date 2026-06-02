// Bulk email send — sends up to 50 emails sequentially with throttle.
// Respects Resend rate limits (2 req/s on free tier). Returns per-lead result.
import { NextRequest, NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { Resend } from "resend";

export const runtime = "nodejs";
export const maxDuration = 300; // 5 min — enough for ~50 emails at 1/3s

const MAX_BATCH = 50;
const DELAY_MS = 2500; // 2.5s between sends — well under Resend rate limit

function buildEmailHtml(body: string): string {
  const escaped = body
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .split("\n")
    .map((line) => (line.trim() ? `<p style="margin:0 0 12px">${line}</p>` : ""))
    .join("");

  return `<!doctype html>
<html>
<body style="margin:0;padding:0;background:#ffffff;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;color:#1a1a1a;">
  <div style="max-width:520px;margin:0 auto;padding:40px 24px;">
    <div style="font-size:15px;line-height:1.7;color:#333;">${escaped}</div>
    <hr style="margin:32px 0 16px;border:none;border-top:1px solid #e5e5e5;" />
    <p style="font-size:11px;color:#999;margin:0;">
      Acest email a fost trimis de ReplacedByAI · Iași, România<br>
      Dacă nu doriți să primiți alte emailuri, răspundeți cu "Stop".
    </p>
  </div>
</body>
</html>`;
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export async function POST(req: NextRequest) {
  const session = await getAdminSession();
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const resendKey = process.env.RESEND_API_KEY;
  if (!resendKey) {
    return NextResponse.json({ error: "RESEND_API_KEY lipsește" }, { status: 400 });
  }

  const { leadIds } = await req.json();
  if (!Array.isArray(leadIds) || leadIds.length === 0) {
    return NextResponse.json({ error: "leadIds gol" }, { status: 400 });
  }
  if (leadIds.length > MAX_BATCH) {
    return NextResponse.json(
      { error: `Maxim ${MAX_BATCH} emailuri per batch` },
      { status: 400 }
    );
  }

  const resend = new Resend(resendKey);
  const from = process.env.OUTREACH_FROM || "Echipa ReplacedByAI <outreach@replacedbyai.ro>";
  const replyTo = process.env.OUTREACH_REPLY_TO || "admin@replacedbyai.ro";

  const results: { leadId: string; ok: boolean; error?: string; emailId?: string }[] = [];

  for (let i = 0; i < leadIds.length; i++) {
    const leadId = leadIds[i];
    const lead = await prisma.outreachLead.findUnique({ where: { id: leadId } });

    if (!lead) {
      results.push({ leadId, ok: false, error: "Lead negăsit" });
      continue;
    }
    if (!lead.email) {
      results.push({ leadId, ok: false, error: "Fără email" });
      continue;
    }
    if (!lead.messageSubject || !lead.messageBody) {
      results.push({ leadId, ok: false, error: "Mesaj negenerat" });
      continue;
    }
    if (lead.status === "sent") {
      results.push({ leadId, ok: false, error: "Deja trimis" });
      continue;
    }

    try {
      const { data, error } = await resend.emails.send({
        from,
        to: lead.email,
        replyTo,
        subject: lead.messageSubject,
        html: buildEmailHtml(lead.messageBody),
        text: lead.messageBody,
      });

      if (error) {
        results.push({ leadId, ok: false, error: String(error.message ?? error) });
      } else {
        await prisma.outreachLead.update({
          where: { id: leadId },
          data: { status: "sent", sentAt: new Date() },
        });
        results.push({ leadId, ok: true, emailId: data?.id });
      }
    } catch (e) {
      results.push({ leadId, ok: false, error: String(e) });
    }

    // Throttle: don't sleep after the last one
    if (i < leadIds.length - 1) await sleep(DELAY_MS);
  }

  const sent = results.filter((r) => r.ok).length;
  const failed = results.filter((r) => !r.ok).length;

  return NextResponse.json({ ok: true, sent, failed, results });
}
