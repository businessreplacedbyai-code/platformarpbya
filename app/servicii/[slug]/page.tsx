import { notFound } from "next/navigation";
import { services } from "@/lib/agents";
import { Button } from "@/components/ui/Button";
import { Check, MessageCircle, Phone, Globe, Smartphone } from "lucide-react";
import { CTAFinal } from "@/components/home/CTAFinal";

export function generateStaticParams() {
  return services.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const s = services.find((x) => x.slug === slug);
  if (!s) return { title: "Serviciu" };
  return {
    title: `${s.title} | ReplacedByAI`,
    description: `${s.tagline} ${s.description}`,
    alternates: { canonical: `https://www.replacedbyai.ro/servicii/${s.slug}` },
    openGraph: {
      title: s.title,
      description: s.tagline,
      url: `https://www.replacedbyai.ro/servicii/${s.slug}`,
      type: "article",
    },
  };
}

const integrations = [
  { icon: MessageCircle, label: "WhatsApp" },
  { icon: Phone, label: "Telefonie" },
  { icon: Globe, label: "Web" },
  { icon: Smartphone, label: "SMS" },
];

export default async function ServiciuPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const s = services.find((x) => x.slug === slug);
  if (!s) notFound();

  const Icon = s.icon;

  return (
    <>
      <section className="pt-40 pb-20 px-6 max-w-5xl mx-auto">
        <div className="w-16 h-16 rounded-2xl bg-[var(--ink)] text-[var(--bg-2)] flex items-center justify-center mb-8">
          <Icon size={26} />
        </div>
        <p className="eyebrow mb-4">Serviciu</p>
        <h1 className="h-display text-5xl md:text-7xl mb-6">{s.title}</h1>
        <p className="text-xl md:text-2xl text-[var(--ink-1)] max-w-3xl leading-relaxed mb-8">
          {s.tagline}
        </p>
        <Button href="/contact" variant="primary" arrow size="lg">
          Cere audit gratuit
        </Button>
      </section>

      <section className="px-6 max-w-5xl mx-auto py-20 border-t border-[var(--border)]">
        <h2 className="h-display text-3xl md:text-5xl mb-10">
          Ce face <span className="gradient-text">exact</span>
        </h2>
        <ul className="grid md:grid-cols-2 gap-3">
          {[
            "Lucrează 24/7, fără pauze, fără concedii.",
            "Răspunde instant pe canalele tale existente.",
            "Se integrează cu sistemele actuale (CRM, calendar, telefonie).",
            "Învață continuu din interacțiunile reale.",
            "Raportează lunar performanța în cifre concrete.",
            "Escaladează automat la oameni când e nevoie.",
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
        <h2 className="h-display text-3xl md:text-5xl mb-10">
          Unde se <span className="gradient-text">integrează</span>
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {integrations.map((it) => {
            const I = it.icon;
            return (
              <div
                key={it.label}
                className="card-hover rounded-2xl border border-[var(--border)] bg-[var(--bg-2)] p-6 flex flex-col items-center gap-3"
              >
                <div className="w-11 h-11 rounded-xl bg-[var(--bg-3)] flex items-center justify-center text-[var(--ink-1)]">
                  <I size={18} />
                </div>
                <span className="text-[13.5px] text-[var(--ink-1)]">{it.label}</span>
              </div>
            );
          })}
        </div>
      </section>

      <section className="px-6 max-w-5xl mx-auto py-20 border-t border-[var(--border)]">
        <h2 className="h-display text-3xl md:text-5xl mb-10">
          Plan & <span className="gradient-text">preț</span>
        </h2>
        <div className="rounded-3xl border border-[var(--border)] bg-[var(--bg-2)] p-10 md:p-12">
          <p className="eyebrow mb-4">Instalat de noi</p>
          <div className="h-display text-5xl md:text-6xl mb-3">
            de la <span className="text-[var(--ink)]">490 lei</span>
            <span className="text-[var(--ink-3)] text-3xl">/lună</span>
          </div>
          <p className="text-[var(--ink-3)] mb-8 max-w-xl">
            Setup unic + abonament lunar, instalat și optimizat de noi pe afacerea ta.
            Începe cu un audit și un demo gratuit — vezi rezultatul înainte să plătești.
          </p>
          <div className="flex flex-wrap gap-3">
            <Button href="/contact" variant="primary" arrow size="lg">
              Cere audit gratuit
            </Button>
            <Button href="/preturi" variant="secondary" size="lg">
              Vezi prețuri
            </Button>
          </div>
        </div>
      </section>

      <CTAFinal />
    </>
  );
}
