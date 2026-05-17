import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { sendEmail } from "@/lib/mail";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  // Securitate: Vercel Cron trimite header `Authorization: Bearer <CRON_SECRET>`
  const auth = req.headers.get("authorization");
  const expected = `Bearer ${process.env.CRON_SECRET ?? ""}`;
  if (!process.env.CRON_SECRET || auth !== expected) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const since = new Date(Date.now() - 24 * 60 * 60 * 1000);

  const [leads24h, hotLeads, newClients24h, totalLeads, totalClients] = await Promise.all([
    prisma.lead.count({ where: { createdAt: { gte: since } } }),
    prisma.lead.findMany({
      where: { createdAt: { gte: since }, score: { gte: 65 } },
      orderBy: { score: "desc" },
      take: 10,
    }),
    prisma.client.count({ where: { createdAt: { gte: since } } }),
    prisma.lead.count(),
    prisma.client.count(),
  ]);

  const adminEmail = process.env.ADMIN_NOTIFY_EMAIL;
  if (!adminEmail) {
    return NextResponse.json({ ok: true, skipped: "no_admin_email" });
  }

  const hotList = hotLeads
    .map(
      (l) =>
        `<li><strong>${escape(l.business)}</strong> · ${escape(l.name)} · <a href="tel:${escape(l.phone)}">${escape(l.phone)}</a> · scor ${l.score}</li>`
    )
    .join("");

  const html = `
    <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;max-width:600px;margin:0 auto;padding:24px;color:#1a1a1a">
      <h1 style="font-size:20px;margin:0 0 8px">📊 Digest zilnic ReplacedByAI</h1>
      <p style="color:#666;font-size:13px;margin:0 0 24px">Ultimele 24h · ${new Date().toLocaleDateString("ro-RO")}</p>

      <div style="display:flex;gap:12px;margin-bottom:24px;flex-wrap:wrap">
        <div style="flex:1;min-width:120px;background:#fafaf7;border:1px solid #e5e5e0;border-radius:12px;padding:16px">
          <div style="font-size:11px;text-transform:uppercase;color:#666">Leads noi</div>
          <div style="font-size:28px;font-weight:600">${leads24h}</div>
        </div>
        <div style="flex:1;min-width:120px;background:#fff5f0;border:1px solid #fed7aa;border-radius:12px;padding:16px">
          <div style="font-size:11px;text-transform:uppercase;color:#9a3412">Hot leads</div>
          <div style="font-size:28px;font-weight:600;color:#c2410c">${hotLeads.length}</div>
        </div>
        <div style="flex:1;min-width:120px;background:#f0fdf4;border:1px solid #bbf7d0;border-radius:12px;padding:16px">
          <div style="font-size:11px;text-transform:uppercase;color:#166534">Clienți noi</div>
          <div style="font-size:28px;font-weight:600;color:#15803d">${newClients24h}</div>
        </div>
      </div>

      ${
        hotList
          ? `<h2 style="font-size:15px;margin:0 0 12px">🔥 De sunat astăzi</h2><ul style="padding-left:20px;font-size:14px;line-height:1.8">${hotList}</ul>`
          : `<p style="font-size:14px;color:#666">Niciun hot lead nou în ultimele 24h.</p>`
      }

      <hr style="border:none;border-top:1px solid #e5e5e0;margin:24px 0" />
      <p style="font-size:12px;color:#999">Total: ${totalLeads} leads · ${totalClients} clienți</p>
      <p style="font-size:12px;color:#999"><a href="${process.env.NEXT_PUBLIC_SITE_URL ?? ""}/admin">Deschide admin →</a></p>
    </div>
  `;

  await sendEmail({
    to: adminEmail,
    subject: `📊 Digest zilnic — ${leads24h} leads, ${hotLeads.length} hot`,
    html,
  });

  return NextResponse.json({ ok: true, leads24h, hot: hotLeads.length, newClients24h });
}

function escape(s: string) {
  return String(s).replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]!)
  );
}
