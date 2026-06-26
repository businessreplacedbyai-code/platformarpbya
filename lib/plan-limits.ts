// ═══════════════════════════════════════════════════════════════════════════
//  PLANURI SELF-SERVE (USD) + LIMITE HARD — „să nu ies pe minus deloc"
//  Sursa unică de adevăr. Tot accesul/usage-ul se gateează pe astea.
//  Fiecare plan are limite incluse (cap) + cost estimat pe TINE → marjă probată.
// ═══════════════════════════════════════════════════════════════════════════

export type SelfServePlanKey = "free" | "starter" | "pro" | "business";

// Costuri unitare estimate pe TINE (conservator). Vezi _internal-docs/PRETURI-SELF-SERVE.md
export const UNIT_COST = {
  voicePerMin: 0.06,   // telefonie + STT + Claude + TTS (MiniMax)
  numberMonthly: 2,    // număr telefon / agent vocal
  aiGenReal: 0.5,      // 4 poze + 1 video (generare reală; demo = gratis)
  siteHostMonthly: 1,
  stripePct: 0.029,
  stripeFlat: 0.3,
};

export type PlanLimits = {
  key: SelfServePlanKey;
  name: string;
  priceUsd: number;      // /lună (0 = trial)
  setupUsd: number;      // one-time (acoperă provizionarea numărului) — cash instant
  trialDays?: number;
  // LIMITE HARD (cap). La depășire → pauză sau overage prepaid.
  sites: number;
  aiGenReal: number;     // generări AI reale/lună (demo = nelimitat & gratis)
  voiceMinutes: number;  // minute voce incluse/lună
  voiceAgents: number;   // câte numere/agenți vocali
  channels: number;      // WhatsApp/IG/web/calendar (99 = toate)
  customDomain: boolean;
  badge: boolean;        // „Made with ReplacedByAI"
  realAi: boolean;       // are voie generare AI reală (trial = doar demo)
  overageVoicePerMin: number; // peste minute incluse (mare marjă)
};

export const SELF_SERVE_PLANS: Record<SelfServePlanKey, PlanLimits> = {
  free: {
    key: "free", name: "Free trial", priceUsd: 0, setupUsd: 0, trialDays: 14,
    sites: 1, aiGenReal: 0, voiceMinutes: 15, voiceAgents: 0, channels: 1,
    customDomain: false, badge: true, realAi: false, overageVoicePerMin: 0,
  },
  starter: {
    key: "starter", name: "Starter", priceUsd: 49, setupUsd: 19,
    sites: 1, aiGenReal: 10, voiceMinutes: 150, voiceAgents: 1, channels: 1,
    customDomain: true, badge: true, realAi: true, overageVoicePerMin: 0.18,
  },
  pro: {
    key: "pro", name: "Pro", priceUsd: 89, setupUsd: 29,
    sites: 3, aiGenReal: 25, voiceMinutes: 500, voiceAgents: 1, channels: 99,
    customDomain: true, badge: false, realAi: true, overageVoicePerMin: 0.15,
  },
  business: {
    key: "business", name: "Business", priceUsd: 199, setupUsd: 29,
    sites: 999, aiGenReal: 60, voiceMinutes: 1200, voiceAgents: 3, channels: 99,
    customDomain: true, badge: false, realAi: true, overageVoicePerMin: 0.12,
  },
};

export function getPlan(key?: string | null): PlanLimits {
  return SELF_SERVE_PLANS[(key ?? "").toLowerCase() as SelfServePlanKey] ?? SELF_SERVE_PLANS.free;
}

// Verifică dacă o acțiune e permisă de plan (gating).
export function canUse(
  plan: PlanLimits,
  resource: "site" | "aiGen" | "voiceMin" | "voiceAgent" | "channel",
  alreadyUsed: number
): { ok: boolean; limit: number; reason?: string } {
  const limit = {
    site: plan.sites, aiGen: plan.aiGenReal, voiceMin: plan.voiceMinutes,
    voiceAgent: plan.voiceAgents, channel: plan.channels,
  }[resource];
  if (resource === "aiGen" && !plan.realAi) {
    return { ok: false, limit: 0, reason: "Generarea AI reală e disponibilă din planul Starter (în trial: doar demo)." };
  }
  if (alreadyUsed >= limit) {
    return { ok: false, limit, reason: `Ai atins limita planului (${limit}). Fă upgrade sau cumpără extra.` };
  }
  return { ok: true, limit };
}

// Cost maxim pe TINE dacă clientul folosește planul la cap (verificarea anti-pierdere).
export function planCost(plan: PlanLimits): number {
  const voice = plan.voiceMinutes * UNIT_COST.voicePerMin;
  const numbers = plan.voiceAgents * UNIT_COST.numberMonthly;
  const gen = plan.aiGenReal * UNIT_COST.aiGenReal;
  const host = Math.min(plan.sites, 5) * UNIT_COST.siteHostMonthly;
  const stripe = plan.priceUsd > 0 ? plan.priceUsd * UNIT_COST.stripePct + UNIT_COST.stripeFlat : 0;
  return +(voice + numbers + gen + host + stripe).toFixed(2);
}

// Marja ta la usage maxim. pct < 0 ar însemna pierdere → NU se întâmplă niciodată cu valorile de mai sus.
export function planMargin(plan: PlanLimits): { cost: number; margin: number; pct: number } {
  const cost = planCost(plan);
  const margin = +(plan.priceUsd - cost).toFixed(2);
  const pct = plan.priceUsd > 0 ? Math.round((margin / plan.priceUsd) * 100) : 0;
  return { cost, margin, pct };
}

// Mapare planKey self-serve → Stripe Price ID (din env). Se completează la crearea prețurilor.
export const STRIPE_PRICE_ENV: Record<Exclude<SelfServePlanKey, "free">, { monthly: string; annual: string }> = {
  starter: { monthly: "STRIPE_PRICE_STARTER_M", annual: "STRIPE_PRICE_STARTER_Y" },
  pro: { monthly: "STRIPE_PRICE_PRO_M", annual: "STRIPE_PRICE_PRO_Y" },
  business: { monthly: "STRIPE_PRICE_BUSINESS_M", annual: "STRIPE_PRICE_BUSINESS_Y" },
};
