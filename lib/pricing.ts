// ═══════════════════════════════════════════════════════════════════════════
//  STRATEGIE DE PREȚ — ReplacedByAI (RO 2026) · revizia 3
//  Target: €10.000/lună la 22 clienți activi (mix Growth/Scale/Enterprise).
//  Nu micro-afaceri — clinici private, firme B2B, agenții.
// ═══════════════════════════════════════════════════════════════════════════

// ─── PACHETE PRINCIPALE ───────────────────────────────────────────────────
export type Bundle = {
  key: "GROWTH" | "SCALE" | "ENTERPRISE";
  badge: string;
  name: string;
  audience: string;
  price: number;        // EUR / lună
  setup: number;        // EUR one-time
  features: string[];
  competitor: string;   // ce cere concurența pentru ceva similar
  highlight?: boolean;
};

export const BUNDLES: Bundle[] = [
  {
    key: "GROWTH",
    badge: "Entry",
    name: "Growth",
    audience: "Restaurante, saloane, clinici, magazine",
    price: 249,
    setup: 149,
    features: [
      "3 agenți AI la alegere",
      "WhatsApp + web + email",
      "Dashboard + raport lunar",
      "Suport prioritar",
      "Garanție 30 zile",
      "Pilot 30 zile la €99",
    ],
    competitor: "€400 – 700 / lună",
  },
  {
    key: "SCALE",
    badge: "Recomandat",
    name: "Scale",
    audience: "Companii 10 – 50 angajați, agenții, firme B2B",
    price: 499,
    setup: 249,
    features: [
      "6 agenți AI la alegere",
      "Toate canalele + VoiceBot",
      "Integrări custom",
      "Raport săptămânal + call lunar",
      "SLA 99% uptime",
      "Garanție 30 zile",
      "Onboarding dedicat",
    ],
    competitor: "€900 – 1.500 / lună",
    highlight: true,
  },
  {
    key: "ENTERPRISE",
    badge: "Premium",
    name: "Enterprise",
    audience: "Lanțuri, francize, corporații, clinici private",
    price: 1200,
    setup: 499,
    features: [
      "Agenți nelimitați",
      "Toate canalele + integrări custom",
      "Manager de cont dedicat",
      "Rapoarte zilnice + call săptămânal",
      "SLA 99.9% + răspuns 2h",
      "Branding white-label opțional",
      "Garanție 30 zile",
    ],
    competitor: "€2.000 – 5.000 / lună",
  },
];

// ─── PACHETE PE INDUSTRIE (entry point mai accesibil) ──────────────────────
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
    key: "horeca",
    category: "HoReCa",
    name: "Pachet Restaurant / Cafenea",
    tagline: "Comenzi + rezervări + social media",
    price: 179,
    setup: 99,
    includes: [
      "VoiceBot (comenzi + rezervări telefon)",
      "SchedulerBot (WhatsApp + web)",
      "SocialBot (15 postări / lună)",
    ],
  },
  {
    key: "medical",
    category: "Medical & Beauty",
    name: "Pachet Clinică / Salon",
    tagline: "Programări automate + no-show redus",
    price: 179,
    setup: 99,
    includes: [
      "SchedulerBot (WhatsApp + web + telefon)",
      "SupportBot (FAQ + info servicii)",
      "ReviewBot (Google auto-reply)",
    ],
  },
];

// ─── AGENȚI INDIVIDUALI (pentru clienți care vor un singur serviciu) ───────
export type AgentPrice = {
  slug: string;
  name: string;
  role: string;
  monthly: number;   // EUR
  setup: number;     // EUR
  bestFor: string;
};

export const AGENT_PRICES: AgentPrice[] = [
  { slug: "voicebot",     name: "VoiceBot",      role: "Agent Vocal AI",         monthly: 179, setup: 99, bestFor: "Orice afacere cu volum mare de apeluri" },
  { slug: "schedulerbot", name: "SchedulerBot",  role: "Programări automate",    monthly: 99,  setup: 79, bestFor: "Clinici, saloane, cabinete, service-uri" },
  { slug: "supportbot",   name: "SupportBot",    role: "Suport 24/7",            monthly: 89,  setup: 59, bestFor: "Orice afacere cu întrebări repetitive" },
  { slug: "salesbot",     name: "SalesBot",      role: "Vânzări & Lead-uri",     monthly: 149, setup: 99, bestFor: "Firme B2B, agenții, e-commerce" },
  { slug: "socialbot",    name: "SocialBot",     role: "Social Media AI",        monthly: 119, setup: 69, bestFor: "Orice brand cu prezență online" },
  { slug: "accountbot",   name: "AccountBot",    role: "Contabil Junior AI",     monthly: 69,  setup: 79, bestFor: "IMM-uri, freelanceri, firme servicii" },
  { slug: "contentbot",   name: "ContentBot",    role: "Editor & Copywriter",    monthly: 89,  setup: 49, bestFor: "Agenții, bloguri, e-commerce" },
  { slug: "reviewbot",    name: "ReviewBot",     role: "Reputație Online",       monthly: 79,  setup: 39, bestFor: "HoReCa, clinici, service-uri" },
  { slug: "designbot",    name: "DesignBot",     role: "Designer Grafic AI",     monthly: 119, setup: 59, bestFor: "Startup-uri, branduri noi" },
  { slug: "hrbot",        name: "HRBot",         role: "Recrutor AI",            monthly: 119, setup: 79, bestFor: "Companii cu angajări frecvente" },
];

// ─── PILOT (ofertă de intrare — înlocuiește trial-ul gratuit) ─────────────
//   €99 / 30 zile · 1 agent · 1 canal. Aduce cash + califică + convertește la Growth.
export const PILOT_OFFER = {
  price: 99,          // EUR one-time
  durationDays: 30,
  name: "Pilot 30 zile",
  tagline: "Un agent AI, configurat și live. Vezi rezultate înainte să te abonezi.",
  includes: [
    "1 agent AI la alegere",
    "1 canal (WhatsApp / web / telefon)",
    "Setup complet în 48h",
    "Suport pe toată durata pilotului",
    "Se deduce din primul abonament dacă continui",
  ],
};

// ─── DISCOUNT-URI ─────────────────────────────────────────────────────────
export const DISCOUNTS = {
  annualMonthly: 20,   // -€20/lună dacă plătești anual (12 luni avans)
  noCancelPct: 10,     // -10% dacă renunți la opțiunea de anulare
  annualMonthsFree: 2, // plată anuală = 2 luni gratuite (plătești 10, primești 12)
};

// Preț anual (10 luni în loc de 12) pentru un preț lunar dat.
export const annualPrice = (monthly: number) =>
  monthly * (12 - DISCOUNTS.annualMonthsFree);

// ─── GARANȚII / RISK-REVERSAL ─────────────────────────────────────────────
export const GUARANTEES = [
  { title: "30 zile garanție",   body: "Bani înapoi dacă nu îți place." },
  { title: "Setup în 48 ore",     body: "Începi să vezi rezultate rapid." },
  { title: "Fără contract anual", body: "Anulezi oricând, fără penalizări." },
  { title: "Date păstrate în UE", body: "GDPR-compliant, fără surprize." },
];

// ─── PROIECȚIE VENIT — drumul spre 40k (vezi marketing-engine/00-MODEL-VENIT.md) ──
//   Scară cu 3 trepte: M1 €8k (luna 3-4) → M2 €20k (luna 6-7) → M3 €40k (luna 10-12)
export const REVENUE_PROJECTION = {
  rows: [
    { label: "35 × Growth (€249)",                 total: 8715 },
    { label: "30 × Scale (€499)",                  total: 14970 },
    { label: "8 × Enterprise (€1.200)",            total: 9600 },
    { label: "25 × industrie (€179)",              total: 4475 },
    { label: "20 × agent individual (~€110)",      total: 2200 },
  ],
  total: 39960,
  totalClients: 118,
  note: "Țintă M3: €40.000/lună MRR (~200.000 RON) la 118 clienți activi, luna 10-12. Milestone garantat M1: €8.000 MRR (~40.000 RON) la 29 clienți, luna 3-4. Motorul: ~1.500 touch-uri outreach/lună × rate de conversie = ~10 clienți noi/lună. Plan complet în marketing-engine/.",
  milestones: [
    { key: "M1", mrr: 8000, ron: 40000, clients: 29, month: "3-4" },
    { key: "M2", mrr: 20000, ron: 100000, clients: 60, month: "6-7" },
    { key: "M3", mrr: 40000, ron: 200000, clients: 118, month: "10-12" },
  ],
};
