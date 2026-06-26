// ═══════════════════════════════════════════════════════════════════════════
//  STRATEGIE DE PREȚ — ReplacedByAI (RO 2026) · DONE-FOR-YOU în LEI
//  Model: noi instalăm agenții pe afacerea clientului. SETUP (cash în față) +
//  ABONAMENT lunar. Cârlig de intrare = AUDIT + DEMO GRATUIT (lead-gen).
//  Target realist: ~10.000 lei/lună recurent la ~15 clienți pe „Complet".
// ═══════════════════════════════════════════════════════════════════════════

// ─── PACHETE PRINCIPALE (done-for-you, în lei) ─────────────────────────────
export type Bundle = {
  key: "GROWTH" | "SCALE" | "ENTERPRISE";
  badge: string;
  name: string;
  audience: string;
  price: number;        // lei / lună (abonament)
  setup: number;        // lei one-time (instalare + configurare pe afacerea ta)
  features: string[];
  competitor: string;   // ce ar costa un angajat / o agenție
  highlight?: boolean;
};

export const BUNDLES: Bundle[] = [
  {
    key: "GROWTH",
    badge: "Entry",
    name: "Esențial",
    audience: "Clinici, saloane, restaurante, magazine",
    price: 490,
    setup: 990,
    features: [
      "1 agent AI la alegere (vocal sau programări)",
      "Instalat și configurat de noi, pe afacerea ta",
      "1 canal (telefon / WhatsApp / web)",
      "Raport lunar + suport",
      "Live în 5 zile lucrătoare",
    ],
    competitor: "vs. ~3.000 lei/lună un angajat la telefon",
  },
  {
    key: "SCALE",
    badge: "Recomandat",
    name: "Complet",
    audience: "Afaceri cu volum mare de apeluri și programări",
    price: 890,
    setup: 1490,
    features: [
      "Agent vocal + agent de programări",
      "Telefon + WhatsApp + Google Calendar",
      "Integrare cu sistemul tău existent",
      "Optimizare lunară + suport prioritar",
      "Raport cu apeluri preluate și programări",
      "Live în 5 zile lucrătoare",
    ],
    competitor: "vs. ~6.000 lei/lună doi angajați",
    highlight: true,
  },
  {
    key: "ENTERPRISE",
    badge: "Premium",
    name: "Pro / Multi-locație",
    audience: "Lanțuri, francize, clinici mari, multi-locație",
    price: 1490,
    setup: 2490,
    features: [
      "Agenți nelimitați + toate canalele",
      "Multi-locație / multi-număr",
      "Integrări custom + manager de cont",
      "Rapoarte detaliate + call lunar",
      "Suport prioritar, răspuns rapid",
      "Branding white-label opțional",
    ],
    competitor: "vs. echipă de call-center",
  },
];

// ─── PACHETE PE INDUSTRIE (entry point accesibil, în lei) ───────────────────
export type IndustryBundle = {
  key: string;
  category: string;
  name: string;
  tagline: string;
  price: number;
  setup: number;
  includes: string[];
};

export const INDUSTRY_BUNDLES: IndustryBundle[] = [
  {
    key: "medical",
    category: "Clinici & Saloane",
    name: "Pachet Clinică / Salon",
    tagline: "Zero programări pierdute la apel ratat",
    price: 390,
    setup: 690,
    includes: [
      "Agent de programări (telefon + WhatsApp + web)",
      "Răspunde la întrebări despre servicii și prețuri",
      "Reminder automat → mai puține no-show-uri",
    ],
  },
  {
    key: "horeca",
    category: "Restaurante & Cafenele",
    name: "Pachet Restaurant / Cafenea",
    tagline: "Preia rezervări și comenzi 24/7",
    price: 390,
    setup: 690,
    includes: [
      "Agent vocal (rezervări + comenzi pe telefon)",
      "Programări pe WhatsApp și web",
      "Răspuns automat la recenzii Google",
    ],
  },
];

// ─── AGENȚI INDIVIDUALI (în lei) ───────────────────────────────────────────
export type AgentPrice = {
  slug: string;
  name: string;
  role: string;
  monthly: number;   // lei
  setup: number;     // lei
  bestFor: string;
};

export const AGENT_PRICES: AgentPrice[] = [
  { slug: "voicebot",     name: "VoiceBot",      role: "Agent Vocal AI",         monthly: 890, setup: 490, bestFor: "Orice afacere cu volum mare de apeluri" },
  { slug: "schedulerbot", name: "SchedulerBot",  role: "Programări automate",    monthly: 490, setup: 390, bestFor: "Clinici, saloane, cabinete, service-uri" },
  { slug: "supportbot",   name: "SupportBot",    role: "Suport 24/7",            monthly: 390, setup: 290, bestFor: "Orice afacere cu întrebări repetitive" },
  { slug: "salesbot",     name: "SalesBot",      role: "Vânzări & Lead-uri",     monthly: 690, setup: 490, bestFor: "Firme B2B, agenții, e-commerce" },
  { slug: "socialbot",    name: "SocialBot",     role: "Social Media AI",        monthly: 490, setup: 340, bestFor: "Orice brand cu prezență online" },
  { slug: "accountbot",   name: "AccountBot",    role: "Contabil Junior AI",     monthly: 340, setup: 390, bestFor: "IMM-uri, freelanceri, firme servicii" },
  { slug: "contentbot",   name: "ContentBot",    role: "Editor & Copywriter",    monthly: 390, setup: 240, bestFor: "Agenții, bloguri, e-commerce" },
  { slug: "reviewbot",    name: "ReviewBot",     role: "Reputație Online",       monthly: 390, setup: 190, bestFor: "HoReCa, clinici, service-uri" },
  { slug: "designbot",    name: "DesignBot",     role: "Designer Grafic AI",     monthly: 490, setup: 290, bestFor: "Startup-uri, branduri noi" },
  { slug: "hrbot",        name: "HRBot",         role: "Recrutor AI",            monthly: 490, setup: 390, bestFor: "Companii cu angajări frecvente" },
];

// ─── CÂRLIGUL DE INTRARE: AUDIT + DEMO GRATUIT (lead-gen) ───────────────────
//   Înlocuiește trial-ul/pilotul plătit. Gratis, fără card, fără obligații.
//   Scop: prinde lead-ul, arată valoarea (demo personalizat), apoi convertește.
export const FREE_AUDIT = {
  price: 0,
  name: "Audit + demo gratuit",
  tagline: "Îți arătăm câte apeluri/programări pierzi și îți facem un demo de agent vocal pe afacerea ta — gratis.",
  includes: [
    "Analiză gratuită a punctelor unde pierzi clienți",
    "Demo de agent vocal personalizat pe afacerea ta",
    "Estimare de ROI (cât recuperezi pe lună)",
    "Fără card, fără obligații",
  ],
};

// Backwards-compat: unele componente importă PILOT_OFFER. Îl mapăm pe auditul gratuit.
export const PILOT_OFFER = {
  price: 0,
  durationDays: 0,
  name: FREE_AUDIT.name,
  tagline: FREE_AUDIT.tagline,
  includes: FREE_AUDIT.includes,
};

// ─── DISCOUNT-URI ─────────────────────────────────────────────────────────
export const DISCOUNTS = {
  annualMonthly: 100,  // -100 lei/lună dacă plătești anual
  noCancelPct: 10,
  annualMonthsFree: 2, // plată anuală = 2 luni gratuite
};

export const annualPrice = (monthly: number) =>
  monthly * (12 - DISCOUNTS.annualMonthsFree);

// ─── GARANȚII / RISK-REVERSAL ─────────────────────────────────────────────
export const GUARANTEES = [
  { title: "Instalat de noi",      body: "Nu te atingi de nimic tehnic." },
  { title: "Live în 5 zile",        body: "Începi să vezi rezultate rapid." },
  { title: "Fără contract anual",   body: "Anulezi oricând, fără penalizări." },
  { title: "Date păstrate în UE",   body: "GDPR-compliant, fără surprize." },
];

// ─── PROIECȚIE VENIT (în lei) — drum realist pentru un fondator solo ───────
export const REVENUE_PROJECTION = {
  rows: [
    { label: "15 × Complet (890 lei)",        total: 13350 },
    { label: "10 × Esențial (490 lei)",       total: 4900 },
    { label: "3 × Pro (1.490 lei)",           total: 4470 },
  ],
  total: 22720,
  totalClients: 28,
  note: "Țintă realistă: ~22.000 lei/lună recurent la 28 de clienți activi — plus cash-ul din setup-uri (≈1.000–2.500 lei/client în față). Motorul: outreach direct pe o nișă (clinici/saloane întâi) + audit & demo gratuit ca acroșaj.",
  milestones: [
    { key: "M1", ron: 5000, clients: 8, month: "1-2" },
    { key: "M2", ron: 12000, clients: 16, month: "3-4" },
    { key: "M3", ron: 22000, clients: 28, month: "6" },
  ],
};
