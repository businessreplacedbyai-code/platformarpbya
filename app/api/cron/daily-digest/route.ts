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

  // Email sequences onboarding
  const seqResults = await runOnboardingSequences();

  return NextResponse.json({ ok: true, leads24h, hot: hotLeads.length, newClients24h, sequences: seqResults });
}

async function runOnboardingSequences() {
  const now = new Date();
  const day3ago = new Date(now.getTime() - 3 * 86400000);
  const day7ago = new Date(now.getTime() - 7 * 86400000);
  let sent = 0;

  // Day 3: intake reminder dacă nu e completat
  const needIntakeReminder = await prisma.client.findMany({
    where: {
      createdAt: { lte: day3ago },
      intakeSubmittedAt: null,
      intakeReminderSentAt: null,
      status: { not: "churned" },
    },
    select: { id: true, email: true, contactName: true, slug: true, intakeToken: true },
  });

  for (const c of needIntakeReminder) {
    const intakeUrl = `${process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.replacedbyai.ro"}/intake/${c.intakeToken}`;
    await sendEmail({
      to: c.email,
      subject: "Completează formularul de configurare — ReplacedByAI",
      html: intakeReminderEmail(c.contactName, intakeUrl),
    }).catch(() => {});
    await prisma.client.update({
      where: { id: c.id },
      data: { intakeReminderSentAt: now },
    });
    sent++;
  }

  // Day 7 post go-live: email de feedback
  const needFeedback = await prisma.client.findMany({
    where: {
      goLiveAt: { lte: day7ago, not: null },
      goLiveFeedbackSentAt: null,
      status: "live",
    },
    select: { id: true, email: true, contactName: true, slug: true },
  });

  for (const c of needFeedback) {
    await sendEmail({
      to: c.email,
      subject: "Cum merge agentul tău? — ReplacedByAI",
      html: goLiveFeedbackEmail(c.contactName, c.slug),
    }).catch(() => {});
    await prisma.client.update({
      where: { id: c.id },
      data: { goLiveFeedbackSentAt: now },
    });
    sent++;
  }

  return { sent };
}

function intakeReminderEmail(name: string, intakeUrl: string) {
  return `
    <div style="font-family:system-ui,sans-serif;max-width:520px;margin:0 auto;background:#fff;border:1px solid #e5e7eb;border-radius:16px;overflow:hidden;">
      <div style="background:#111;padding:24px 28px;">
        <p style="color:#aaa;margin:0;font-size:12px;text-transform:uppercase;letter-spacing:.08em;">ReplacedByAI</p>
        <h1 style="color:#fff;margin:8px 0 0;font-size:22px;">Avem nevoie de câteva date</h1>
      </div>
      <div style="padding:24px 28px;">
        <p style="font-size:15px;color:#111;margin:0 0 12px;">Bună ${name},</p>
        <p style="font-size:14px;color:#374151;line-height:1.6;margin:0 0 20px;">
          Pentru a configura agentul tău AI, avem nevoie de câteva informații despre afacerea ta.
          Completarea durează aproximativ <strong>5-10 minute</strong> și ne permite să livrăm exact ce ți se potrivește.
        </p>
        <a href="${intakeUrl}" style="display:inline-block;background:#111;color:#fff;padding:12px 24px;border-radius:12px;font-size:14px;font-weight:500;text-decoration:none;">
          Completează formularul →
        </a>
      </div>
      <div style="padding:16px 28px;background:#f9fafb;border-top:1px solid #e5e7eb;">
        <p style="font-size:12px;color:#9ca3af;margin:0;">Ai întrebări? Răspunde la acest email sau scrie-ne la contact@replacedbyai.ro</p>
      </div>
    </div>`;
}

function goLiveFeedbackEmail(name: string, slug: string) {
  const portalUrl = `${process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.replacedbyai.ro"}/portal`;
  return `
    <div style="font-family:system-ui,sans-serif;max-width:520px;margin:0 auto;background:#fff;border:1px solid #e5e7eb;border-radius:16px;overflow:hidden;">
      <div style="background:#111;padding:24px 28px;">
        <p style="color:#aaa;margin:0;font-size:12px;text-transform:uppercase;letter-spacing:.08em;">ReplacedByAI</p>
        <h1 style="color:#fff;margin:8px 0 0;font-size:22px;">🚀 7 zile live — cum merge?</h1>
      </div>
      <div style="padding:24px 28px;">
        <p style="font-size:15px;color:#111;margin:0 0 12px;">Bună ${name},</p>
        <p style="font-size:14px;color:#374151;line-height:1.6;margin:0 0 20px;">
          Au trecut 7 zile de când agentul tău AI e live. Sperăm că totul merge excelent!
          Dacă ai observații, ceva ce vrei să ajustăm, sau vrei să adaugi un agent nou — suntem la dispoziție.
        </p>
        <a href="${portalUrl}" style="display:inline-block;background:#111;color:#fff;padding:12px 24px;border-radius:12px;font-size:14px;font-weight:500;text-decoration:none;">
          Deschide portalul →
        </a>
      </div>
      <div style="padding:16px 28px;background:#f9fafb;border-top:1px solid #e5e7eb;">
        <p style="font-size:12px;color:#9ca3af;margin:0;">Răspunde la acest email cu orice feedback — le citim pe toate.</p>
      </div>
    </div>`;
}

function escape(s: string) {
  return String(s).replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]!)
  );
}
