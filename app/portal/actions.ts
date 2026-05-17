"use server";

import { prisma } from "@/lib/db";
import { getClientSession } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import { sendEmail, newPurchaseRequestAdminEmail } from "@/lib/mail";

const ADMIN_NOTIFY = process.env.ADMIN_NOTIFY_EMAIL || "contact@replacedbyai.ro";

async function requireClient() {
  const session = await getClientSession();
  if (!session?.clientSlug) redirect("/login?type=client");
  const client = await prisma.client.findUnique({
    where: { slug: session.clientSlug },
  });
  if (!client) redirect("/login?type=client");
  return client;
}

export async function requestAgent(agentSlug: string, message?: string) {
  const client = await requireClient();

  // Verifică să nu fie deja activ
  const existing = await prisma.clientAgent.findUnique({
    where: { clientId_agentSlug: { clientId: client.id, agentSlug } },
  });
  if (existing) {
    return { ok: false, error: "Acest agent este deja atribuit." };
  }

  // Verifică să nu existe cerere pending
  const pending = await prisma.agentPurchaseRequest.findFirst({
    where: { clientId: client.id, agentSlug, status: "pending" },
  });
  if (pending) {
    return { ok: false, error: "Ai deja o cerere în așteptare pentru acest agent." };
  }

  await prisma.agentPurchaseRequest.create({
    data: {
      clientId: client.id,
      agentSlug,
      message: message?.trim() || null,
      status: "pending",
    },
  });

  // Notifică admin (best-effort)
  sendEmail({
    to: ADMIN_NOTIFY,
    subject: `Cerere nouă agent — ${client.businessName}`,
    html: newPurchaseRequestAdminEmail({
      clientName: client.contactName,
      businessName: client.businessName,
      agentSlug,
      message: message?.trim() || null,
    }),
  }).catch((e) => console.error("purchase email failed", e));

  revalidatePath("/portal/marketplace");
  revalidatePath("/portal");
  return { ok: true };
}

export async function changePassword(currentPassword: string, newPassword: string) {
  const client = await requireClient();
  if (!client.passwordHash) return { ok: false, error: "Nicio parolă setată." };

  const valid = await bcrypt.compare(currentPassword, client.passwordHash);
  if (!valid) return { ok: false, error: "Parola curentă e incorectă." };

  if (newPassword.length < 8) {
    return { ok: false, error: "Parola nouă trebuie să aibă minim 8 caractere." };
  }

  const hash = await bcrypt.hash(newPassword, 10);
  await prisma.client.update({
    where: { id: client.id },
    data: { passwordHash: hash, mustSetPassword: false },
  });
  return { ok: true };
}
