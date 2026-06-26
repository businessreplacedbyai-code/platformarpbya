// Provisioning — orchestrarea plată → agent.
// După plată: bundle-urile pe industrie provisionează agenți ficși automat;
// pachetele generice (Growth/Scale/Enterprise) oferă N "sloturi" pe care
// clientul și-i alege din dashboard; agenții individuali se provisionează direct.
import { prisma } from "@/lib/db";
import { activateAgentWorkflows, triggerProvision, n8nEnabled } from "@/lib/n8n";
import { SELF_SERVE_PLANS, type SelfServePlanKey } from "@/lib/plan-limits";

// Câte sloturi de agenți oferă fiecare plan (pentru alegere în dashboard).
export const PLAN_SLOTS: Record<string, number> = {
  pilot: 1,
  growth: 3,
  scale: 6,
  enterprise: 99,
  horeca: 3,
  medical: 3,
};

// Bundle-uri pe industrie = agenți ficși (provisionați automat).
export const BUNDLE_FIXED_AGENTS: Record<string, string[]> = {
  horeca: ["voicebot", "schedulerbot", "socialbot"],
  medical: ["schedulerbot", "supportbot", "reviewbot"],
};

// Slug-uri de agenți valide din catalog (pentru alegere).
export const VALID_AGENTS = [
  "voicebot", "schedulerbot", "supportbot", "salesbot", "socialbot",
  "accountbot", "contentbot", "reviewbot", "designbot", "hrbot",
];

export type Entitlement = {
  planKey: string | null;
  slots: number;        // total sloturi din plan
  used: number;         // agenți deja adăugați (non-canceled)
  remaining: number;    // câți mai poate alege
  fixed: boolean;       // true = bundle cu agenți ficși (fără alegere)
};

/** Câte sloturi are clientul + câte a folosit. */
export async function getEntitlement(clientId: string): Promise<Entitlement> {
  const client = await prisma.client.findUnique({
    where: { id: clientId },
    include: { agents: true },
  });
  const planKey = client?.planKey ?? null;
  // Sloturi de agenți: planurile self-serve (voiceAgents) au prioritate;
  // fallback pe vechile pachete (growth/scale/...) pentru clienți legacy.
  const ssPlan = planKey ? SELF_SERVE_PLANS[planKey as SelfServePlanKey] : undefined;
  const slots = ssPlan ? ssPlan.voiceAgents : planKey ? PLAN_SLOTS[planKey] ?? 0 : 0;
  const fixed = !!(planKey && BUNDLE_FIXED_AGENTS[planKey]);
  const used = (client?.agents ?? []).filter((a) => a.status !== "canceled").length;
  return { planKey, slots, used, remaining: Math.max(0, slots - used), fixed };
}

/**
 * Provisionează UN agent pentru un client:
 *  1. creează/actualizează ClientAgent (status: planned)
 *  2. activează workflow-urile n8n ale agentului (idempotent)
 *  3. trimite provisioning webhook (setup per-client în n8n)
 * Nu aruncă — întoarce rezultat.
 */
export async function provisionAgent(
  clientId: string,
  agentSlug: string,
  opts: { skipSlotCheck?: boolean } = {}
): Promise<{ ok: boolean; error?: string; agentSlug: string }> {
  try {
    if (!opts.skipSlotCheck) {
      const ent = await getEntitlement(clientId);
      const already = await prisma.clientAgent.findUnique({
        where: { clientId_agentSlug: { clientId, agentSlug } },
      });
      if (!already && ent.remaining <= 0) {
        return { ok: false, error: "no_slots", agentSlug };
      }
    }

    // 1. ClientAgent → planned
    await prisma.clientAgent.upsert({
      where: { clientId_agentSlug: { clientId, agentSlug } },
      update: { status: "planned" },
      create: { clientId, agentSlug, status: "planned" },
    });

    const client = await prisma.client.findUnique({ where: { id: clientId } });

    // 2. Activează workflow-urile n8n (best-effort)
    let n8nActivated = false;
    let lastError: string | null = null;
    if (n8nEnabled()) {
      const r = await activateAgentWorkflows(agentSlug);
      n8nActivated = r.activated.length > 0;
      if (r.failed.length) lastError = `n8n: ${r.failed.map((f) => f.error).join(", ")}`;
      // 3. Provisioning webhook per-client
      await triggerProvision({
        event: "agent.provision",
        clientId,
        clientSlug: client?.slug,
        businessName: client?.businessName,
        email: client?.email,
        phone: client?.phone,
        plan: client?.planKey ?? undefined,
        agentSlug,
      });
    }

    // Salvează meta provisioning (câmpuri adăugate în ClientAgent)
    await prisma.clientAgent.update({
      where: { clientId_agentSlug: { clientId, agentSlug } },
      data: {
        status: "configuring",
        ...( { n8nActivated, provisionedAt: new Date(), lastError } as Record<string, unknown> ),
      },
    });

    return { ok: true, agentSlug };
  } catch (e) {
    return { ok: false, error: String(e), agentSlug };
  }
}

/**
 * Provisionează tot ce decurge dintr-un plan plătit:
 *  - bundle industrie (horeca/medical) → agenți ficși automat
 *  - agent individual (slug în VALID_AGENTS) → acel agent
 *  - pachet generic (growth/scale/enterprise) → doar entitlement (alege din dashboard)
 */
export async function provisionForPlan(
  clientId: string,
  planKey: string
): Promise<{ provisioned: string[]; mode: "fixed" | "single" | "slots" }> {
  const key = planKey.toLowerCase();

  // Bundle cu agenți ficși
  if (BUNDLE_FIXED_AGENTS[key]) {
    const provisioned: string[] = [];
    for (const slug of BUNDLE_FIXED_AGENTS[key]) {
      const r = await provisionAgent(clientId, slug, { skipSlotCheck: true });
      if (r.ok) provisioned.push(slug);
    }
    return { provisioned, mode: "fixed" };
  }

  // Agent individual
  if (VALID_AGENTS.includes(key)) {
    const r = await provisionAgent(clientId, key, { skipSlotCheck: true });
    return { provisioned: r.ok ? [key] : [], mode: "single" };
  }

  // Pachet generic → entitlement (clientul alege din dashboard)
  return { provisioned: [], mode: "slots" };
}
