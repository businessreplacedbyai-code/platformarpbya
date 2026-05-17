// Lead scoring automat — 0..100.
// Calculat pe baza datelor primite în formularul complex.

export type LeadInput = {
  cuiValid?: boolean;
  vatPayer?: boolean;
  inactiveAnaf?: boolean;
  sector?: string;
  employees?: string;
  monthlyBudget?: string;
  urgency?: string;
  agentsWanted?: string[];
  hasWebsite?: boolean;
  hasMessage?: boolean;
};

export type ScoreBreakdown = {
  score: number;
  reasons: string[];
};

const SECTOR_FIT: Record<string, number> = {
  horeca: 18,
  medical: 18,
  beauty: 16,
  imobiliare: 16,
  servicii: 14,
  retail: 12,
  altul: 6,
};

const EMPLOYEES_SCORE: Record<string, number> = {
  "1": 4,
  "2-5": 10,
  "6-20": 16,
  "21-50": 18,
  "50+": 14, // foarte mari adesea trebuie ofertă enterprise → ciclu lung
};

const BUDGET_SCORE: Record<string, number> = {
  "<500": 4,
  "500-1500": 14,
  "1500-3000": 20,
  "3000+": 22,
};

const URGENCY_SCORE: Record<string, number> = {
  asap: 22,
  "1-3luni": 16,
  "3-6luni": 8,
  exploring: 2,
};

export function scoreLead(input: LeadInput): ScoreBreakdown {
  const reasons: string[] = [];
  let score = 0;

  if (input.cuiValid) {
    score += 8;
    reasons.push("+8 CUI valid");
  }
  if (input.vatPayer) {
    score += 4;
    reasons.push("+4 plătitor TVA");
  }
  if (input.inactiveAnaf) {
    score -= 25;
    reasons.push("-25 firmă inactivă ANAF");
  }

  const sec = SECTOR_FIT[input.sector ?? ""] ?? 0;
  if (sec) {
    score += sec;
    reasons.push(`+${sec} sector ${input.sector}`);
  }

  const emp = EMPLOYEES_SCORE[input.employees ?? ""] ?? 0;
  if (emp) {
    score += emp;
    reasons.push(`+${emp} echipă ${input.employees}`);
  }

  const bud = BUDGET_SCORE[input.monthlyBudget ?? ""] ?? 0;
  if (bud) {
    score += bud;
    reasons.push(`+${bud} buget ${input.monthlyBudget}€`);
  }

  const urg = URGENCY_SCORE[input.urgency ?? ""] ?? 0;
  if (urg) {
    score += urg;
    reasons.push(`+${urg} urgență`);
  }

  const agents = input.agentsWanted?.length ?? 0;
  if (agents >= 3) {
    score += 6;
    reasons.push("+6 multi-agent");
  } else if (agents >= 1) {
    score += 3;
    reasons.push(`+3 ${agents} agent(i) intenționați`);
  }

  if (input.hasWebsite) {
    score += 3;
    reasons.push("+3 are website");
  }
  if (input.hasMessage) {
    score += 2;
    reasons.push("+2 mesaj completat");
  }

  score = Math.max(0, Math.min(100, score));
  return { score, reasons };
}

export function scoreBand(score: number): "hot" | "warm" | "cold" {
  if (score >= 65) return "hot";
  if (score >= 35) return "warm";
  return "cold";
}
