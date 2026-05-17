"use server";

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import { nanoid } from "nanoid";
import { sendEmail, clientWelcomeEmail } from "@/lib/mail";

// ───── Client portal access ─────
export async function generateClientPassword(clientId: string, slug: string) {
  const tempPassword = nanoid(12);
  const hash = await bcrypt.hash(tempPassword, 10);
  const client = await prisma.client.update({
    where: { id: clientId },
    data: { passwordHash: hash, mustSetPassword: true },
  });

  // Trimite email de welcome cu credențiale (best-effort)
  sendEmail({
    to: client.email,
    subject: "Acces portal ReplacedByAI",
    html: clientWelcomeEmail(client.contactName, client.slug, tempPassword),
  }).catch((e) => console.error("welcome email failed", e));

  // Redirect cu parola în URL (vizibilă doar admin-ului, o singură dată)
  redirect(`/admin/clients/${slug}?newPassword=${encodeURIComponent(tempPassword)}`);
}

export async function revokeClientAccess(clientId: string, slug: string) {
  await prisma.client.update({
    where: { id: clientId },
    data: { passwordHash: null, mustSetPassword: true },
  });
  revalidatePath(`/admin/clients/${slug}`);
}

// ───── Agents management ─────
export async function addAgentToClient(
  clientId: string,
  slug: string,
  agentSlug: string
) {
  await prisma.clientAgent.upsert({
    where: { clientId_agentSlug: { clientId, agentSlug } },
    update: {},
    create: { clientId, agentSlug, status: "planned" },
  });
  revalidatePath(`/admin/clients/${slug}/agents`);
}

export async function updateAgentStatus(
  agentId: string,
  status: string,
  clientSlug: string
) {
  await prisma.clientAgent.update({
    where: { id: agentId },
    data: {
      status,
      goLiveAt: status === "live" ? new Date() : undefined,
    },
  });
  revalidatePath(`/admin/clients/${clientSlug}/agents`);
}

export async function removeAgent(agentId: string, clientSlug: string) {
  await prisma.clientAgent.delete({ where: { id: agentId } });
  revalidatePath(`/admin/clients/${clientSlug}/agents`);
}

// ───── Purchase requests (din portal client) ─────
export async function updatePurchaseRequest(
  id: string,
  status: string,
  adminNote: string | undefined
) {
  const req = await prisma.agentPurchaseRequest.update({
    where: { id },
    data: { status, adminNote },
    include: { client: true },
  });

  // Auto-creează ClientAgent dacă approved
  if (status === "approved" || status === "implemented") {
    await prisma.clientAgent.upsert({
      where: {
        clientId_agentSlug: {
          clientId: req.clientId,
          agentSlug: req.agentSlug,
        },
      },
      update: {},
      create: {
        clientId: req.clientId,
        agentSlug: req.agentSlug,
        status: status === "implemented" ? "live" : "planned",
      },
    });
  }

  revalidatePath("/admin/requests");
  revalidatePath(`/admin/clients/${req.client.slug}`);
}
