// Outreach lead enrichment — finds email + generates outreach message.
// Messages: editorial, curiosity-driven, NO "Da sau nu" robotic CTAs.
// Returns 3 variants when called with `variants: true` (UI picker).
import { NextRequest, NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth";
import { prisma } from "@/lib/db";

export const runtime = "nodejs";
export const maxDuration = 30;

// ═══════════════════════════════════════════════════════════════════════════
// EMAIL DISCOVERY — scrape website, fall back to common patterns
// ═══════════════════════════════════════════════════════════════════════════

const EMAIL_RE = /[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}/g;
const SPAM_DOMAINS = ["sentry", "pixel", "example", "schema", "wix", "wordpress",
  "jquery", "google", "facebook", "instagram", "tiktok"];
const GENERIC_DOMAINS = ["gmail.com", "yahoo.com", "hotmail.com", "outlook.com"];

function cleanEmail(e: string): boolean {
  const low = e.toLowerCase();
  return (
    !SPAM_DOMAINS.some((d) => low.includes(d)) &&
    !low.endsWith(".png") && !low.endsWith(".jpg") && !low.endsWith(".js") &&
    !low.endsWith(".css") && !low.endsWith(".svg") &&
    !low.includes("noreply") && !low.includes("no-reply") &&
    e.includes(".") && e.includes("@")
  );
}

// Scoring: prefer business emails (contact@, office@, info@) over generic
function scoreEmail(email: string, businessDomain: string | null): number {
  const low = email.toLowerCase();
  const local = low.split("@")[0];
  const domain = low.split("@")[1] ?? "";
  let score = 50;
  if (businessDomain && domain.includes(businessDomain)) score += 30;
  if (GENERIC_DOMAINS.includes(domain)) score -= 20;
  if (["contact", "office", "info", "rezervari", "comenzi"].some(p => local.startsWith(p))) score += 15;
  if (local.length < 4) score -= 10;
  return score;
}

async function scrapeEmails(pageUrl: string, businessDomain: string | null): Promise<string | null> {
  try {
    const res = await fetch(pageUrl, {
      signal: AbortSignal.timeout(6000),
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml",
        "Accept-Language": "ro-RO,ro;q=0.9",
      },
    });
    if (!res.ok) return null;
    const html = await res.text();

    // mailto: links first (most reliable)
    const mailtoRe = /mailto:([a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,})/gi;
    const mailtoMatches = [...html.matchAll(mailtoRe)].map((m) => m[1]).filter(cleanEmail);

    // Generic body matches
    const bodyMatches = (html.match(EMAIL_RE) ?? []).filter(cleanEmail);

    const all = [...mailtoMatches, ...bodyMatches];
    if (all.length === 0) return null;

    // Pick highest-scoring email
    const sorted = all.sort((a, b) => scoreEmail(b, businessDomain) - scoreEmail(a, businessDomain));
    return sorted[0];
  } catch {
    return null;
  }
}

function extractDomain(url: string): string | null {
  try {
    return new URL(url.startsWith("http") ? url : `https://${url}`)
      .hostname.replace(/^www\./, "");
  } catch { return null; }
}

async function findEmailFromWebsite(url: string): Promise<{ email: string | null; source: string }> {
  if (!url) return { email: null, source: "" };
  const base = url.startsWith("http") ? url : `https://${url}`;
  const domain = extractDomain(url);

  // 1. Scrape homepage
  let email = await scrapeEmails(base, domain);
  if (email) return { email, source: "website-homepage" };

  // 2. Scrape contact pages
  for (const path of ["/contact", "/contacte", "/contact-us", "/despre-noi", "/despre", "/about"]) {
    try {
      email = await scrapeEmails(new URL(path, base).href, domain);
      if (email) return { email, source: `website-${path.slice(1)}` };
    } catch {}
  }

  // 3. Pattern guess (only if domain known)
  if (domain) {
    return { email: `contact@${domain}`, source: "pattern-guess" };
  }

  return { email: null, source: "" };
}

// ═══════════════════════════════════════════════════════════════════════════
// MESSAGE TEMPLATES — editorial, curiosity-driven, NO "Da sau nu"
// Structure: hook question → specific concrete problem → solution + proof → soft CTA
// ═══════════════════════════════════════════════════════════════════════════

type MessageTemplate = { subject: string; body: string };
type IndustryTemplates = MessageTemplate[];

// Helper tokens available in templates:
// {name} = business name
// {city} = city
// {category} = category slug
// {rating} = rating with star, e.g. "4.6★" or "" if no rating
// {socialProof} = e.g. "Lucrăm cu 47 de afaceri din România" — softer than "47 clients"

const TEMPLATES_WITH_SITE: Record<string, IndustryTemplates> = {
  restaurant: [
    {
      subject: "Câte rezervări pierdeți după ora 22?",
      body: `Bună ziua,

Întrebare directă pentru {name}: câte rezervări se pierd când telefonul sună în gol seara târziu sau în weekend?

Există un agent vocal AI care răspunde la fiecare apel, face rezervarea, trimite confirmare pe WhatsApp — non-stop, fără angajat în plus. Lucrăm cu peste 40 de restaurante în România.

Dacă vă interesează cum arată în acțiune, vă trimit un exemplu audio de 30 de secunde.

ReplacedByAI | replacedbyai.ro`,
    },
    {
      subject: "Un detaliu observat la {name}",
      body: `Bună ziua,

Am observat că {name} are {rating} pe Google — semn că oamenii vă apreciază.

Întrebarea: dintre cei care vă caută la 22:30 vineri seara, câți primesc răspuns? Un agent vocal AI preia fiecare apel, propune o oră liberă din rezervări și confirmă automat — pentru o fracțiune din costul unui operator.

Dacă sună interesant, vă răspund cu un demo concret.

ReplacedByAI | replacedbyai.ro`,
    },
    {
      subject: "Pentru un restaurant în {city}",
      body: `Bună ziua,

În 2026, un restaurant nu mai poate permite să piardă apeluri. Fiecare apel nepreluat = masă goală în seara aia.

Pentru {name}, un agent vocal AI preia toate apelurile, gestionează rezervări, trimite confirmări — 24/7, zero pauze, zero greșeli.

Vă trimit un exemplu audio dacă vă interesează.

ReplacedByAI | replacedbyai.ro`,
    },
  ],

  cafenea: [
    {
      subject: "{name} apare când cineva caută cafenea în {city}?",
      body: `Bună ziua,

Când un turist sau localnic caută "cafenea {city}" pe Google — apare {name} în primele rezultate?

Dacă nu, există clienți care caută exact ce oferiți, dar ajung la altcineva. Un chatbot pe WhatsApp pentru meniu + program și câteva optimizări simple schimbă asta în 5-7 zile.

Vă trimit detalii dacă vă interesează.

ReplacedByAI | replacedbyai.ro`,
    },
    {
      subject: "O întrebare scurtă",
      body: `Bună ziua,

{name} are {rating} pe Google — clienții vă apreciază. Întrebarea e dacă cei care nu au fost încă vă găsesc ușor.

Un agent AI pe WhatsApp răspunde automat la întrebări despre program, meniu, evenimente — și nu lasă niciun mesaj fără răspuns, fie 8 dimineața sau 11 seara.

Dacă sună util, vă răspund cu un exemplu.

ReplacedByAI | replacedbyai.ro`,
    },
  ],

  hotel: [
    {
      subject: "Câte rezervări merg pe Booking în loc să vină direct?",
      body: `Bună ziua,

Întrebare incomodă pentru {name}: ce procent din rezervări vin direct, față de Booking sau Airbnb?

Fiecare rezervare prin Booking = 15-20% comision. Un agent vocal AI care preia apeluri directe 24/7 + un sistem online recuperează diferența în 2-3 luni. Lucrăm cu pensiuni mici și boutique hotels din toată țara.

Vă trimit calculul concret dacă vă interesează.

ReplacedByAI | replacedbyai.ro`,
    },
    {
      subject: "Pentru {name} — o idee de gândit",
      body: `Bună ziua,

{name} are {rating} pe Google. Pacienții potențiali fideli — există. Problema e cum ajung la voi fără să plătiți comision la Booking.

Un agent vocal AI preia toate apelurile directe, propune camere disponibile, confirmă pe WhatsApp — fără intermediar. Aceeași rezervare, fără 20% comision.

Dacă vă interesează cum arată, vă răspund cu detalii.

ReplacedByAI | replacedbyai.ro`,
    },
  ],

  clinica: [
    {
      subject: "Cât timp pierde recepția cu programări telefonice?",
      body: `Bună ziua,

Întrebare pentru {name}: câte ore pe zi pierde recepția cu programări, confirmări, anulări și aceleași 5 întrebări care se repetă?

Un agent vocal AI preia tot — programează automat, trimite reminder pe WhatsApp cu 24h înainte, reduce no-show-urile cu peste 60%. Personalul rămâne liber pentru pacienții din clinică.

Vă trimit un exemplu dacă vă interesează.

ReplacedByAI | replacedbyai.ro`,
    },
    {
      subject: "O propunere concretă pentru {name}",
      body: `Bună ziua,

{name} are {rating} pe Google — pacienții vă apreciază. Întrebarea e cât timp pierdeți pe partea administrativă care nu vă aduce nimic în plus.

Un agent vocal AI face programări 24/7, trimite confirmări automate, ține o agendă curată. Lucrăm cu peste 30 de clinici în România.

Dacă sună interesant, vă trimit un demo concret.

ReplacedByAI | replacedbyai.ro`,
    },
  ],

  stomatolog: [
    {
      subject: "Câți pacienți nu revin pentru control?",
      body: `Bună ziua,

Întrebare pentru {name}: câți pacienți nu revin la control sau tratament continuu pentru că pur și simplu uitați să-i contactați la momentul potrivit?

Un sistem automat trimite reminder pe WhatsApp la 6 luni, propune o oră liberă, reprogramează cu un click. Zero efort din partea echipei, recurența pacienților crește semnificativ.

Vă trimit cum arată dacă vă interesează.

ReplacedByAI | replacedbyai.ro`,
    },
    {
      subject: "Pentru un cabinet cu {rating}",
      body: `Bună ziua,

{name} are {rating} pe Google — pacienții vă cunosc bine. Întrebarea e câți noi pacienți ajung la voi în loc de altcineva.

Un agent vocal AI preia apelurile când recepția e ocupată sau închisă, programează direct, trimite confirmare. Plus reminder automat pe WhatsApp. Lucrăm cu mai multe cabinete stomatologice în țară.

Dacă vă interesează cum funcționează, vă răspund cu un demo.

ReplacedByAI | replacedbyai.ro`,
    },
  ],

  salon: [
    {
      subject: "Câte no-show-uri are {name} pe săptămână?",
      body: `Bună ziua,

Întrebare rapidă: câte programări pierde {name} săptămânal pentru că clientul uită și nu anunță?

Un sistem automat trimite reminder pe WhatsApp cu 24h înainte și cere confirmare. Reduce no-show-urile cu peste 60% — testat la peste 50 de saloane din România.

Vă trimit cum arată dacă vă interesează.

ReplacedByAI | replacedbyai.ro`,
    },
    {
      subject: "Un salon cu {rating} merită mai mult vizibilitate",
      body: `Bună ziua,

{name} are {rating} pe Google — clienții actuali vă recomandă. Întrebarea e cum câștigați clienți noi fără reclame plătite.

Un site simplu cu portofoliu + programări online + chatbot care răspunde automat la întrebări frecvente aduce 5-10 clienți noi pe lună, constant.

Dacă vă interesează cum, vă trimit detalii.

ReplacedByAI | replacedbyai.ro`,
    },
  ],

  farmacie: [
    {
      subject: "Câte apeluri primește {name} zilnic cu aceleași întrebări?",
      body: `Bună ziua,

Câte apeluri pe zi primește {name} cu aceleași 3 întrebări: "aveți programul X?", "aveți medicamentul Y în stoc?", "unde sunteți?"

Un chatbot pe WhatsApp răspunde automat la toate astea, non-stop. Personalul rămâne liber pentru clienții din farmacie. Setup în 2 zile.

Vă trimit cum funcționează dacă vă interesează.

ReplacedByAI | replacedbyai.ro`,
    },
  ],

  contabil: [
    {
      subject: "Clienții {name} sună des despre termene?",
      body: `Bună ziua,

Întrebare pentru {name}: câți clienți sună în ultimele zile înainte de termen pentru că au uitat data?

Un sistem automat trimite reminder cu 7 zile înainte, cu lista exactă a documentelor de pregătit. Mai puține apeluri panicate, mai puțin timp pierdut pe explicații repetitive.

Vă trimit cum arată dacă vă interesează.

ReplacedByAI | replacedbyai.ro`,
    },
  ],

  avocat: [
    {
      subject: "Câți potențiali clienți pleacă fără să vă contacteze?",
      body: `Bună ziua,

Întrebare directă pentru {name}: din cei care ajung pe site-ul firmei și au o întrebare la 21:00, câți așteaptă până dimineața să sune?

Răspunsul: foarte puțini. Un chatbot care califică automat cazul (urgență, domeniu, buget) și programează consultație online schimbă conversia drastic.

Vă trimit exemple concrete dacă vă interesează.

ReplacedByAI | replacedbyai.ro`,
    },
  ],

  auto: [
    {
      subject: "Clienții {name} știu când aveți locuri libere?",
      body: `Bună ziua,

Când un client vrea să aducă mașina la {name}, cât de ușor află când sunteți disponibili — fără să sune și să aștepte răspuns?

Un sistem de programări online cu confirmare automată elimină 80% din apelurile care țin la rând și umple locurile libere automat.

Vă trimit cum funcționează dacă vă interesează.

ReplacedByAI | replacedbyai.ro`,
    },
  ],

  imobiliare: [
    {
      subject: "Câți contactează {name} fără să fie pregătiți să cumpere?",
      body: `Bună ziua,

Întrebare pentru {name}: ce procent din oamenii care vă contactează sunt clienți reali, față de cei care "se informează" și vă ocupă timpul?

Un chatbot califică automat — buget, urgență, tip proprietate — și trimite la agent doar pe cei care merită timp. Restul primesc răspuns automat și un follow-up peste 3-6 luni.

Vă trimit cum funcționează dacă vă interesează.

ReplacedByAI | replacedbyai.ro`,
    },
  ],

  default: [
    {
      subject: "Câte ore pierde echipa {name} cu sarcini repetitive?",
      body: `Bună ziua,

Întrebare directă: cât timp pierde echipa {name} zilnic cu sarcini repetitive — programări, confirmări, răspunsuri la aceleași 5 întrebări?

Există agenți AI care preiau exact astea — nu înlocuiesc oamenii, doar îi eliberează de munca repetitivă. Lucrăm cu peste 40 de afaceri în România.

Vă răspund cu un exemplu concret dacă vă interesează.

ReplacedByAI | replacedbyai.ro`,
    },
    {
      subject: "Un punct de plecare pentru {name}",
      body: `Bună ziua,

{name} are {rating} pe Google. Asta înseamnă clienți care vă apreciază — deci infrastructura merită modernizată ca să nu pierdeți timp cu birocrația repetitivă.

Un agent AI personalizat preia exact procesul care vă consumă cel mai mult timp — telefoane, mesaje, follow-up — non-stop, automat.

Vă trimit detalii dacă vă interesează.

ReplacedByAI | replacedbyai.ro`,
    },
  ],
};

const TEMPLATES_WITHOUT_SITE: Record<string, IndustryTemplates> = {
  restaurant: [
    {
      subject: "Clienții vă găsesc când caută restaurant în {city}?",
      body: `Bună ziua,

Test simplu: căutați "restaurant {city}" sau "unde mâncăm în {city}" pe Google. Apare {name}?

Fără un site, probabil nu. Pierdeți rezervări înainte să știți că existau. Construim site cu meniu, fotografii și rezervări online + agent WhatsApp pentru întrebări — livrat în 5-7 zile.

Vă trimit cum arată dacă vă interesează.

ReplacedByAI | replacedbyai.ro`,
    },
  ],

  cafenea: [
    {
      subject: "{name} fără prezență online — un cost ascuns",
      body: `Bună ziua,

Cei care caută "cafenea {city}" pe Google chiar acum — nu ajung la {name}, ci la concurența care are site.

Un site simplu cu meniu, program și locație + chatbot WhatsApp pentru întrebări = clienți noi constant. Îl facem în 5-7 zile.

Vă trimit cum arată dacă vă interesează.

ReplacedByAI | replacedbyai.ro`,
    },
  ],

  hotel: [
    {
      subject: "Toate rezervările {name} prin Booking?",
      body: `Bună ziua,

Fără site propriu, fiecare rezervare la {name} trece prin Booking sau Airbnb — cu comision de 15-20%.

Un site cu rezervări directe înseamnă aceiași clienți, fără comision. Îl construim în 5-7 zile, cu agent vocal care preia și apelurile telefonice. Recuperați investiția în prima lună.

Vă trimit calculul dacă vă interesează.

ReplacedByAI | replacedbyai.ro`,
    },
  ],

  clinica: [
    {
      subject: "Pacienții vă găsesc {name} înainte să sune?",
      body: `Bună ziua,

90% din oameni caută clinica pe Google înainte să sune. Fără site, {name} nu apare — pacienții potențiali ajung la altcineva.

Construim site cu servicii, medici, prețuri și programări online + agent vocal pentru telefon. Pacienți noi fără să sunați după ei. Livrat în 5-7 zile.

Vă trimit cum arată dacă vă interesează.

ReplacedByAI | replacedbyai.ro`,
    },
  ],

  stomatolog: [
    {
      subject: "Cineva are durere de dinți seara — vă găsește?",
      body: `Bună ziua,

Când cineva caută stomatolog în {city} la 21:00 cu durere de dinți — găsește {name}? Fără site, răspunsul e nu.

Construim site profesional cu prețuri, programări online + sistem de reminder automat pentru pacienții existenți. Pacienți noi din Google + recurență crescută.

Vă trimit cum funcționează dacă vă interesează.

ReplacedByAI | replacedbyai.ro`,
    },
  ],

  salon: [
    {
      subject: "Clienți noi pentru {name} din Google?",
      body: `Bună ziua,

Câți clienți noi vin la {name} din recomandări, față de câți v-ar putea găsi singuri online?

Un site cu portofoliu, prețuri și programări online aduce 5-10 clienți noi pe lună, constant — fără reclame plătite. Lucrăm cu peste 50 de saloane în România. Îl facem în 5-7 zile.

Vă trimit cum arată dacă vă interesează.

ReplacedByAI | replacedbyai.ro`,
    },
  ],

  farmacie: [
    {
      subject: "Clienții vă găsesc programul și stocul {name}?",
      body: `Bună ziua,

Câți oameni sună la {name} să întrebe programul sau dacă aveți un produs?

Un site simplu cu informații + chatbot care răspunde automat 24/7 elimină aceste apeluri și aduce clienți noi din căutările online. Livrat în 5-7 zile.

Vă trimit cum arată dacă vă interesează.

ReplacedByAI | replacedbyai.ro`,
    },
  ],

  default: [
    {
      subject: "{name} apare în căutările din {city}?",
      body: `Bună ziua,

Când potențiali clienți din {city} caută servicii ca ale dvs. online — ajung la {name}?

Fără prezență online, nu. Construim site complet + sistem automat de comunicare cu clienții (WhatsApp/email), livrat în 5-7 zile. Recuperați investiția prin clienții care vă găsesc fără să-i căutați voi.

Vă trimit cum arată dacă vă interesează.

ReplacedByAI | replacedbyai.ro`,
    },
  ],
};

// ─── Template helpers ────────────────────────────────────────────────────

function formatRating(rating: number | null, reviewCount: number | null): string {
  if (!rating) return "un rating bun";
  const stars = "★".repeat(Math.round(rating));
  return `${rating.toFixed(1)} ${stars}${reviewCount ? ` (${reviewCount}+ recenzii)` : ""}`;
}

function fillTemplate(
  tpl: MessageTemplate,
  name: string,
  city: string,
  rating: number | null,
  reviewCount: number | null
): MessageTemplate {
  const ratingStr = formatRating(rating, reviewCount);
  const replace = (s: string) => s
    .replace(/{name}/g, name)
    .replace(/{city}/g, city)
    .replace(/{rating}/g, ratingStr);
  return {
    subject: replace(tpl.subject),
    body: replace(tpl.body),
  };
}

// Rotate variants based on stable hash of business name — every lead gets a consistent variant
function pickVariant(name: string, variants: IndustryTemplates, offset = 0): MessageTemplate {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = ((hash << 5) - hash) + name.charCodeAt(i);
    hash |= 0;
  }
  const idx = Math.abs(hash + offset) % variants.length;
  return variants[idx];
}

function generateTemplateMessage(
  businessName: string,
  category: string,
  city: string,
  rating: number | null,
  reviewCount: number | null,
  hasWebsite: boolean,
  variantOffset = 0
): MessageTemplate {
  const map = hasWebsite ? TEMPLATES_WITH_SITE : TEMPLATES_WITHOUT_SITE;
  const variants = map[category] ?? map.default ?? TEMPLATES_WITH_SITE.default;
  const tpl = pickVariant(businessName, variants, variantOffset);
  return fillTemplate(tpl, businessName, city, rating, reviewCount);
}

// ─── COMBO TEMPLATES — ambele servicii: site web + agent AI ─────────────────

const TEMPLATES_COMBO: Record<string, IndustryTemplates> = {
  restaurant: [
    {
      subject: "Site + rezervări automate pentru {name}",
      body: `Bună ziua,

Lucrez cu restaurante din {city} pe două probleme concrete:

→ Clienții nu vă găsesc online (fără site sau site slab) — pierdeți rezervări înainte să știți că existau
→ Telefonul sună în gol seara sau în weekend — pierdeți mese

Rezolvăm amândouă: construim site cu rezervări online + instalăm agent vocal AI care preia apelurile 24/7, livrat în 5-7 zile.

Scrieți-mi dacă vă interesează.

ReplacedByAI | replacedbyai.ro`,
    },
  ],
  clinica: [
    {
      subject: "Prezență online + programări automate pentru {name}",
      body: `Bună ziua,

Două lucruri pe care le facem pentru clinici din {city}:

→ Site profesional cu servicii, medici, prețuri și programări online — pacienți noi din Google fără să sunați după ei
→ Agent vocal AI care preia apeluri, face programări și trimite reminder-uri — fără să ocupe recepția

Livrat complet în 5-7 zile.

Scrieți-mi dacă vă interesează.

ReplacedByAI | replacedbyai.ro`,
    },
  ],
  stomatolog: [
    {
      subject: "Site + programări automate pentru {name}",
      body: `Bună ziua,

Pentru cabinete stomatologice din {city} facem două lucruri:

→ Site cu servicii, prețuri și programări online — pacienți noi care vă găsesc singuri pe Google
→ Sistem automat de reminder pe WhatsApp — pacienții revin pentru control fără să-i sunați

Livrat în 5-7 zile.

Scrieți-mi dacă vă interesează.

ReplacedByAI | replacedbyai.ro`,
    },
  ],
  salon: [
    {
      subject: "Site + programări automate pentru {name}",
      body: `Bună ziua,

Două lucruri pe care le facem pentru saloane din {city}:

→ Site cu portofoliu și programări online — clienți noi din Google, fără reclame plătite
→ Bot WhatsApp care confirmă programările automat și trimite reminder — zero no-show-uri

Livrat în 5-7 zile.

Scrieți-mi dacă vă interesează.

ReplacedByAI | replacedbyai.ro`,
    },
  ],
  hotel: [
    {
      subject: "Rezervări directe + agent vocal pentru {name}",
      body: `Bună ziua,

Două lucruri concrete pentru {name}:

→ Site cu rezervări directe — clienții nu mai trec prin Booking (15-20% comision economisit per rezervare)
→ Agent vocal AI care preia apeluri și face rezervări 24/7, inclusiv noaptea

Livrat în 5-7 zile. Se recuperează din prima lună.

Scrieți-mi dacă vă interesează.

ReplacedByAI | replacedbyai.ro`,
    },
  ],
  auto: [
    {
      subject: "Site + programări online pentru {name}",
      body: `Bună ziua,

Două lucruri pentru service-uri auto din {city}:

→ Site cu servicii, prețuri și programări online — clienții știu când aveți locuri libere fără să sune
→ Confirmare automată pe WhatsApp — zero apeluri inutile, zero no-show-uri

Livrat în 5-7 zile.

Scrieți-mi dacă vă interesează.

ReplacedByAI | replacedbyai.ro`,
    },
  ],
  default: [
    {
      subject: "Două soluții pentru {name}",
      body: `Bună ziua,

Facem două lucruri pentru afaceri din {city}:

→ Site web modern cu toate informațiile și programări/rezervări online — clienți noi din Google
→ Agent AI care răspunde la apeluri și mesaje automat, non-stop — fără angajat suplimentar

Livrat în 5-7 zile, funcționând din prima zi.

Scrieți-mi dacă vă interesează.

ReplacedByAI | replacedbyai.ro`,
    },
  ],
};

function generateComboMessage(
  businessName: string,
  category: string,
  city: string,
  rating: number | null,
  reviewCount: number | null
): MessageTemplate {
  const variants = TEMPLATES_COMBO[category] ?? TEMPLATES_COMBO.default;
  const tpl = pickVariant(businessName, variants, 0);
  return fillTemplate(tpl, businessName, city, rating, reviewCount);
}

// ═══════════════════════════════════════════════════════════════════════════
// CLAUDE AI GENERATION — more sophisticated, multi-variant, editorial tone
// ═══════════════════════════════════════════════════════════════════════════

async function generateWithClaude(
  lead: {
    businessName: string;
    category: string;
    city: string;
    website: string | null;
    rating: number | null;
    reviewCount: number | null;
  },
  apiKey: string,
  multiVariant = false
): Promise<MessageTemplate[]> {
  const hasWebsite = !!lead.website;
  const ratingNote = lead.rating
    ? `Rating Google: ${lead.rating.toFixed(1)} stele${lead.reviewCount ? ` cu ${lead.reviewCount}+ recenzii` : ""}`
    : "";

  const baseContext = `FIRMĂ ȚINTĂ:
- Nume: ${lead.businessName}
- Tip: ${lead.category}
- Oraș: ${lead.city}
${ratingNote ? `- ${ratingNote}` : ""}
- Are site web: ${hasWebsite ? "DA" : "NU"}

NOI: ReplacedByAI — echipă din Iași care construiește agenți AI și site-uri pentru afaceri locale din România. Avem peste 40 de clienți activi.

CE OFERIM:
${hasWebsite
  ? "- Agent vocal AI care preia apelurile non-stop, face programări, trimite confirmări\n- Chatbot WhatsApp pentru întrebări frecvente\n- Integrare cu sistemele existente"
  : "- Site web profesional cu programări online (livrare 5-7 zile)\n- Agent vocal AI + chatbot WhatsApp inclus\n- Recuperare investiție în 1-2 luni"
}`;

  const styleGuide = `STIL DE SCRIERE (FOARTE IMPORTANT — respectă cu strictețe):

1. Hook = ÎNTREBARE DIRECTĂ SPECIFICĂ. Nu generic.
   - BUN: "Câte rezervări pierdeți după ora 22?"
   - RĂU: "Cum vă merge afacerea?"

2. Corpul = 2-3 propoziții care:
   - Numesc problema concretă, cu cifre dacă se poate
   - Prezintă soluția în 1 frază (nu listă de feature-uri)
   - Adaugă social proof dacă natural ("Lucrăm cu peste 40 de...")

3. CTA = SOFT, niciodată "Da sau nu".
   - BUN: "Vă trimit un exemplu dacă vă interesează."
   - BUN: "Dacă sună interesant, vă răspund cu detalii."
   - RĂU: "Vreți? Da sau nu."
   - RĂU: "Aștept un răspuns!"

4. Semnătură: "ReplacedByAI | replacedbyai.ro" pe ultimă linie.

5. Ton: editorial, intelligent, ușor provocator. CA NU CA un email de vânzări agresiv.

6. INTERZIS:
   - "Sper că..." / "Îmi permit să..." / "Vă contactez pentru..."
   - "Aștept un răspuns!" / "Sun săptămâna viitoare"
   - Emoji
   - Cifre inventate
   - Promisiuni vagi ("revoluționează", "transformă")

7. Lungime corp: 60-90 cuvinte. Niciun cuvânt în plus.

8. Folosește numele firmei cel puțin 1-2 dată — face mesajul personal.`;

  const prompt = multiVariant
    ? `${baseContext}

${styleGuide}

GENEREAZĂ 3 VARIANTE DIFERITE de email, cu unghiuri diferite:
- Varianta 1: HOOK CURIOSITY (întrebare despre problemă specifică)
- Varianta 2: SOCIAL PROOF (menționează că lucrăm deja cu mulți clienți similari)
- Varianta 3: PERSONAL (folosește ratingul ${ratingNote ? "menționat" : "în mod elegant fără cifre"} ca punct de plecare)

Răspunde DOAR cu JSON valid (fără markdown, fără text înainte/după):
{
  "variants": [
    {"subject": "...", "body": "..."},
    {"subject": "...", "body": "..."},
    {"subject": "...", "body": "..."}
  ]
}`
    : `${baseContext}

${styleGuide}

GENEREAZĂ UN EMAIL personalizat pentru această firmă. Folosește unghiul cel mai relevant pentru tipul lor de business.

Răspunde DOAR cu JSON valid (fără markdown, fără text înainte/după):
{"subject": "...", "body": "..."}`;

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
      "content-type": "application/json",
    },
    body: JSON.stringify({
      model: "claude-haiku-4-5-20251001",
      max_tokens: multiVariant ? 1200 : 500,
      messages: [{ role: "user", content: prompt }],
    }),
    signal: AbortSignal.timeout(20000),
  });

  if (!res.ok) {
    const err = await res.text().catch(() => "");
    throw new Error(`Claude API ${res.status}: ${err.slice(0, 200)}`);
  }

  const data = await res.json();
  const text = (data.content?.[0]?.text ?? "").trim();

  // Strip potential markdown code fences
  const jsonText = text.replace(/^```json\s*|\s*```$/g, "").trim();

  const parsed = JSON.parse(jsonText);
  if (multiVariant) {
    if (!Array.isArray(parsed.variants)) throw new Error("Invalid variants response");
    return parsed.variants;
  }
  return [{ subject: parsed.subject, body: parsed.body }];
}

// Salut în funcție de ora României — evită „Bună ziua" generat/trimis seara.
function greetingRo(): string {
  const h = Number(
    new Intl.DateTimeFormat("ro-RO", { hour: "numeric", hour12: false, timeZone: "Europe/Bucharest" }).format(new Date())
  );
  if (h < 11) return "Bună dimineața";
  if (h >= 18) return "Bună seara";
  return "Bună ziua";
}

function applyGreeting(t: MessageTemplate): MessageTemplate {
  return { subject: t.subject, body: t.body.replace(/^Bună (ziua|dimineața|seara)/, greetingRo()) };
}

// ═══════════════════════════════════════════════════════════════════════════
// ROUTE HANDLER
// ═══════════════════════════════════════════════════════════════════════════

export async function POST(req: NextRequest) {
  const session = await getAdminSession();
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { leadId, useClaude = false, variants = false, mode = "auto" } = await req.json();
  // mode: "auto" = decide based on website, "site" = force site pitch, "ai" = force AI pitch, "combo" = both services

  const lead = await prisma.outreachLead.findUnique({ where: { id: leadId } });
  if (!lead) return NextResponse.json({ error: "Lead negăsit" }, { status: 404 });

  // Step 1: discover email if missing
  let email = lead.email;
  let emailSource = lead.emailSource;
  if (!email && lead.website) {
    const found = await findEmailFromWebsite(lead.website);
    email = found.email;
    emailSource = found.source || null;
  }

  // Step 2: generate message(s)
  let chosen: MessageTemplate;
  let allVariants: MessageTemplate[] = [];
  const anthropicKey = process.env.ANTHROPIC_API_KEY;

  if (useClaude && anthropicKey) {
    try {
      const claudeVariants = await generateWithClaude(
        {
          businessName: lead.businessName,
          category: lead.category,
          city: lead.city,
          website: lead.website,
          rating: lead.rating,
          reviewCount: lead.reviewCount,
        },
        anthropicKey,
        variants
      );
      allVariants = claudeVariants;
      chosen = claudeVariants[0];
    } catch (err) {
      // Fallback to template silently — log to response
      const tmpl = generateTemplateMessage(
        lead.businessName, lead.category, lead.city,
        lead.rating, lead.reviewCount, !!lead.website
      );
      chosen = tmpl;
      allVariants = [tmpl];
    }
  } else {
    // Template mode
    if (mode === "combo") {
      // Pitch ambele servicii: site + agent AI
      const v = generateComboMessage(lead.businessName, lead.category, lead.city, lead.rating, lead.reviewCount);
      chosen = v;
      allVariants = [v];
    } else {
      const hasWebsite = mode === "ai" ? true : mode === "site" ? false : !!lead.website;
      const v1 = generateTemplateMessage(lead.businessName, lead.category, lead.city, lead.rating, lead.reviewCount, hasWebsite, 0);
      if (variants) {
        const v2 = generateTemplateMessage(lead.businessName, lead.category, lead.city, lead.rating, lead.reviewCount, hasWebsite, 1);
        const v3 = generateTemplateMessage(lead.businessName, lead.category, lead.city, lead.rating, lead.reviewCount, hasWebsite, 2);
        allVariants = [v1, v2, v3];
      } else {
        allVariants = [v1];
      }
      chosen = v1;
    }
  }

  // Salut corect în funcție de oră (Bună dimineața / ziua / seara)
  chosen = applyGreeting(chosen);
  allVariants = allVariants.map(applyGreeting);

  await prisma.outreachLead.update({
    where: { id: leadId },
    data: {
      email: email ?? undefined,
      emailSource: emailSource ?? undefined,
      messageSubject: chosen.subject,
      messageBody: chosen.body,
      status: "ready",
    },
  });

  return NextResponse.json({
    ok: true,
    email,
    hasEmail: !!email,
    chosen,
    variants: allVariants,
  });
}
