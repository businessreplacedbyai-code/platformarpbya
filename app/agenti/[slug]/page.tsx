import { notFound } from "next/navigation";
import { agents } from "@/lib/agents";
import { Button } from "@/components/ui/Button";
import { Check, Phone } from "lucide-react";
import { CTAFinal } from "@/components/home/CTAFinal";

export function generateStaticParams() {
  return agents.map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const a = agents.find((x) => x.slug === slug);
  if (!a) return { title: "Agent" };
  return {
    title: `${a.name} — ${a.role} | Agent AI ReplacedByAI`,
    description: `${a.description} Preț estimativ: de la €${a.setupFrom} setup + €${a.monthlyFrom}/lună. Cere o analiză gratuită.`,
    alternates: { canonical: `https://replacedbyai.ro/agenti/${a.slug}` },
    openGraph: {
      title: `${a.name} — ${a.role}`,
      description: a.description,
      url: `https://replacedbyai.ro/agenti/${a.slug}`,
      type: "article",
    },
  };
}

export default async function AgentPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const a = agents.find((x) => x.slug === slug);
  if (!a) notFound();

  const Icon = a.icon;

  const serviceSchema = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: `${a.name} — ${a.role}`,
    description: a.description,
    provider: {
      "@type": "Organization",
      name: "ReplacedByAI",
      url: "https://replacedbyai.ro",
    },
    areaServed: { "@type": "Country", name: "Romania" },
    offers: {
      "@type": "Offer",
      priceCurrency: "EUR",
      price: a.monthlyFrom,
      priceSpecification: {
        "@type": "UnitPriceSpecification",
        price: a.monthlyFrom,
        priceCurrency: "EUR",
        unitCode: "MON",
        referenceQuantity: { "@type": "QuantitativeValue", value: 1, unitCode: "MON" },
      },
      url: `https://replacedbyai.ro/agenti/${a.slug}`,
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }}
      />
      <section className="pt-40 pb-20 px-6 max-w-5xl mx-auto">
        <div className="w-16 h-16 rounded-2xl bg-[var(--ink)] text-[var(--bg-2)] flex items-center justify-center mb-8">
          <Icon size={26} />
        </div>
        <p className="eyebrow mb-4">{a.role}</p>
        <h1 className="h-display text-5xl md:text-7xl mb-6">{a.name}</h1>
        <p className="text-xl md:text-2xl text-[var(--ink-1)] max-w-3xl leading-relaxed mb-10">
          {a.description}
        </p>
        <div className="flex flex-wrap gap-3">
          <Button href="/contact" variant="primary" arrow size="lg">
            Cere o analiză gratuită
          </Button>
          <Button href="/agenti" variant="secondary" size="lg">
            Vezi toți agenții
          </Button>
        </div>
      </section>

      <section className="px-6 max-w-5xl mx-auto py-20 border-t border-[var(--border)]">
        <h2 className="h-display text-3xl md:text-5xl mb-10">
          Ce face <span className="gradient-text">{a.name}</span>
        </h2>
        <ul className="space-y-3">
          {[
            "Operează autonom, 24/7, pe canalele tale.",
            "Răspunde sub 2 secunde la fiecare interacțiune.",
            "Își amintește contextul fiecărui client.",
            "Trimite rapoarte de activitate săptămânal.",
          ].map((line, i) => (
            <li
              key={i}
              className="flex items-start gap-3 p-4 rounded-xl border border-[var(--border)] bg-[var(--bg-2)]"
            >
              <Check size={18} className="text-emerald-600 mt-0.5 shrink-0" />
              <span className="text-[15px] text-[var(--ink-1)]">{line}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="px-6 max-w-5xl mx-auto py-20 border-t border-[var(--border)]">
        <p className="eyebrow mb-4">Preț estimativ</p>
        <h2 className="h-display text-3xl md:text-5xl mb-10">
          Cât costă <span className="gradient-text">{a.name}</span>
        </h2>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="rounded-3xl border border-[var(--border)] bg-[var(--bg-2)] p-8 md:p-10">
            <p className="eyebrow mb-3">Setup unic</p>
            <div className="h-display text-5xl md:text-6xl mb-2 text-[var(--ink)]">
              €{a.setupFrom}
            </div>
            <p className="text-[14px] text-[var(--ink-3)] leading-relaxed">
              Configurare, integrare cu sistemele tale (CRM, telefonie, calendar),
              antrenare pe datele afacerii, testare și go-live.
            </p>
          </div>
          <div className="rounded-3xl border border-[var(--border)] bg-[var(--bg-2)] p-8 md:p-10">
            <p className="eyebrow mb-3">Abonament lunar</p>
            <div className="h-display text-5xl md:text-6xl mb-2 text-[var(--ink)]">
              €{a.monthlyFrom}
              <span className="text-[var(--ink-3)] text-2xl">/lună</span>
            </div>
            <p className="text-[14px] text-[var(--ink-3)] leading-relaxed">
              Hosting, mentenanță, monitorizare 24/7, actualizări lunare și
              suport tehnic prioritar.
            </p>
          </div>
        </div>
        <p className="mt-6 text-[13px] text-[var(--ink-3)]">
          * Preț estimativ. Tariful final depinde de volum, integrări și complexitatea
          fluxurilor. Primește o ofertă exactă după analiza gratuită.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Button href="/contact" variant="primary" arrow size="lg">
            Cere ofertă personalizată
          </Button>
          <a
            href="tel:+40700000000"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full border border-[var(--border)] text-[var(--ink)] hover:bg-[var(--bg-3)] transition-all text-[15px]"
          >
            <Phone size={16} /> Sună acum
          </a>
        </div>
      </section>

      <CTAFinal />
    </>
  );
}
