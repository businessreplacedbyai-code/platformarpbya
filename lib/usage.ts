// Enforcement limite self-serve — consum + gating pe plan (anti-pierdere).
import { prisma } from "@/lib/db";
import { getPlan } from "@/lib/plan-limits";

export function currentPeriod(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

export async function getUsed(clientId: string, resource: string, period = currentPeriod()): Promise<number> {
  const row = await prisma.clientUsage.findUnique({
    where: { clientId_period_resource: { clientId, period, resource } },
  });
  return row?.amount ?? 0;
}

export async function consume(clientId: string, resource: string, amount = 1, period = currentPeriod()): Promise<void> {
  await prisma.clientUsage.upsert({
    where: { clientId_period_resource: { clientId, period, resource } },
    update: { amount: { increment: amount } },
    create: { clientId, period, resource, amount },
  });
}

type GateResult = { ok: boolean; used: number; limit: number; reason?: string };

// Verifică (fără consum) dacă un client mai poate genera AI real, după planul lui.
export async function checkAi(clientSlug: string): Promise<GateResult> {
  const c = await prisma.client.findUnique({ where: { slug: clientSlug }, select: { id: true, planKey: true } });
  if (!c) return { ok: true, used: 0, limit: 0 }; // necunoscut → nu bloca
  const plan = getPlan(c.planKey);
  if (!plan.realAi) {
    return { ok: false, used: 0, limit: 0, reason: "Generarea AI reală e disponibilă din planul Starter (în trial: doar demo)." };
  }
  const used = await getUsed(c.id, "aiGen");
  if (used >= plan.aiGenReal) {
    return { ok: false, used, limit: plan.aiGenReal, reason: `Ai atins limita planului (${plan.aiGenReal} generări AI/lună). Fă upgrade sau cumpără extra.` };
  }
  return { ok: true, used, limit: plan.aiGenReal };
}

export async function consumeAi(clientSlug: string): Promise<void> {
  const c = await prisma.client.findUnique({ where: { slug: clientSlug }, select: { id: true } });
  if (c) await consume(c.id, "aiGen", 1);
}

// Generic, pentru viitor (minute voce, site-uri): verifică + (opțional) consumă.
export async function checkAndMaybeConsume(
  clientSlug: string,
  resource: "voiceMin" | "site",
  amount: number,
  doConsume: boolean
): Promise<GateResult> {
  const c = await prisma.client.findUnique({ where: { slug: clientSlug }, select: { id: true, planKey: true } });
  if (!c) return { ok: true, used: 0, limit: 0 };
  const plan = getPlan(c.planKey);
  const limit = resource === "voiceMin" ? plan.voiceMinutes : plan.sites;
  const used = await getUsed(c.id, resource);
  if (used + amount > limit) {
    return { ok: false, used, limit, reason: `Ai atins limita planului (${limit}). Fă upgrade sau cumpără extra.` };
  }
  if (doConsume) await consume(c.id, resource, amount);
  return { ok: true, used: used + amount, limit };
}
