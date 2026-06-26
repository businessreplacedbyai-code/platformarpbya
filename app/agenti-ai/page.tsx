import type { Metadata } from "next";
import Link from "next/link";
import { CITIES } from "@/lib/cities";

const SITE = "https://www.replacedbyai.ro";

export const metadata: Metadata = {
  title: "Agenți AI pe orașe — toată România | ReplacedByAI",
  description:
    "Agenți AI pentru afaceri din toată România. Alege orașul tău — București, Cluj, Timișoara, Iași și încă 26 — și vezi cum automatizezi apeluri, programări și vânzări 24/7.",
  alternates: { canonical: `${SITE}/agenti-ai` },
};

export default function CitiesHub() {
  return (
    <main style={{ background: "var(--bg)", color: "var(--ink)" }}>
      <section className="pt-32 pb-12 px-6 max-w-4xl mx-auto text-center">
        <p className="text-[12px] uppercase tracking-[0.3em] mb-4" style={{ color: "var(--ink-3)" }}>
          Acoperire națională
        </p>
        <h1 className="h-display text-4xl md:text-6xl tracking-tight">
          Agenți AI în toată România
        </h1>
        <p className="mt-5 text-[16px] md:text-[18px] max-w-2xl mx-auto" style={{ color: "var(--ink-2)" }}>
          Instalăm agenți AI pentru afaceri din toată țara. Alege orașul tău și vezi cum
          afacerile locale automatizează apeluri, programări și vânzări.
        </p>
      </section>

      <section className="px-6 pb-24 max-w-5xl mx-auto">
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-3">
          {CITIES.map((c) => (
            <Link
              key={c.slug}
              href={`/agenti-ai/${c.slug}`}
              className="rounded-2xl p-5 block transition-colors"
              style={{ background: "var(--bg-2)", border: "1px solid var(--border)" }}
            >
              <div className="text-[16px] font-medium">Agenți AI {c.name}</div>
              <div className="text-[12px] mt-0.5" style={{ color: "var(--ink-3)" }}>
                {c.county} · {c.region}
              </div>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
