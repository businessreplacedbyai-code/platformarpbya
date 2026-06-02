"use server";

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import { nanoid } from "nanoid";
import { sendEmail, clientWelcomeEmail, agentRequestUpdateEmail, agentLiveEmail } from "@/lib/mail";
import { getAdminSession, staffCan } from "@/lib/auth";

async function requireAdmin(minRole: "VIEWER" | "EDITOR" | "ADMIN" | "OWNER" = "EDITOR") {
  const session = await getAdminSession();
  if (!session || session.role !== "admin") throw new Error("Unauthorized");
  if (!staffCan(session.staffRole, minRole)) throw new Error("Insufficient permissions");
}

// ───── Client portal access ─────
export async function generateClientPassword(clientId: string, slug: string) {
  await requireAdmin("ADMIN");
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
  await requireAdmin("ADMIN");
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
  await requireAdmin("EDITOR");
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
  const agent = await prisma.clientAgent.update({
    where: { id: agentId },
    data: {
      status,
      goLiveAt: status === "live" ? new Date() : undefined,
    },
    include: { client: true },
  });

  // Notifică clientul când agentul devine live
  if (status === "live") {
    sendEmail({
      to: agent.client.email,
      subject: `${agent.agentSlug} este live! 🚀 | ReplacedByAI`,
      html: agentLiveEmail(agent.client.contactName, agent.agentSlug),
    }).catch((e) => console.error("agent live email failed", e));
  }

  revalidatePath(`/admin/clients/${clientSlug}/agents`);
}

export async function removeAgent(agentId: string, clientSlug: string) {
  await prisma.clientAgent.delete({ where: { id: agentId } });
  revalidatePath(`/admin/clients/${clientSlug}/agents`);
}

export async function saveAgentConfig(
  agentId: string,
  clientSlug: string,
  configNotes: string,
  promptOverride: string
) {
  await prisma.clientAgent.update({
    where: { id: agentId },
    data: {
      configNotes: configNotes || null,
      promptOverride: promptOverride || null,
    },
  });
  revalidatePath(`/admin/clients/${clientSlug}`);
  revalidatePath(`/admin/clients/${clientSlug}/agents/${agentId}`);
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

  // Notifică clientul despre decizie (approved sau rejected)
  if (status === "approved" || status === "rejected") {
    sendEmail({
      to: req.client.email,
      subject: status === "approved"
        ? `Cerere aprobată — ${req.agentSlug} | ReplacedByAI`
        : `Cerere respinsă — ${req.agentSlug} | ReplacedByAI`,
      html: agentRequestUpdateEmail(
        req.client.contactName,
        req.agentSlug,
        status as "approved" | "rejected",
        adminNote
      ),
    }).catch((e) => console.error("purchase request update email failed", e));
  }

  revalidatePath("/admin/requests");
  revalidatePath(`/admin/clients/${req.client.slug}`);
}
