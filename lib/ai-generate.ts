// Motor de creștere — generare text cu Claude (ANTHROPIC_API_KEY).
// Folosit de: /api/admin/motor/generate (on-demand) + cron daily-digest (strategia zilei).

const MODEL = "claude-haiku-4-5-20251001"; // proven cu cheia proiectului

export async function claudeGenerate(
  prompt: string,
  opts: { system?: string; maxTokens?: number; model?: string } = {}
): Promise<string> {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) throw new Error("ANTHROPIC_API_KEY lipsește");
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": key,
      "anthropic-version": "2023-06-01",
      "content-type": "application/json",
    },
    body: JSON.stringify({
      model: opts.model ?? MODEL,
      max_tokens: opts.maxTokens ?? 1400,
      ...(opts.system ? { system: opts.system } : {}),
      messages: [{ role: "user", content: prompt }],
    }),
    signal: AbortSignal.timeout(45000),
  });
  if (!res.ok) {
    const t = await res.text().catch(() => "");
    throw new Error(`Claude ${res.status}: ${t.slice(0, 200)}`);
  }
  const data = await res.json();
  return String(data.content?.[0]?.text ?? "").trim();
}

const BRAND =
  "Context: ReplacedByAI — agenție din România care construiește site-uri profesionale și instalează agenți AI vocali (preiau apeluri, programări, vânzări 24/7). Model DONE-FOR-YOU (noi instalăm tot, clientul nu se atinge de tehnic). Prețuri în lei (setup + abonament lunar). Nișe: clinici stomatologice/medicale, saloane/beauty, HORECA, service-uri locale. Acroșaj: audit + demo gratuit.";

export const GEN_TYPES: Record<
  string,
  { label: string; system: string; placeholder: string }
> = {
  strategie: {
    label: "Strategie de găsit clienți",
    system: `Ești strateg de growth B2B pentru piața din România. ${BRAND} Dai strategii ZILNICE concrete și acționabile pentru găsit clienți noi — nu teorie, pași clari pe care un fondator solo îi face azi. Română, scurt, pași numerotați.`,
    placeholder: "ex: strategie pentru clinici stomatologice din Cluj",
  },
  reclama: {
    label: "Reclamă (ad copy)",
    system: `Ești copywriter de performance ads pentru piața RO. ${BRAND} Scrii reclame care convertesc: hook puternic, durere concretă, soluție, CTA clar. Adaptezi la platformă (Meta/Google/TikTok). Dai 2-3 variante. Fără clișee, română naturală.`,
    placeholder: "ex: reclamă Meta pentru agent vocal la stomatologi",
  },
  mesaj: {
    label: "Mesaj de outreach",
    system: `Ești expert în cold outreach B2B România. ${BRAND} Scrii mesaje scurte, umane: curiozitate + durere concretă + CTA soft (demo gratuit). Salut pe ora zilei. Fără jargon, fără „Da sau nu". Dai mesajul + 1-2 follow-up-uri.`,
    placeholder: "ex: mesaj WhatsApp pentru saloane de înfrumusețare",
  },
  social: {
    label: "Postare / reel social",
    system: `Ești creator de conținut organic pentru ReplacedByAI. ${BRAND} Scrii postări și scripturi de reel cu hook în primele 3 secunde, valoare reală, CTA. Pentru Instagram/TikTok/LinkedIn. Autentic, nu corporate.`,
    placeholder: "ex: reel despre câte apeluri pierde o clinică",
  },
  oferta: {
    label: "Ofertă / material business",
    system: `Ești consultant de business pentru ReplacedByAI. ${BRAND} Construiești oferte clare, pachete, propuneri de valoare legate de cifre și ROI. Română, concret.`,
    placeholder: "ex: ofertă pentru un cabinet stomatologic cu ROI",
  },
};

export type GenType = keyof typeof GEN_TYPES;

// Strategia zilei — folosită de cron (email automat).
export async function generateDailyStrategy(context?: string): Promise<string> {
  const today = new Intl.DateTimeFormat("ro-RO", {
    weekday: "long", day: "numeric", month: "long", timeZone: "Europe/Bucharest",
  }).format(new Date());
  const prompt = `Azi e ${today}. Dă-mi STRATEGIA ZILEI pentru găsit clienți noi pentru ReplacedByAI — un singur plan focusat, executabil azi.${context ? `\nContext intern: ${context}` : ""}

Format:
1. **Ținta azi** — ce nișă + oraș atac (variază de la zi la zi)
2. **Tactica** — exact ce fac, pas cu pas (3-5 pași)
3. **Unghiul** — ce hook/mesaj folosesc (o frază)
4. **Ținta numerică** — câte contacte/apeluri azi
Maxim 200 de cuvinte. Concret, nu teorie.`;
  return claudeGenerate(prompt, { system: GEN_TYPES.strategie.system, maxTokens: 700 });
}
