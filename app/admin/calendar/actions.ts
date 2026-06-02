"use server";

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { sendEmail } from "@/lib/mail";

export async function createEvent(formData: FormData) {
  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim() || null;
  const startAt = new Date(String(formData.get("startAt")));
  const endAtRaw = String(formData.get("endAt") ?? "").trim();
  const endAt = endAtRaw ? new Date(endAtRaw) : null;
  const allDay = formData.get("allDay") === "on";
  const type = String(formData.get("type") ?? "task");
  const color = String(formData.get("color") ?? "blue");
  const clientSlug = String(formData.get("clientSlug") ?? "").trim() || null;
  const leadId = String(formData.get("leadId") ?? "").trim() || null;
  const notifyEmail = formData.get("notifyEmail") !== "off";

  if (!title || isNaN(startAt.getTime())) return;

  const event = await prisma.calendarEvent.create({
    data: { title, description, startAt, endAt, allDay, type, color, clientSlug, leadId, notifyEmail },
  });

  // Email de confirmare imediat
  if (notifyEmail) {
    sendEmail({
      to: "contact@replacedbyai.ro",
      subject: `📅 Eveniment nou: ${title}`,
      html: eventCreatedEmail(event.title, event.startAt, event.type, event.description),
    }).catch(() => {});
  }

  revalidatePath("/admin/calendar");
  redirect("/admin/calendar");
}

export async function updateEvent(id: string, formData: FormData) {
  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim() || null;
  const startAt = new Date(String(formData.get("startAt")));
  const endAtRaw = String(formData.get("endAt") ?? "").trim();
  const endAt = endAtRaw ? new Date(endAtRaw) : null;
  const allDay = formData.get("allDay") === "on";
  const type = String(formData.get("type") ?? "task");
  const color = String(formData.get("color") ?? "blue");
  const clientSlug = String(formData.get("clientSlug") ?? "").trim() || null;
  const leadId = String(formData.get("leadId") ?? "").trim() || null;
  const notifyEmail = formData.get("notifyEmail") !== "off";

  if (!title || isNaN(startAt.getTime())) return;

  await prisma.calendarEvent.update({
    where: { id },
    data: { title, description, startAt, endAt, allDay, type, color, clientSlug, leadId, notifyEmail },
  });

  revalidatePath("/admin/calendar");
  redirect("/admin/calendar");
}

export async function deleteEvent(id: string) {
  await prisma.calendarEvent.delete({ where: { id } });
  revalidatePath("/admin/calendar");
}

function eventCreatedEmail(title: string, startAt: Date, type: string, description?: string | null) {
  const dateStr = startAt.toLocaleString("ro-RO", {
    weekday: "long", day: "2-digit", month: "long", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
  const typeLabel: Record<string, string> = {
    task: "Task", meeting: "Întâlnire", deadline: "Deadline",
    "go-live": "Go-live", "follow-up": "Follow-up", call: "Apel",
  };
  return `
    <div style="font-family:system-ui,sans-serif;max-width:520px;margin:0 auto;background:#fff;border:1px solid #e5e7eb;border-radius:16px;overflow:hidden;">
      <div style="background:#111;padding:24px 28px;">
        <p style="color:#aaa;margin:0;font-size:12px;text-transform:uppercase;letter-spacing:.08em;">ReplacedByAI · Calendar</p>
        <h1 style="color:#fff;margin:8px 0 0;font-size:22px;">${title}</h1>
      </div>
      <div style="padding:24px 28px;">
        <p style="margin:0 0 6px;font-size:13px;color:#6b7280;text-transform:uppercase;letter-spacing:.06em;">Data</p>
        <p style="margin:0 0 20px;font-size:16px;color:#111;">${dateStr}</p>
        <p style="margin:0 0 6px;font-size:13px;color:#6b7280;text-transform:uppercase;letter-spacing:.06em;">Tip</p>
        <p style="margin:0 0 20px;font-size:15px;color:#111;">${typeLabel[type] ?? type}</p>
        ${description ? `<p style="margin:0 0 6px;font-size:13px;color:#6b7280;text-transform:uppercase;letter-spacing:.06em;">Detalii</p><p style="margin:0;font-size:14px;color:#374151;">${description}</p>` : ""}
      </div>
      <div style="padding:16px 28px;background:#f9fafb;border-top:1px solid #e5e7eb;">
        <a href="https://www.replacedbyai.ro/admin/calendar" style="font-size:13px;color:#111;">Deschide calendarul →</a>
      </div>
    </div>`;
}

export async function sendCalendarReminders() {
  const now = new Date();
  const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);

  const events = await prisma.calendarEvent.findMany({
    where: {
      notifyEmail: true,
      notifiedAt: null,
      startAt: { gte: now, lte: endOfDay },
    },
  });

  for (const ev of events) {
    await sendEmail({
      to: "contact@replacedbyai.ro",
      subject: `⏰ Reminder: ${ev.title} — în mai puțin de 1h`,
      html: reminderEmail(ev.title, ev.startAt, ev.type, ev.description),
    }).catch(() => {});

    await prisma.calendarEvent.update({
      where: { id: ev.id },
      data: { notifiedAt: new Date() },
    });
  }

  return { sent: events.length };
}

function reminderEmail(title: string, startAt: Date, type: string, description?: string | null) {
  const dateStr = startAt.toLocaleString("ro-RO", {
    weekday: "long", day: "2-digit", month: "long",
    hour: "2-digit", minute: "2-digit",
  });
  return `
    <div style="font-family:system-ui,sans-serif;max-width:520px;margin:0 auto;background:#fff;border:1px solid #fde68a;border-radius:16px;overflow:hidden;">
      <div style="background:#f59e0b;padding:24px 28px;">
        <p style="color:#78350f;margin:0;font-size:12px;text-transform:uppercase;letter-spacing:.08em;">ReplacedByAI · Reminder</p>
        <h1 style="color:#fff;margin:8px 0 0;font-size:22px;">⏰ ${title}</h1>
      </div>
      <div style="padding:24px 28px;">
        <p style="font-size:16px;color:#111;margin:0 0 12px;">Evenimentul începe în mai puțin de <strong>1 oră</strong>.</p>
        <p style="font-size:15px;color:#374151;margin:0 0 20px;">📅 ${dateStr}</p>
        ${description ? `<p style="font-size:14px;color:#6b7280;margin:0;">${description}</p>` : ""}
      </div>
      <div style="padding:16px 28px;background:#fffbeb;border-top:1px solid #fde68a;">
        <a href="https://www.replacedbyai.ro/admin/calendar" style="font-size:13px;color:#92400e;">Deschide calendarul →</a>
      </div>
    </div>`;
}
