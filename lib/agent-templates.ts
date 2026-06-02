// Sistema de template-uri per agent — generează prompt + pași de setup din datele de intake

export type IntakeSnap = {
  businessName: string;
  toneOfVoice?: string | null;
  workingHours?: string | null;
  mainPhone?: string | null;
  contactEmail?: string | null;
  services?: string | null;
  notOffered?: string | null;
  faqText?: string | null;
  calendarSystem?: string | null;
  crmSystem?: string | null;
  locations?: string | null;
  brandColors?: string | null;
  website?: string | null;
  hasGoogleWorkspace?: boolean;
  hasMetaBusiness?: boolean;
  hasPosErp?: boolean;
  hasStripe?: boolean;
  whatsappActive?: boolean;
  address?: string | null;
  testerName?: string | null;
  testerPhone?: string | null;
  testerEmail?: string | null;
};

export type SetupStep = {
  phase: "integrare" | "configurare" | "testare" | "go-live";
  title: string;
  instruction: string;
  copyValue?: string;
};

export type AgentConfig = {
  prompt: string;
  setupSteps: SetupStep[];
  missingData: string[];
  integrations: string[];
};

function val(v: string | null | undefined, fallback = "[necompletat]"): string {
  return v?.trim() || fallback;
}

function toneLabel(t: string | null | undefined): string {
  const map: Record<string, string> = {
    formal: "formal și profesional — folosești formule de politețe, nu glumești",
    friendly: "prietenos și cald — ești ca un coleg de încredere",
    casual: "casual și relaxat — vorbești natural, ca între prieteni",
    energetic: "energic și motivant — ești entuziast și proactiv",
    professional: "profesional și echilibrat — clar, concis, eficient",
  };
  return t ? (map[t] || t) : "profesional și prietenos";
}

// ─── VOICEBOT ─────────────────────────────────────────────────────────────────
function voicebot(i: IntakeSnap): AgentConfig {
  const missing: string[] = [];
  if (!i.workingHours) missing.push("Program de lucru (workingHours)");
  if (!i.mainPhone) missing.push("Telefon principal");
  if (!i.services) missing.push("Lista servicii");
  if (!i.faqText) missing.push("FAQ-uri");

  const prompt = `# System Prompt — VoiceBot ${i.businessName}

## Identitate
Ești asistentul vocal AI al companiei **${i.businessName}**. Preiei apeluri în locul echipei, răspunzi la întrebări și programezi întâlniri.

## Ton și stil
Ton: ${toneLabel(i.toneOfVoice)}
Vorbești în română. Ești concis — răspunsurile tale durează maxim 20-30 secunde.

## Program de lucru
${val(i.workingHours, "[adaugă programul: Luni-Vineri 09:00-18:00]")}

Dacă suni în afara programului: "Momentan suntem închiși. Programul nostru este [program]. Pot să îți iau datele și te sunăm mâine?"

## Locație / Adresă
${val(i.locations || i.address, "[adaugă adresa sau locațiile]")}

## Servicii oferite
${val(i.services, "[adaugă lista de servicii]")}

## Ce NU oferim
${val(i.notOffered, "[adaugă ce nu oferiți]")}

## FAQ-uri frecvente
${val(i.faqText, "[adaugă întrebările frecvente și răspunsurile]")}

## Flow apel
1. Salutare: "Bună ziua, ați sunat la ${i.businessName}, cu ce vă pot ajuta?"
2. Ascultă și identifică nevoia
3. Răspunde din FAQ sau servicii
4. Dacă clientul vrea detalii → oferă să programezi o discuție cu echipa
5. Dacă nu poți răspunde → "Vă notez datele și vă sunăm noi înapoi."
6. La final: confirmă datele de contact

## Contact echipă (transfer)
Telefon: ${val(i.mainPhone)}
Email: ${val(i.contactEmail)}`;

  const setupSteps: SetupStep[] = [
    {
      phase: "integrare",
      title: "Provizionează număr de telefon în VAPI",
      instruction: "Intră în VAPI Dashboard → Phone Numbers → Buy Number → alege număr românesc (+40). Sau conectează numărul existent al clientului prin SIP trunk.",
    },
    {
      phase: "integrare",
      title: "Conectează numărul la asistentul VAPI",
      instruction: "În VAPI → Assistants → New Assistant → paste prompt-ul generat mai sus → selectează vocea (ElevenLabs) → asociează numărul de telefon.",
      copyValue: prompt,
    },
    {
      phase: "configurare",
      title: "Setează vocea ElevenLabs",
      instruction: `Alege o voce potrivită tonului "${val(i.toneOfVoice, "profesional")}". Recomandare: Rachel (formal), Aria (friendly), Adam (energetic). Testează cu 2-3 fraze din prompt.`,
    },
    {
      phase: "configurare",
      title: "Configurează end-of-call webhook",
      instruction: "VAPI → Assistant → End Call Webhook → adaugă URL-ul tău n8n/Make pentru logging apeluri și trimitere email sumar.",
    },
    {
      phase: "testare",
      title: "Test apel intern",
      instruction: `Sună numărul și testează: salutare, întrebare servicii, FAQ, programare, afara program. Tester: ${val(i.testerName)} · ${val(i.testerPhone)}`,
    },
    {
      phase: "testare",
      title: "Test apel cu clientul",
      instruction: `Programează un apel de test cu ${val(i.testerName || i.businessName)}. Durata: 15 minute. Testează scenariile reale din business-ul lor.`,
    },
    {
      phase: "go-live",
      title: "Redirecționează numărul real al clientului",
      instruction: `Clientul redirecționează ${val(i.mainPhone)} spre numărul VAPI. Instrucțiuni de redirect depind de operatorul lor de telefonie.`,
    },
  ];

  return {
    prompt,
    setupSteps,
    missingData: missing,
    integrations: ["VAPI", "ElevenLabs", i.hasGoogleWorkspace ? "Google Calendar" : null].filter(Boolean) as string[],
  };
}

// ─── SCHEDULERBOT ─────────────────────────────────────────────────────────────
function schedulerbot(i: IntakeSnap): AgentConfig {
  const missing: string[] = [];
  if (!i.calendarSystem) missing.push("Sistem calendar (Google Calendar / Calendly / etc.)");
  if (!i.services) missing.push("Lista servicii cu durate");
  if (!i.workingHours) missing.push("Program disponibilitate");

  const prompt = `# System Prompt — SchedulerBot ${i.businessName}

## Identitate
Ești agentul de programări AI al **${i.businessName}**. Gestionezi programările, confirmările și reamintirile.

## Ton
${toneLabel(i.toneOfVoice)}

## Sistem calendar
${val(i.calendarSystem, "[adaugă: Google Calendar / Calendly / alt sistem]")}

## Program disponibil
${val(i.workingHours, "[adaugă programul de lucru]")}

## Servicii și durate
${val(i.services, "[adaugă: Serviciu — Durată — Preț]")}

## Flow programare
1. Salutare și identificare nevoie
2. Prezintă disponibilitatea (slot-uri libere)
3. Confirmă detaliile: serviciu, dată, oră, nume, telefon
4. Trimite confirmare automată pe email/SMS
5. Reamintire automată cu 24h înainte

## Politică anulare / reprogramare
Anulările se acceptă cu minim 2 ore înainte. Reprogramările sunt gratuite.

## Contact
Telefon: ${val(i.mainPhone)}
Email: ${val(i.contactEmail)}`;

  const setupSteps: SetupStep[] = [
    {
      phase: "integrare",
      title: "Conectează Google Calendar / Calendly",
      instruction: `Calendar ales: ${val(i.calendarSystem, "nespecificat")}. ${i.hasGoogleWorkspace ? "Client are Google Workspace — folosește Service Account OAuth." : "Obține API credentials de la client."}`,
    },
    {
      phase: "integrare",
      title: "Configurează slot-urile disponibile",
      instruction: "Setează blocurile de disponibilitate în calendar. Asigură-te că are buffer time între programări (minim 15 min).",
    },
    {
      phase: "configurare",
      title: "Configurează confirmările automate",
      instruction: "Setează email de confirmare (via Resend) și SMS (via Twilio/VAPI). Template-urile se găsesc în lib/mail.ts.",
    },
    {
      phase: "configurare",
      title: "Setează reamintirile automate",
      instruction: "n8n: cron job zilnic la 08:00 → găsește programările din ziua următoare → trimite SMS/email reminder.",
    },
    {
      phase: "testare",
      title: "Test programare end-to-end",
      instruction: `Testează: selectare serviciu → alegere slot → confirmare → verificare în calendar. Tester: ${val(i.testerName)} · ${val(i.testerEmail)}`,
    },
    {
      phase: "go-live",
      title: "Activează pe site și WhatsApp",
      instruction: `${i.whatsappActive ? "Conectează la WhatsApp Business API. " : ""}Pune widget-ul de programări pe ${val(i.website, "site-ul clientului")}.`,
    },
  ];

  return {
    prompt,
    setupSteps,
    missingData: missing,
    integrations: [
      i.calendarSystem || "Google Calendar",
      "Resend (email confirmări)",
      i.whatsappActive ? "WhatsApp Business" : null,
    ].filter(Boolean) as string[],
  };
}

// ─── SALESBOT ─────────────────────────────────────────────────────────────────
function salesbot(i: IntakeSnap): AgentConfig {
  const missing: string[] = [];
  if (!i.services) missing.push("Lista servicii + prețuri");
  if (!i.faqText) missing.push("FAQ-uri / obiecții frecvente");

  const prompt = `# System Prompt — SalesBot ${i.businessName}

## Identitate
Ești agentul de vânzări AI al **${i.businessName}**. Califici lead-uri, prezinți ofertele și ghidezi potențialii clienți spre achiziție.

## Ton
${toneLabel(i.toneOfVoice)}

## Ofertă
${val(i.services, "[adaugă serviciile și prețurile]")}

## Ce NU vindem
${val(i.notOffered, "[adaugă limitele ofertei]")}

## Obiecții frecvente și răspunsuri
${val(i.faqText, "[adaugă obiecțiile comune: preț, timp, concurență]")}

## Flow calificare lead
1. Identifică nevoia principală
2. Întreabă: buget aproximativ, termen, decizia e a lor sau a unui superior?
3. Prezintă oferta potrivită
4. Gestionează obiecțiile
5. Call to action: programează o discuție sau trimite oferta

## Informații contact
Telefon: ${val(i.mainPhone)}
Email: ${val(i.contactEmail)}
${i.hasStripe ? "Plăți online: acceptăm card prin Stripe" : ""}`;

  const setupSteps: SetupStep[] = [
    {
      phase: "configurare",
      title: "Uploadează oferta și grilă de prețuri",
      instruction: "Adaugă serviciile și prețurile în promptul agentului. Verifică că prețurile sunt actuale.",
    },
    {
      phase: "configurare",
      title: "Mapează obiecțiile din intake → FAQ",
      instruction: `Ia fiecare obiecție din: "${val(i.faqText, "").slice(0, 100)}..." și adaugă răspuns persuasiv în prompt.`,
    },
    {
      phase: "integrare",
      title: i.crmSystem ? `Conectează ${i.crmSystem}` : "Configurează CRM / notificări leads",
      instruction: i.crmSystem
        ? `Client folosește ${i.crmSystem}. Configurează webhook-ul pentru a trimite lead-urile calificate automat.`
        : "Setează notificare email la fiecare lead calificat → contact@replacedbyai.ro + clientul.",
    },
    {
      phase: "testare",
      title: "Test scenarii de vânzare",
      instruction: "Testează: client interesat (conversie), client cu obiecție de preț, client neserios. Verifică dacă agentul escaladează corect.",
    },
    {
      phase: "go-live",
      title: "Activează pe site + WhatsApp",
      instruction: `Deploy chatbot pe ${val(i.website)}. ${i.whatsappActive ? "Conectează și pe WhatsApp Business." : ""}`,
    },
  ];

  return {
    prompt,
    setupSteps,
    missingData: missing,
    integrations: [
      i.crmSystem || "CRM (nespecificat)",
      i.hasStripe ? "Stripe" : null,
      i.whatsappActive ? "WhatsApp Business" : null,
      i.hasMetaBusiness ? "Meta Business" : null,
    ].filter(Boolean) as string[],
  };
}

// ─── SUPPORTBOT ──────────────────────────────────────────────────────────────
function supportbot(i: IntakeSnap): AgentConfig {
  const missing: string[] = [];
  if (!i.faqText) missing.push("FAQ-uri / knowledge base");
  if (!i.services) missing.push("Lista servicii");

  const prompt = `# System Prompt — SupportBot ${i.businessName}

## Identitate
Ești agentul de suport al **${i.businessName}**. Răspunzi la întrebări, rezolvi probleme și escaladezi cazurile complexe.

## Ton
${toneLabel(i.toneOfVoice)}

## Knowledge base — FAQ
${val(i.faqText, "[adaugă toate întrebările frecvente și răspunsurile]")}

## Servicii pe care le oferim
${val(i.services, "[adaugă serviciile]")}

## Ce NU gestionăm (escaladezi la echipă)
${val(i.notOffered, "[adaugă cazurile care necesită intervenție umană]")}
- Reclamații majore sau situații de criză
- Cereri de rambursare peste [limita]
- Probleme tehnice critice

## Cum escaladezi
"Înțeleg că aceasta este o situație mai complexă. Vă conectez imediat cu un specialist. Puteți fi contactat la [număr/email]?"
→ Trimite ticket echipei: ${val(i.contactEmail)}

## Canale active
${i.whatsappActive ? "✓ WhatsApp" : "— WhatsApp"}
Email: ${val(i.contactEmail)}
Telefon: ${val(i.mainPhone)}`;

  const setupSteps: SetupStep[] = [
    {
      phase: "configurare",
      title: "Construiește knowledge base din FAQ",
      instruction: `Ia textul din intake (secțiunea FAQ) și structurează-l în perechi Întrebare → Răspuns. Adaugă și politicile de retur/garanție.`,
      copyValue: i.faqText || undefined,
    },
    {
      phase: "integrare",
      title: i.whatsappActive ? "Conectează WhatsApp Business" : "Configurează email support",
      instruction: i.whatsappActive
        ? "Conectează numărul WhatsApp Business al clientului prin Meta Cloud API sau Twilio."
        : `Configurează email forwarding de la ${val(i.contactEmail)} → agentul AI.`,
    },
    {
      phase: "configurare",
      title: "Setează escalation flow",
      instruction: "Configurează: dacă agentul nu găsește răspuns → creează ticket în email / CRM → notifică echipa în maxim 30 minute.",
    },
    {
      phase: "testare",
      title: "Test scenarii suport",
      instruction: `Testează: întrebare simplă (trebuie răspuns instant), escaladare (trebuie trimis la echipă), reclamație (ton empatic). Tester: ${val(i.testerName)} · ${val(i.testerEmail)}`,
    },
    {
      phase: "go-live",
      title: "Activează pe toate canalele",
      instruction: `Deploy pe: ${[i.whatsappActive ? "WhatsApp" : null, "site", "email"].filter(Boolean).join(", ")}.`,
    },
  ];

  return {
    prompt,
    setupSteps,
    missingData: missing,
    integrations: [
      i.whatsappActive ? "WhatsApp Business API" : null,
      i.crmSystem || null,
      "Email (Resend)",
    ].filter(Boolean) as string[],
  };
}

// ─── GENERIC TEMPLATE ────────────────────────────────────────────────────────
function genericTemplate(agentSlug: string, agentName: string, agentRole: string, i: IntakeSnap): AgentConfig {
  const prompt = `# System Prompt — ${agentName} · ${i.businessName}

## Identitate
Ești ${agentRole} AI al companiei **${i.businessName}**.

## Ton
${toneLabel(i.toneOfVoice)}

## Context business
Servicii: ${val(i.services)}
Locație: ${val(i.locations || i.address)}
Website: ${val(i.website)}

## Contact echipă
Telefon: ${val(i.mainPhone)}
Email: ${val(i.contactEmail)}

## Note suplimentare
[Completează cu instrucțiuni specifice pentru ${agentName}]`;

  const setupSteps: SetupStep[] = [
    {
      phase: "configurare",
      title: "Personalizează prompt-ul",
      instruction: "Completează secțiunile marcate cu [paranteze] din prompt-ul generat mai sus.",
      copyValue: prompt,
    },
    {
      phase: "integrare",
      title: "Conectează integrările necesare",
      instruction: [
        i.hasGoogleWorkspace ? "✓ Google Workspace disponibil" : null,
        i.hasMetaBusiness ? "✓ Meta Business disponibil" : null,
        i.hasPosErp ? "✓ POS/ERP disponibil" : null,
        i.hasStripe ? "✓ Stripe disponibil" : null,
      ].filter(Boolean).join("\n") || "Verifică cu clientul ce integrări sunt necesare.",
    },
    {
      phase: "testare",
      title: "Test cu tester desemnat",
      instruction: `Tester: ${val(i.testerName)} · ${val(i.testerPhone || i.testerEmail)}`,
    },
    {
      phase: "go-live",
      title: "Activează agentul",
      instruction: "Actualizează statusul la 'live' după validarea finală cu clientul.",
    },
  ];

  return {
    prompt,
    setupSteps,
    missingData: [],
    integrations: [
      i.hasGoogleWorkspace ? "Google Workspace" : null,
      i.hasMetaBusiness ? "Meta Business" : null,
      i.hasPosErp ? "POS/ERP" : null,
      i.hasStripe ? "Stripe" : null,
    ].filter(Boolean) as string[],
  };
}

// ─── SOCIAL BOT ───────────────────────────────────────────────────────────────
function socialbot(i: IntakeSnap): AgentConfig {
  const missing: string[] = [];
  if (!i.hasMetaBusiness) missing.push("Acces Meta Business Manager");
  if (!i.toneOfVoice) missing.push("Ton de voce / brand guidelines");

  const prompt = `# System Prompt — SocialBot ${i.businessName}

## Identitate
Ești managerul de social media AI al **${i.businessName}**. Creezi conținut, răspunzi la comentarii și DM-uri, raportezi performanța.

## Ton brand
${toneLabel(i.toneOfVoice)}
Culori brand: ${val(i.brandColors, "[adaugă culorile brandului]")}
Website: ${val(i.website)}

## Servicii de promovat
${val(i.services, "[adaugă serviciile principale]")}

## Reguli conținut
- Nu posta prețuri exacte fără aprobare
- Folosește hashtag-uri relevante pentru industrie
- Răspunde la comentarii în maxim 2 ore în program
- Nicio postare fără aprobarea clientului (dacă e setat review flow)

## Tipuri de conținut
- Educational: sfaturi din industrie
- Behind the scenes: echipă, proces
- Testimoniale: clienți mulțumiți
- Promoțional: oferte, lansări`;

  const setupSteps: SetupStep[] = [
    {
      phase: "integrare",
      title: "Conectează Meta Business Manager",
      instruction: `${i.hasMetaBusiness ? "✓ Client are Meta Business. Cere acces de tip 'Advertiser' sau 'Content Creator' pe pagina de Facebook și Instagram al clientului." : "⚠ Client NU a confirmat Meta Business. Solicită accesul."}`,
    },
    {
      phase: "configurare",
      title: "Setează calendarul editorial",
      instruction: "Creează un calendar de postări: 3-5 postări/săptămână. Tipuri: 60% educativ, 30% promoțional, 10% personal/behind-scenes.",
    },
    {
      phase: "configurare",
      title: "Creează template-urile vizuale",
      instruction: `Folosind culorile: ${val(i.brandColors, "de la client")}, creează template-uri Canva pentru: postare square, story, carousel.`,
    },
    {
      phase: "testare",
      title: "Postare de test",
      instruction: "Creează și postează o postare de test pe pagina clientului. Verifică că tonul și vizualul sunt aprobate.",
    },
    {
      phase: "go-live",
      title: "Activează monitoring și auto-reply",
      instruction: "Configurează auto-reply pentru DM-uri și comentarii pe Facebook/Instagram.",
    },
  ];

  return {
    prompt,
    setupSteps,
    missingData: missing,
    integrations: ["Meta Business API", i.hasGoogleWorkspace ? "Google Workspace" : null].filter(Boolean) as string[],
  };
}

// ─── MAIN EXPORT ──────────────────────────────────────────────────────────────
const AGENT_LABELS: Record<string, { name: string; role: string }> = {
  contentbot: { name: "ContentBot", role: "editor și copywriter" },
  accountbot: { name: "AccountBot", role: "contabil" },
  financebot: { name: "FinanceBot", role: "analist financiar" },
  designbot: { name: "DesignBot", role: "designer grafic" },
  reviewbot: { name: "ReviewBot", role: "manager reputație online" },
  hrbot: { name: "HRBot", role: "recrutor" },
  inventorybot: { name: "InventoryBot", role: "manager stoc" },
  leadbot: { name: "LeadBot", role: "generator lead-uri" },
  trainingbot: { name: "TrainingBot", role: "trainer intern" },
  advisorbot: { name: "AdvisorBot", role: "strateg business" },
};

export function generateAgentConfig(
  agentSlug: string,
  intake: IntakeSnap | null,
  businessName: string
): AgentConfig {
  if (!intake) {
    return {
      prompt: `// Intake necompletat.\n// Clientul trebuie să finalizeze formularul de onboarding înainte de a genera configurația automată.`,
      setupSteps: [
        {
          phase: "configurare",
          title: "Trimite link-ul de intake clientului",
          instruction: "Clientul nu a completat încă formularul de onboarding. Fără aceste date, configurația agentului nu poate fi generată automat.",
        },
      ],
      missingData: ["Formularul de intake este necompletat"],
      integrations: [],
    };
  }

  const snap: IntakeSnap = { ...intake, businessName };

  switch (agentSlug) {
    case "voicebot": return voicebot(snap);
    case "schedulerbot": return schedulerbot(snap);
    case "salesbot": return salesbot(snap);
    case "supportbot": return supportbot(snap);
    case "socialbot": return socialbot(snap);
    default: {
      const label = AGENT_LABELS[agentSlug] ?? { name: agentSlug, role: "agent AI" };
      return genericTemplate(agentSlug, label.name, label.role, snap);
    }
  }
}
