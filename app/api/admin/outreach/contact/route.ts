import { NextRequest, NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { Resend } from "resend";

export const runtime = "nodejs";

function buildEmailHtml(body: string, businessName: string): string {
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
    <div style="font-size:15px;line-height:1.7;color:#333;">
      ${escaped}
    </div>
    <hr style="margin:32px 0 16px;border:none;border-top:1px solid #e5e5e5;" />
    <p style="font-size:11px;color:#999;margin:0;">
      Acest email a fost trimis de ReplacedByAI · Iași, România<br>
      Dacă nu doriți să primiți alte emailuri, răspundeți cu "Stop".
    </p>
  </div>
</body>
</html>`;
}

export async function POST(req: NextRequest) {
  const session = await getAdminSession();
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const resendKey = process.env.RESEND_API_KEY;
  if (!resendKey) {
    return NextResponse.json({ error: "RESEND_API_KEY lipsește" }, { status: 400 });
  }

  const { leadId } = await req.json();

  const lead = await prisma.outreachLead.findUnique({ where: { id: leadId } });
  if (!lead) return NextResponse.json({ error: "Lead negăsit" }, { status: 404 });
  if (!lead.email) return NextResponse.json({ error: "Nu există email pentru acest lead" }, { status: 400 });
  if (!lead.messageSubject || !lead.messageBody) {
    return NextResponse.json({ error: "Mesajul nu a fost generat încă" }, { status: 400 });
  }
  if (lead.status === "sent") {
    return NextResponse.json({ error: "Email-ul a fost deja trimis" }, { status: 400 });
  }

  const resend = new Resend(resendKey);

  // Folosim domeniu principal dar sender name diferit
  const from =
    process.env.OUTREACH_FROM ||
    `Echipa ReplacedByAI <outreach@replacedbyai.ro>`;

  const { data, error } = await resend.emails.send({
    from,
    to: lead.email,
    replyTo: process.env.OUTREACH_REPLY_TO || "admin@replacedbyai.ro",
    subject: lead.messageSubject,
    html: buildEmailHtml(lead.messageBody, lead.businessName),
    text: lead.messageBody,
  });

  if (error) {
    return NextResponse.json({ error: String(error.message ?? error) }, { status: 500 });
  }

  await prisma.outreachLead.update({
    where: { id: leadId },
    data: { status: "sent", sentAt: new Date() },
  });

  return NextResponse.json({ ok: true, emailId: data?.id });
}
