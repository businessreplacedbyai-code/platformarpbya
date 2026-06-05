"use server";

import { getAdminSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { createInvoice, sendInvoiceEmail, type InvoiceItem } from "@/lib/oblio";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

async function requireAdmin() {
  const session = await getAdminSession();
  if (!session || session.role !== "admin") redirect("/login");
  return session;
}

type LineInput = {
  description: string;
  quantity: number;
  unitPrice: number;
  vat: number;
  unit: string;
  taxIncluded: boolean;
};

/** Creează o factură custom prin Oblio + o salvează în DB. */
export async function createCustomInvoice(formData: FormData) {
  const session = await requireAdmin();

  const clientName = String(formData.get("clientName") || "").trim();
  const clientCui = String(formData.get("clientCui") || "").trim();
  const clientEmail = String(formData.get("clientEmail") || "").trim();
  const clientAddress = String(formData.get("clientAddress") || "").trim();
  const clientCity = String(formData.get("clientCity") || "").trim();
  const clientCounty = String(formData.get("clientCounty") || "").trim();
  const isTaxPayer = formData.get("isTaxPayer") === "on";
  const currency = String(formData.get("currency") || "RON").toUpperCase();
  const dueDays = parseInt(String(formData.get("dueDays") || "5"), 10);
  const sendEmail = formData.get("sendEmail") === "on";
  const mentions = String(formData.get("mentions") || "").trim();
  const clientId = String(formData.get("clientId") || "").trim() || null;

  if (!clientName) redirect("/admin/facturi?err=no_name");

  let lines: LineInput[] = [];
  try {
    lines = JSON.parse(String(formData.get("itemsJson") || "[]"));
  } catch {
    redirect("/admin/facturi?err=bad_items");
  }
  lines = lines.filter((l) => l.description && l.unitPrice > 0);
  if (lines.length === 0) redirect("/admin/facturi?err=no_items");

  const items: InvoiceItem[] = lines.map((l) => ({
    name: l.description,
    price: l.unitPrice,
    quantity: l.quantity || 1,
    currency,
    measuringUnit: l.unit || "buc",
    taxPercentage: l.vat ?? 19,
    isTaxIncluded: l.taxIncluded ?? true,
  }));

  // Total (cenți) — pentru evidență internă
  const total = Math.round(
    lines.reduce((s, l) => s + (l.unitPrice * (l.quantity || 1)), 0) * 100
  );
  const vatPercent = lines[0]?.vat ?? 19;
  const description = lines.map((l) => l.description).join(" · ").slice(0, 200);

  const res = await createInvoice({
    client: {
      name: clientName,
      email: clientEmail || null,
      vatCode: clientCui || null,
      isTaxPayer,
      address: clientAddress || null,
      city: clientCity || null,
      county: clientCounty || null,
    },
    items,
    currency,
    dueInDays: dueDays,
    sendEmail,
    mentions,
  });

  await prisma.invoice.create({
    data: {
      series: res.series ?? null,
      number: res.number ?? null,
      clientName,
      clientCui: clientCui || null,
      clientEmail: clientEmail || null,
      clientAddress: clientAddress || null,
      clientCity: clientCity || null,
      amount: total,
      currency,
      vatPercent,
      description,
      itemsJson: JSON.stringify(lines),
      status: res.ok ? (sendEmail ? "sent" : "issued") : "error",
      smartbillError: res.ok ? null : (res.error ?? "unknown"),
      emailedAt: res.ok && sendEmail ? new Date() : null,
      clientId,
      createdBy: session.email ?? null,
    },
  });

  revalidatePath("/admin/facturi");
  redirect(res.ok ? `/admin/facturi?ok=${encodeURIComponent(`${res.series}-${res.number}`)}` : `/admin/facturi?err=oblio`);
}

/** Retrimite o factură pe email. */
export async function resendInvoice(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") || "");
  const inv = await prisma.invoice.findUnique({ where: { id } });
  if (!inv?.series || !inv?.number) redirect("/admin/facturi?err=no_invoice");
  const r = await sendInvoiceEmail(inv.series, inv.number, inv.clientEmail ?? undefined);
  if (r.ok) {
    await prisma.invoice.update({ where: { id }, data: { status: "sent", emailedAt: new Date() } });
  }
  revalidatePath("/admin/facturi");
  redirect(r.ok ? "/admin/facturi?ok=resent" : "/admin/facturi?err=resend");
}
