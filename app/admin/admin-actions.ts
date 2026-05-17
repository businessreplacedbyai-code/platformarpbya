"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { nanoid } from "nanoid";
import { prisma } from "@/lib/db";
import { z } from "zod";
import { sendEmail, statusChangeClientEmail } from "@/lib/mail";
import { audit } from "@/lib/audit";

export async function updateLeadStatus(leadId: string, status: string) {
  await prisma.lead.update({ where: { id: leadId }, data: { status } });
  await audit({ action: "lead.status.update", targetType: "Lead", targetId: leadId, metadata: { status } });
  revalidatePath(`/admin/leads/${leadId}`);
  revalidatePath("/admin/leads");
}

export async function updateLeadNotes(leadId: string, notes: string) {
  await prisma.lead.update({ where: { id: leadId }, data: { notes } });
  await audit({ action: "lead.notes.update", targetType: "Lead", targetId: leadId });
  revalidatePath(`/admin/leads/${leadId}`);
}

export async function convertLeadToClient(leadId: string) {
  const lead = await prisma.lead.findUnique({ where: { id: leadId } });
  if (!lead) throw new Error("Lead inexistent");

  const baseSlug = slugify(lead.business);
  let slug = baseSlug;
  let i = 1;
  while (await prisma.client.findUnique({ where: { slug } })) {
    slug = `${baseSlug}-${i++}`;
  }

  const client = await prisma.client.create({
    data: {
      slug,
      businessName: lead.business,
      contactName: lead.name,
      email: lead.email,
      phone: lead.phone,
      intakeToken: nanoid(24),
      tasks: { create: defaultTasks() },
    },
  });

  await prisma.lead.update({
    where: { id: leadId },
    data: { status: "won" },
  });
  await audit({ action: "lead.convert", targetType: "Lead", targetId: leadId, metadata: { clientSlug: client.slug } });

  redirect(`/admin/clients/${client.slug}`);
}

const newClientSchema = z.object({
  businessName: z.string().min(2),
  contactName: z.string().min(2),
  email: z.string().email(),
  phone: z.string().min(5),
  plan: z.string().optional(),
});

export async function createClient(formData: FormData) {
  const parsed = newClientSchema.safeParse({
    businessName: formData.get("businessName"),
    contactName: formData.get("contactName"),
    email: formData.get("email"),
    phone: formData.get("phone"),
    plan: formData.get("plan") || undefined,
  });
  if (!parsed.success) {
    redirect("/admin/clients/new?error=invalid");
  }

  const baseSlug = slugify(parsed.data.businessName);
  let slug = baseSlug;
  let i = 1;
  while (await prisma.client.findUnique({ where: { slug } })) {
    slug = `${baseSlug}-${i++}`;
  }

  const client = await prisma.client.create({
    data: {
      slug,
      businessName: parsed.data.businessName,
      contactName: parsed.data.contactName,
      email: parsed.data.email,
      phone: parsed.data.phone,
      plan: parsed.data.plan,
      intakeToken: nanoid(24),
      tasks: { create: defaultTasks() },
    },
  });
  await audit({ action: "client.create", targetType: "Client", targetId: client.id, metadata: { slug: client.slug } });

  redirect(`/admin/clients/${client.slug}`);
}

export async function toggleTask(taskId: string, done: boolean, clientSlug: string) {
  await prisma.implementationTask.update({
    where: { id: taskId },
    data: { done, doneAt: done ? new Date() : null },
  });
  revalidatePath(`/admin/clients/${clientSlug}`);
}

export async function addNote(clientId: string, body: string, clientSlug: string) {
  if (!body.trim()) return;
  await prisma.clientNote.create({ data: { clientId, body } });
  revalidatePath(`/admin/clients/${clientSlug}`);
}

export async function updateClientStatus(clientId: string, status: string, clientSlug: string) {
  const client = await prisma.client.update({
    where: { id: clientId },
    data: {
      status,
      goLiveAt: status === "live" ? new Date() : undefined,
    },
  });
  await audit({ action: "client.status.update", targetType: "Client", targetId: clientId, metadata: { status } });

  // Notifică clientul (best-effort)
  if (["live", "paused", "churned"].includes(status)) {
    sendEmail({
      to: client.email,
      subject: `Status cont ReplacedByAI — ${status}`,
      html: statusChangeClientEmail(client.contactName, status),
    }).catch((e) => console.error("status email failed", e));
  }

  revalidatePath(`/admin/clients/${clientSlug}`);
}

function slugify(s: string) {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "")
    .slice(0, 50);
}

function defaultTasks() {
  // bazat pe docul 08-ONBOARDING-CLIENT.md
  return [
    // setup
    { phase: "setup", title: "Contract semnat", orderIdx: 1 },
    { phase: "setup", title: "Plată setup primită", orderIdx: 2 },
    { phase: "setup", title: "Link intake trimis clientului", orderIdx: 3 },
    { phase: "setup", title: "Intake completat de client", orderIdx: 4 },
    // config
    { phase: "config", title: "Prompt agent configurat", orderIdx: 10 },
    { phase: "config", title: "FAQ-uri încărcate în KB", orderIdx: 11 },
    { phase: "config", title: "Voice + ton ales și clonat", orderIdx: 12 },
    { phase: "config", title: "Număr telefon provisioned (Twilio)", orderIdx: 13 },
    // integrations
    { phase: "integrations", title: "Calendar conectat (Google/Cal.com)", orderIdx: 20 },
    { phase: "integrations", title: "CRM conectat (dacă există)", orderIdx: 21 },
    { phase: "integrations", title: "WhatsApp Business API verificat", orderIdx: 22 },
    { phase: "integrations", title: "Webhook-uri / Make scenarios live", orderIdx: 23 },
    // testing
    { phase: "testing", title: "Test apel cu tester desemnat", orderIdx: 30 },
    { phase: "testing", title: "Test booking end-to-end", orderIdx: 31 },
    { phase: "testing", title: "Test escaladare la om", orderIdx: 32 },
    { phase: "testing", title: "Validare GDPR + retention policy", orderIdx: 33 },
    // preview
    { phase: "preview", title: "Demo cu clientul (preview)", orderIdx: 40 },
    { phase: "preview", title: "Aprobare go-live", orderIdx: 41 },
    { phase: "preview", title: "Forward număr / DNS / activare canal", orderIdx: 42 },
    { phase: "preview", title: "Go-live + monitorizare 48h", orderIdx: 43 },
  ];
}
