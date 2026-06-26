"use server";

import { prisma } from "@/lib/db";
import { getClientSession } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import { nanoid } from "nanoid";
import { sendEmail, newPurchaseRequestAdminEmail, agentRequestConfirmationEmail } from "@/lib/mail";
import { hashApiKey } from "@/lib/client-api";
import { provisionAgent, getEntitlement, VALID_AGENTS } from "@/lib/provisioning";

const ADMIN_NOTIFY = process.env.ADMIN_NOTIFY_EMAIL || "contact@replacedbyai.ro";

/**
 * Clientul își alege un agent din sloturile plătite (Growth/Scale/Enterprise).
 * Verifică entitlement-ul, apoi provisionează (creează ClientAgent + activează n8n).
 */
export async function chooseAgent(formData: FormData) {
  const client = await requireClient();
  const agentSlug = String(formData.get("agentSlug") || "");
  if (!VALID_AGENTS.includes(agentSlug)) {
    redirect("/portal/agents?err=invalid_agent");
  }
  const ent = await getEntitlement(client.id);
  const existing = await prisma.clientAgent.findUnique({
    where: { clientId_agentSlug: { clientId: client.id, agentSlug } },
  });
  if (!existing && ent.remaining <= 0) {
    redirect("/portal/agents?err=no_slots");
  }
  const r = await provisionAgent(client.id, agentSlug);
  revalidatePath("/portal/agents");
  redirect(r.ok ? "/portal/agents?ok=added" : "/portal/agents?err=provision");
}

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

  // Verifică onboarding complet
  if (!client.intakeSubmittedAt) {
    redirect("/portal/implementation?warn=intake");
  }

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

  // Notifică admin
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

  // Confirmare pentru client
  sendEmail({
    to: client.email,
    subject: `Cerere primită — ReplacedByAI`,
    html: agentRequestConfirmationEmail(client.contactName, agentSlug),
  }).catch((e) => console.error("agent request confirm email failed", e));

  revalidatePath("/portal/marketplace");
  revalidatePath("/portal");
  return { ok: true };
}

// Cerere „extra / custom" din cont — trimite email la admin (nu auto-provision).
export async function requestExtra(formData: FormData) {
  const client = await requireClient();
  const message = String(formData.get("message") || "").trim();
  if (!message) redirect("/portal/extra?err=empty");
  const safe = message.replace(/</g, "&lt;").slice(0, 4000);
  sendEmail({
    to: ADMIN_NOTIFY,
    subject: `Cerere extra/custom — ${client.businessName}`,
    html: `<p><b>${client.businessName}</b> · ${client.contactName} · ${client.email}</p>
<p>Plan: ${client.planKey ?? "—"} · slug: ${client.slug}</p>
<p>Mesaj:</p><p>${safe}</p>`,
  }).catch((e) => console.error("extra request email failed", e));
  redirect("/portal/extra?sent=1");
}

export async function changePasswordAction(formData: FormData) {
  const current = String(formData.get("current") || "");
  const next = String(formData.get("next") || "");
  const confirm = String(formData.get("confirm") || "");

  if (next !== confirm) {
    redirect("/portal/account?err=" + encodeURIComponent("Parolele nu coincid."));
  }
  if (next.length < 8) {
    redirect("/portal/account?err=" + encodeURIComponent("Parola trebuie să aibă minim 8 caractere."));
  }
  const result = await changePassword(current, next);
  if (!result.ok) {
    redirect("/portal/account?err=" + encodeURIComponent(result.error || "Eroare necunoscută."));
  }
  redirect("/portal/account?ok=1");
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

// ─── API KEYS ─────────────────────────────────────────────────────────────────

export async function createApiKey(
  name: string
): Promise<{ ok: true; rawKey: string; keyId: string } | { ok: false; error: string }> {
  const client = await requireClient();
  if (!name.trim()) return { ok: false, error: "Trebuie să dai un nume cheii." };

  const active = await prisma.clientApiKey.count({
    where: { clientId: client.id, revokedAt: null },
  });
  if (active >= 5) return { ok: false, error: "Maxim 5 chei active pe cont." };

  const rawKey = `rbai_${nanoid(32)}`;
  const prefix = rawKey.slice(0, 12);
  const record = await prisma.clientApiKey.create({
    data: { clientId: client.id, name: name.trim(), hashedKey: hashApiKey(rawKey), prefix },
  });

  revalidatePath("/portal/integrations");
  return { ok: true, rawKey, keyId: record.id };
}

export async function revokeApiKey(
  keyId: string
): Promise<{ ok: boolean; error?: string }> {
  const client = await requireClient();
  const key = await prisma.clientApiKey.findUnique({ where: { id: keyId } });
  if (!key || key.clientId !== client.id) return { ok: false, error: "Cheie negăsită." };

  await prisma.clientApiKey.update({ where: { id: keyId }, data: { revokedAt: new Date() } });
  revalidatePath("/portal/integrations");
  return { ok: true };
}

// ─── WEBHOOKS ─────────────────────────────────────────────────────────────────

const VALID_EVENTS = [
  "conversation.created",
  "payment.succeeded",
  "agent.deployed",
  "agent.status_changed",
] as const;

export async function addWebhook(
  url: string,
  event: string
): Promise<{ ok: boolean; secret?: string; error?: string }> {
  const client = await requireClient();

  try { new URL(url); } catch { return { ok: false, error: "URL invalid." }; }
  if (!(VALID_EVENTS as readonly string[]).includes(event)) {
    return { ok: false, error: "Eveniment invalid." };
  }

  const count = await prisma.clientWebhook.count({ where: { clientId: client.id } });
  if (count >= 5) return { ok: false, error: "Maxim 5 webhook-uri pe cont." };

  const secret = `whsec_${nanoid(24)}`;
  await prisma.clientWebhook.create({
    data: { clientId: client.id, event, url: url.trim(), secret, active: true },
  });

  revalidatePath("/portal/integrations");
  return { ok: true, secret };
}

export async function deleteWebhook(
  webhookId: string
): Promise<{ ok: boolean; error?: string }> {
  const client = await requireClient();
  const wh = await prisma.clientWebhook.findUnique({ where: { id: webhookId } });
  if (!wh || wh.clientId !== client.id) return { ok: false, error: "Webhook negăsit." };

  await prisma.clientWebhook.delete({ where: { id: webhookId } });
  revalidatePath("/portal/integrations");
  return { ok: true };
}
