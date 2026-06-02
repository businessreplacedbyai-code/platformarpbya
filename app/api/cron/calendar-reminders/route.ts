import { NextResponse } from "next/server";
import { sendCalendarReminders } from "@/app/admin/calendar/actions";
import { prisma } from "@/lib/db";
import { sendEmail } from "@/lib/mail";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const auth = req.headers.get("authorization");
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Cron rulează zilnic la 07:00 UTC — trimite digest + remindere pt azi
  const { sent } = await sendCalendarReminders();
  await sendDailyDigest();

  return NextResponse.json({ ok: true, remindersSent: sent });
}

async function sendDailyDigest() {
  const today = new Date();
  const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59);

  const [todayEvents, followUps] = await Promise.all([
    prisma.calendarEvent.findMany({
      where: { startAt: { gte: startOfDay, lte: endOfDay } },
      orderBy: { startAt: "asc" },
    }),
    prisma.lead.findMany({
      where: {
        followUpAt: { gte: startOfDay, lte: endOfDay },
        status: { notIn: ["won", "lost"] },
      },
      select: { business: true, name: true, phone: true, status: true },
    }),
  ]);

  if (todayEvents.length === 0 && followUps.length === 0) return;

  const dateStr = today.toLocaleDateString("ro-RO", {
    weekday: "long", day: "2-digit", month: "long", year: "numeric",
  });

  const TYPE_EMOJI: Record<string, string> = {
    task: "✅", meeting: "🤝", call: "📞",
    "follow-up": "🔁", deadline: "⚠️", "go-live": "🚀",
  };

  const eventsHtml = todayEvents.length > 0
    ? `<h3 style="margin:0 0 12px;font-size:14px;color:#374151;text-transform:uppercase;letter-spacing:.06em;">
         📅 Evenimente azi (${todayEvents.length})
       </h3>
       ${todayEvents.map((e) => {
         const time = e.allDay ? "Toată ziua" : new Date(e.startAt).toLocaleTimeString("ro-RO", { hour: "2-digit", minute: "2-digit" });
         return `<div style="display:flex;gap:12px;align-items:flex-start;padding:10px 0;border-bottom:1px solid #f3f4f6;">
           <span style="font-size:16px;">${TYPE_EMOJI[e.type] ?? "📌"}</span>
           <div>
             <p style="margin:0;font-size:14px;font-weight:500;color:#111;">${e.title}</p>
             <p style="margin:2px 0 0;font-size:12px;color:#9ca3af;">${time}</p>
           </div>
         </div>`;
       }).join("")}`
    : "";

  const followUpsHtml = followUps.length > 0
    ? `<h3 style="margin:${todayEvents.length > 0 ? "24px" : "0"} 0 12px;font-size:14px;color:#374151;text-transform:uppercase;letter-spacing:.06em;">
         🔁 Follow-up-uri azi (${followUps.length})
       </h3>
       ${followUps.map((l) => `
         <div style="padding:10px 0;border-bottom:1px solid #f3f4f6;">
           <p style="margin:0;font-size:14px;font-weight:500;color:#111;">${l.business}</p>
           <p style="margin:2px 0 0;font-size:12px;color:#9ca3af;">${l.name} · ${l.phone}</p>
         </div>`).join("")}`
    : "";

  await sendEmail({
    to: "contact@replacedbyai.ro",
    subject: `☀️ Ziua ta · ${dateStr}`,
    html: `
      <div style="font-family:system-ui,sans-serif;max-width:540px;margin:0 auto;background:#fff;border:1px solid #e5e7eb;border-radius:16px;overflow:hidden;">
        <div style="background:#111;padding:24px 28px;">
          <p style="color:#aaa;margin:0;font-size:12px;text-transform:uppercase;letter-spacing:.08em;">ReplacedByAI · Daily Digest</p>
          <h1 style="color:#fff;margin:8px 0 0;font-size:22px;">☀️ ${dateStr}</h1>
        </div>
        <div style="padding:24px 28px;">
          ${eventsHtml}
          ${followUpsHtml}
        </div>
        <div style="padding:16px 28px;background:#f9fafb;border-top:1px solid #e5e7eb;">
          <a href="https://www.replacedbyai.ro/admin/calendar" style="font-size:13px;color:#111;">Deschide calendarul →</a>
        </div>
      </div>`,
  }).catch(() => {});
}
