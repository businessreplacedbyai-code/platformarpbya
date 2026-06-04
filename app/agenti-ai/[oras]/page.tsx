import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CITIES, getCity } from "@/lib/cities";
import { agents } from "@/lib/agents";
import { BUNDLES, PILOT_OFFER, GUARANTEES } from "@/lib/pricing";

const SITE = "https://www.replacedbyai.ro";

export function generateStaticParams() {
  return CITIES.map((c) => ({ oras: c.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ oras: string }>;
}): Promise<Metadata> {
  const { oras } = await params;
  const city = getCity(oras);
  if (!city) return {};
  const title = `Agenți AI în ${city.name} — automatizare afaceri | ReplacedByAI`;
  const description = `Agenți AI pentru afaceri din ${city.name} (${city.county}): preiau apeluri, vând, programează și răspund clienților 24/7. Setup în 48h, garanție 30 zile. Pilot de la €99.`;
  const url = `${SITE}/agenti-ai/${city.slug}`;
  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: { title, description, url, type: "website" },
  };
}

export default async function CityPage({
  params,
}: {
  params: Promise<{ oras: string }>;
}) {
  const { oras } = await params;
  const city = getCity(oras);
  if (!city) notFound();

  const faqs = [
    {
      q: `Ce sunt agenții AI și cum ajută o afacere din ${city.name}?`,
      a: `Agenții AI sunt „angajați digitali" care preiau sarcini repetitive — răspund la telefon, programează clienți, califică lead-uri și răspund la întrebări — 24/7, fără pauze. Pentru o afacere din ${city.name}, asta înseamnă zero apeluri pierdute și mai mult timp pentru munca importantă.`,
    },
    {
      q: `Cât costă un agent AI pentru o firmă din ${city.name}?`,
      a: `Poți începe cu un Pilot de 30 de zile la ${PILOT_OFFER.price}€ (un agent configurat și live). Pachetele lunare pornesc de la €${BUNDLES[0].price}/lună, cu setup inclus în primul abonament. Fără contract pe termen lung — anulezi oricând.`,
    },
    {
      q: `În cât timp se implementează în ${city.name}?`,
      a: `Setup-ul complet durează 48 de ore. Totul se face remote — nu trebuie să te deplasezi. Configurăm agentul pe afacerea ta, îl testăm și îl punem live.`,
    },
    {
      q: `Agentul AI vorbește românește?`,
      a: `Da. Toți agenții vorbesc și scriu românește natural, cu diacritice, adaptat la modul în care comunică afacerile din ${city.region}.`,
    },
    {
      q: `Ce se întâmplă dacă nu sunt mulțumit?`,
      a: `Ai garanție de 30 de zile — bani înapoi dacă nu vezi rezultate. Fără contract, fără riscuri.`,
    },
  ];

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };

  const serviceSchema = {
    "@context": "https://schema.org",
    "@type": "Service",
    serviceType: "Implementare agenți AI pentru afaceri",
    provider: { "@type": "Organization", name: "ReplacedByAI", url: SITE },
    areaServed: { "@type": "City", name: city.name },
    description: `Agenți AI pentru afaceri din ${city.name}: voce, programări, vânzări, suport, social media și facturare automată.`,
    offers: {
      "@type": "Offer",
      priceCurrency: "EUR",
      price: String(PILOT_OFFER.price),
      url: `${SITE}/agenti-ai/${city.slug}`,
    },
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Acasă", item: SITE },
      { "@type": "ListItem", position: 2, name: "Agenți AI pe orașe", item: `${SITE}/agenti-ai` },
      { "@type": "ListItem", position: 3, name: city.name, item: `${SITE}/agenti-ai/${city.slug}` },
    ],
  };

  // Orașe vecine pentru internal linking
  const others = CITIES.filter((c) => c.slug !== city.slug && c.region === city.region).slice(0, 6);
  const fallbackOthers = CITIES.filter((c) => c.slug !== city.slug).slice(0, 6);
  const related = (others.length >= 3 ? others : fallbackOthers).slice(0, 6);

  return (
    <main style={{ background: "var(--bg)", color: "var(--ink)" }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />

      {/* HERO */}
      <section className="pt-32 pb-12 px-6 max-w-4xl mx-auto text-center">
        <p className="text-[12px] uppercase tracking-[0.3em] mb-4" style={{ color: "var(--ink-3)" }}>
          {city.county} · {city.region}
        </p>
        <h1 className="h-display text-4xl md:text-6xl tracking-tight">
          Agenți AI în {city.name}
        </h1>
        <p className="mt-5 text-[16px] md:text-[18px] max-w-2xl mx-auto" style={{ color: "var(--ink-2)" }}>
          „Angajați digitali" care preiau apeluri, vând, programează și răspund clienților —
          24/7, fără greșeli. Pentru afaceri din {city.name} care vor să crească fără să angajeze mai mult.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-2 mt-7 text-[12.5px]">
          {GUARANTEES.map((g) => (
            <span key={g.title} className="px-3 py-1.5 rounded-full" style={{ background: "var(--bg-3)", color: "var(--ink-1)", border: "1px solid var(--border)" }}>
              ✓ {g.title}
            </span>
          ))}
        </div>
        <div className="mt-8 flex flex-wrap gap-3 justify-center">
          <Link href="/contact" className="h-12 px-7 rounded-xl grid place-items-center text-[14px] font-medium" style={{ background: "var(--ink)", color: "var(--bg)" }}>
            Programează demo gratuit →
          </Link>
          <Link href="/preturi" className="h-12 px-7 rounded-xl grid place-items-center text-[14px] font-medium" style={{ background: "var(--bg-3)", color: "var(--ink)", border: "1px solid var(--border)" }}>
            Vezi prețuri
          </Link>
        </div>
      </section>

      {/* DE CE */}
      <section className="px-6 py-12 max-w-4xl mx-auto">
        <h2 className="h-display text-2xl md:text-3xl tracking-tight mb-4">
          De ce afacerile din {city.name} aleg agenți AI
        </h2>
        <p className="text-[15px] leading-relaxed mb-3" style={{ color: "var(--ink-2)" }}>
          Fie că ai o clinică, un restaurant, un salon sau o firmă de servicii în {city.name},
          pierzi clienți de fiecare dată când telefonul sună în gol sau un mesaj rămâne fără răspuns.
          Un agent AID răspunde la fiecare apel și mesaj, instant, la orice oră — și transformă
          interesul în programări și vânzări reale.
        </p>
        <p className="text-[15px] leading-relaxed" style={{ color: "var(--ink-2)" }}>
          Spre deosebire de un angajat, agentul nu doarme, nu cere mărire și nu greșește.
          Costă de zece ori mai puțin și lucrează non-stop. De aceea tot mai multe afaceri din
          {" "}{city.region} fac trecerea — înainte ca să o facă concurența.
        </p>
      </section>

      {/* AGENȚI */}
      <section className="px-6 py-12" style={{ background: "var(--bg-2)" }}>
        <div className="max-w-5xl mx-auto">
          <h2 className="h-display text-2xl md:text-3xl tracking-tight mb-2">
            Agenți AI disponibili în {city.name}
          </h2>
          <p className="text-[14px] mb-8" style={{ color: "var(--ink-3)" }}>
            Alege un singur agent sau un pachet complet. Toți vorbesc românește.
          </p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {agents.slice(0, 9).map((a) => (
              <Link key={a.slug} href={`/agenti/${a.slug}`} className="rounded-2xl p-5 block transition-colors" style={{ background: "var(--bg)", border: "1px solid var(--border)" }}>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3" style={{ background: "var(--bg-3)" }}>
                  <a.icon size={18} />
                </div>
                <div className="text-[10px] uppercase tracking-wider mb-1" style={{ color: "var(--ink-3)" }}>{a.role}</div>
                <h3 className="text-[15px] font-medium mb-1.5">{a.name}</h3>
                <p className="text-[12.5px] leading-relaxed" style={{ color: "var(--ink-2)" }}>{a.short}</p>
                <div className="text-[12px] mt-3" style={{ color: "var(--ink-3)" }}>de la €{a.monthlyFrom}/lună</div>
              </Link>
            ))}
          </div>
          <div className="text-center mt-8">
            <Link href="/agenti" className="text-[13.5px] underline" style={{ color: "var(--ink-2)" }}>
              Vezi toți cei 15 agenți →
            </Link>
          </div>
        </div>
      </section>

      {/* PILOT */}
      <section className="px-6 py-14 max-w-4xl mx-auto">
        <div className="rounded-3xl p-8 md:p-10 text-center" style={{ background: "var(--ink)", color: "var(--bg)" }}>
          <p className="text-[11px] uppercase tracking-[0.22em] opacity-60 mb-3">Începe fără risc în {city.name}</p>
          <h2 className="text-[26px] md:text-[32px] font-medium tracking-tight mb-3">
            Pilot 30 de zile — €{PILOT_OFFER.price}
          </h2>
          <p className="text-[14px] opacity-70 max-w-lg mx-auto mb-6">
            Un agent AI configurat și live în 48h. Vezi rezultate înainte să te abonezi.
            Dacă nu te convinge, primești banii înapoi.
          </p>
          <Link href="/contact?pilot=1" className="inline-block h-12 px-8 rounded-xl grid place-items-center text-[14px] font-medium leading-[3rem]" style={{ background: "var(--bg)", color: "var(--ink)" }}>
            Pornește pilotul →
          </Link>
        </div>
      </section>

      {/* FAQ */}
      <section className="px-6 py-12 max-w-3xl mx-auto">
        <h2 className="h-display text-2xl md:text-3xl tracking-tight mb-8 text-center">
          Întrebări frecvente — agenți AI în {city.name}
        </h2>
        <div className="space-y-3">
          {faqs.map((f) => (
            <details key={f.q} className="rounded-2xl p-5" style={{ background: "var(--bg-2)", border: "1px solid var(--border)" }}>
              <summary className="text-[15px] font-medium cursor-pointer">{f.q}</summary>
              <p className="text-[14px] mt-3 leading-relaxed" style={{ color: "var(--ink-2)" }}>{f.a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* ALTE ORAȘE */}
      <section className="px-6 py-12 max-w-4xl mx-auto" style={{ borderTop: "1px solid var(--border)" }}>
        <h2 className="text-[14px] uppercase tracking-wider mb-4" style={{ color: "var(--ink-3)" }}>
          Agenți AI și în alte orașe
        </h2>
        <div className="flex flex-wrap gap-2">
          {related.map((c) => (
            <Link key={c.slug} href={`/agenti-ai/${c.slug}`} className="px-3 py-1.5 rounded-full text-[12.5px]" style={{ background: "var(--bg-3)", border: "1px solid var(--border)", color: "var(--ink-2)" }}>
              Agenți AI {c.name}
            </Link>
          ))}
        </div>
      </section>

      {/* CTA FINAL */}
      <section className="px-6 py-20 text-center">
        <h2 className="h-display text-3xl md:text-4xl tracking-tight mb-4">
          Gata să automatizezi afacerea ta din {city.name}?
        </h2>
        <Link href="/contact" className="inline-block mt-4 px-8 h-14 leading-[3.5rem] rounded-xl text-[15px] font-medium" style={{ background: "var(--ink)", color: "var(--bg)" }}>
          Programează discuție gratuită →
        </Link>
      </section>
    </main>
  );
}
