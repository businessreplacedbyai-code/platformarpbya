"use server";

import { getAdminSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { createPaymentLink, deactivatePaymentLink } from "@/lib/payment-links";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

async function requireAdmin() {
  const s = await getAdminSession();
  if (!s || s.role !== "admin") redirect("/login");
  return s;
}

const VALID_AGENTS = ["voicebot", "schedulerbot", "supportbot", "salesbot", "socialbot",
  "accountbot", "contentbot", "reviewbot", "designbot", "hrbot"];

export async function createCustomPaymentLink(formData: FormData) {
  const session = await requireAdmin();

  const description = String(formData.get("description") || "").trim();
  const amountStr = String(formData.get("amount") || "0").replace(",", ".");
  const amount = Math.round(parseFloat(amountStr) * 100); // în cenți
  const currency = String(formData.get("currency") || "eur").toLowerCase();
  const mode = String(formData.get("mode") || "payment") as "payment" | "subscription";
  const clientIdRaw = String(formData.get("clientId") || "").trim();
  const clientId = clientIdRaw || null;
  const agentSlugRaw = String(formData.get("agentSlug") || "").trim();
  const agentSlug = VALID_AGENTS.includes(agentSlugRaw) ? agentSlugRaw : null;
  const customerEmail = String(formData.get("customerEmail") || "").trim() || null;
  const customerName = String(formData.get("customerName") || "").trim() || null;
  const internalNote = String(formData.get("internalNote") || "").trim() || null;

  if (!description || amount <= 0) {
    redirect("/admin/payment-links?err=missing");
  }

  // 1. creăm rândul DB ca să avem ID-ul de pus în metadata Stripe
  const draft = await prisma.paymentLink.create({
    data: {
      stripeLinkId: `pending_${Date.now()}`,
      url: "",
      description,
      amount,
      currency,
      mode,
      status: "active",
      clientId,
      agentSlug,
      customerEmail,
      customerName,
      internalNote,
      createdBy: session.email ?? null,
    },
  });

  // 2. creăm linkul Stripe cu metadata = draft.id
  const res = await createPaymentLink(
    {
      description,
      amount,
      currency,
      mode,
      clientId,
      agentSlug,
      customerEmail,
      customerName,
      internalNote,
    },
    draft.id
  );

  if (!res.ok || !res.id || !res.url) {
    // ștergem draft-ul orfan
    await prisma.paymentLink.delete({ where: { id: draft.id } }).catch(() => {});
    redirect(`/admin/payment-links?err=stripe`);
  }

  // 3. updatăm cu ID-ul + URL-ul real Stripe
  await prisma.paymentLink.update({
    where: { id: draft.id },
    data: { stripeLinkId: res.id, url: res.url },
  });

  revalidatePath("/admin/payment-links");
  redirect(`/admin/payment-links?ok=${draft.id}`);
}

export async function disablePaymentLink(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") || "");
  const link = await prisma.paymentLink.findUnique({ where: { id } });
  if (!link) redirect("/admin/payment-links?err=notfound");
  await deactivatePaymentLink(link.stripeLinkId);
  await prisma.paymentLink.update({ where: { id }, data: { status: "disabled" } });
  revalidatePath("/admin/payment-links");
  redirect("/admin/payment-links?ok=disabled");
}
