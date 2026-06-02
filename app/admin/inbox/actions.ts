"use server";

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { sendEmail } from "@/lib/mail";

const REPLY_FROM = "contact@replacedbyai.ro";
const REPLY_FROM_NAME = "ReplacedByAI";

export async function replyToThread(threadId: string, formData: FormData) {
  const body = String(formData.get("body") ?? "").trim();
  if (!body) return { error: "Mesajul e gol" };

  const thread = await prisma.emailThread.findUnique({
    where: { id: threadId },
    include: { messages: { orderBy: { createdAt: "asc" }, take: 1 } },
  });
  if (!thread) return { error: "Thread inexistent" };

  const subject = thread.subject.startsWith("Re:")
    ? thread.subject
    : `Re: ${thread.subject}`;

  const html = replyHtml(body, thread.fromName ?? thread.fromEmail);

  let resendId: string | undefined;
  try {
    const res = await sendEmail({
      to: thread.fromEmail,
      subject,
      html,
      replyTo: `${REPLY_FROM_NAME} <reply@in.replacedbyai.ro>`,
    });
    resendId = (res as { id?: string })?.id;
  } catch (e) {
    console.error("reply send failed", e);
    return { error: "Trimiterea a eșuat" };
  }

  await prisma.emailMessage.create({
    data: {
      threadId,
      direction: "out",
      fromEmail: REPLY_FROM,
      fromName: REPLY_FROM_NAME,
      toEmail: thread.fromEmail,
      subject,
      bodyText: body,
      bodyHtml: html,
      resendId: resendId ?? null,
    },
  });

  await prisma.emailThread.update({
    where: { id: threadId },
    data: { status: "replied", lastAt: new Date() },
  });

  revalidatePath(`/admin/inbox/${threadId}`);
  revalidatePath("/admin/inbox");
  return { ok: true };
}

export async function archiveThread(threadId: string) {
  await prisma.emailThread.update({
    where: { id: threadId },
    data: { status: "archived" },
  });
  revalidatePath("/admin/inbox");
}

export async function reopenThread(threadId: string) {
  await prisma.emailThread.update({
    where: { id: threadId },
    data: { status: "open" },
  });
  revalidatePath(`/admin/inbox/${threadId}`);
}

function replyHtml(body: string, recipientName: string) {
  const escaped = body
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    .replace(/\n/g, "<br>");
  return `
    <div style="font-family:system-ui,sans-serif;max-width:600px;margin:0 auto;color:#1a1a1a;">
      <p style="font-size:15px;line-height:1.7;margin:0 0 24px;">${escaped}</p>
      <hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0"/>
      <p style="font-size:12px;color:#9ca3af;margin:0;">
        ReplacedByAI · <a href="https://www.replacedbyai.ro" style="color:#6b7280;">replacedbyai.ro</a>
      </p>
    </div>`;
}
