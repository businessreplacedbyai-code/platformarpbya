import Link from "next/link";
import { services } from "@/lib/agents";
import { ArrowUpRight } from "lucide-react";
import { CTAFinal } from "@/components/home/CTAFinal";

export const metadata = {
  title: "Servicii AI — agenți vocali, programări, vânzări, suport | ReplacedByAI",
  description:
    "Servicii ReplacedByAI: agenți vocali AI care preiau apeluri, programări automate, calificare lead-uri, suport clienți 24/7, social media și contabilitate automatizată.",
  alternates: { canonical: "https://www.replacedbyai.ro/servicii" },
  openGraph: {
    title: "Servicii AI | ReplacedByAI",
    description: "Agenți vocali, programări automate, vânzări, suport 24/7 — implementați pentru afacerea ta.",
    url: "https://www.replacedbyai.ro/servicii",
    type: "website" as const,
    images: [{ url: "https://www.replacedbyai.ro/opengraph-image", width: 1200, height: 630 }],
  },
};

export default function ServiciiPage() {
  return (
    <>
      <section className="pt-40 pb-20 px-6 max-w-6xl mx-auto">
        <div className="max-w-3xl">
          <p className="eyebrow mb-4">Servicii</p>
          <h1 className="h-display text-5xl md:text-7xl mb-6">
            Înlocuim oamenii. <br />
            <span className="gradient-text">Garantat.</span>
          </h1>
          <p className="text-lg md:text-xl text-[var(--ink-2)] leading-relaxed">
            Fiecare serviciu e un agent AI dedicat unei funcții din afacerea ta.
            Activăm rapid, optimizăm lunar, raportăm transparent.
          </p>
        </div>
      </section>

      <section className="px-6 max-w-6xl mx-auto pb-32">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
          {services.map((s) => {
            const Icon = s.icon;
            return (
              <Link
                key={s.slug}
                href={`/servicii/${s.slug}`}
                className="card-hover group block rounded-2xl border border-[var(--border)] bg-[var(--bg-2)] p-7 min-h-[260px] flex flex-col"
              >
                <div className="flex items-start justify-between mb-12">
                  <div className="w-11 h-11 rounded-xl bg-[var(--bg-3)] flex items-center justify-center text-[var(--ink-1)] group-hover:bg-[var(--ink)] group-hover:text-[var(--bg-2)] transition-all">
                    <Icon size={18} />
                  </div>
                  <ArrowUpRight
                    size={16}
                    className="text-[var(--ink-4)] group-hover:text-[var(--ink)] group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition-all"
                  />
                </div>
                <div className="mt-auto">
                  <h2 className="h-display-sm text-xl mb-2">{s.title}</h2>
                  <p className="text-[14.5px] text-[var(--ink-3)] leading-relaxed">
                    {s.tagline}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      <CTAFinal />
    </>
  );
}
