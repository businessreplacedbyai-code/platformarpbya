"use server";
// Server actions pentru integrări client (API keys + webhooks pentru n8n).
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { nanoid } from "nanoid";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getClientSession } from "@/lib/auth";
import { hashApiKey } from "@/lib/client-api";

const NEW_KEY_COOKIE = "rbai_client_newkey";

async function requireClient() {
  const s = await getClientSession();
  if (!s?.sub) redirect("/login?next=/portal/integrations");
  return s.sub;
}

export async function generateApiKey(formData: FormData) {
  const clientId = await requireClient();
  const name = String(formData.get("name") || "Cheie API").slice(0, 60);

  const raw = `rbai_live_${nanoid(32)}`;
  await prisma.clientApiKey.create({
    data: {
      clientId,
      name,
      hashedKey: hashApiKey(raw),
      prefix: raw.slice(0, 16),
    },
  });

  const jar = await cookies();
  jar.set(NEW_KEY_COOKIE, raw, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/portal/integrations",
    maxAge: 60,
  });
  redirect("/portal/integrations?ok=key");
}

export async function revokeApiKey(formData: FormData) {
  const clientId = await requireClient();
  const id = String(formData.get("id"));
  await prisma.clientApiKey.updateMany({
    where: { id, clientId },
    data: { revokedAt: new Date() },
  });
  revalidatePath("/portal/integrations");
}

export async function readNewKey(): Promise<string | null> {
  const jar = await cookies();
  return jar.get(NEW_KEY_COOKIE)?.value ?? null;
}

// ─── Webhooks ─────────────────────────────────────────────────────────────
const WebhookSchema = z.object({
  event: z.string().min(2).max(60),
  url: z.string().url().max(500),
});

export async function addWebhook(formData: FormData) {
  const clientId = await requireClient();
  const p = WebhookSchema.safeParse({
    event: formData.get("event"),
    url: formData.get("url"),
  });
  if (!p.success) redirect("/portal/integrations?err=webhook");

  const secret = `whsec_${nanoid(24)}`;
  await prisma.clientWebhook.create({
    data: { clientId, event: p.data.event, url: p.data.url, secret },
  });
  revalidatePath("/portal/integrations");
  redirect("/portal/integrations?ok=webhook");
}

export async function deleteWebhook(formData: FormData) {
  const clientId = await requireClient();
  const id = String(formData.get("id"));
  await prisma.clientWebhook.deleteMany({ where: { id, clientId } });
  revalidatePath("/portal/integrations");
}

export async function toggleWebhook(formData: FormData) {
  const clientId = await requireClient();
  const id = String(formData.get("id"));
  const active = String(formData.get("active")) === "true";
  await prisma.clientWebhook.updateMany({
    where: { id, clientId },
    data: { active },
  });
  revalidatePath("/portal/integrations");
}
