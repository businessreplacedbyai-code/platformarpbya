import type { Metadata } from "next";
import Link from "next/link";
import { ComparisonTable } from "./ComparisonTable";

export const metadata: Metadata = {
  title: "Angajat uman vs Agent AI — comparație directă",
  description:
    "Cost, disponibilitate, erori, training, concediu medical. Vezi diferența reală între un angajat uman și un agent AI ReplacedByAI pentru afacerea ta.",
  alternates: { canonical: "https://replacedbyai.ro/comparatie" },
  openGraph: {
    title: "Angajat uman vs Agent AI | ReplacedByAI",
    description:
      "Cost total anual, disponibilitate, erori, concediu medical — compară direct.",
    url: "https://replacedbyai.ro/comparatie",
  },
};

export default function ComparatiePage() {
  return (
    <div className="pt-32 pb-32 px-6">
      <div className="max-w-5xl mx-auto">
        <header className="text-center mb-16 max-w-3xl mx-auto">
          <p className="eyebrow mb-4">Comparație</p>
          <h1 className="h-display text-5xl md:text-7xl text-[var(--ink)] mb-6 leading-[1.02]">
            Angajat uman <span className="text-[var(--ink-3)]">vs</span>{" "}
            <span className="gradient-text">Agent AI</span>
          </h1>
          <p className="text-lg text-[var(--ink-2)] leading-relaxed">
            Nu spunem că AI-ul înlocuiește oamenii. Spunem că înlocuiește munca repetitivă care îți
            consumă oamenii. Iată cifrele.
          </p>
        </header>

        <ComparisonTable />

        <section className="mt-20 grid md:grid-cols-3 gap-4">
          <Stat value="~30 sec" label="Timp mediu răspuns AI" sub="Față de 5-15 minute uman" />
          <Stat value="0" label="Zile de concediu medical" sub="AI nu se îmbolnăvește" />
          <Stat value="24/7" label="Disponibilitate continuă" sub="Inclusiv duminică la 3 dimineața" />
        </section>

        <section className="mt-20 text-center">
          <h2 className="h-display text-3xl md:text-4xl mb-4">
            Vrei o estimare pentru afacerea ta?
          </h2>
          <p className="text-[var(--ink-2)] mb-8 max-w-xl mx-auto">
            Analiză gratuită de 30 de minute. Îți spunem exact ce agent are sens și ce economisești.
          </p>
          <Link href="/contact" className="btn btn-primary px-6 py-3 text-[15px]">
            Cere analiza gratuită
          </Link>
        </section>
      </div>
    </div>
  );
}

function Stat({ value, label, sub }: { value: string; label: string; sub: string }) {
  return (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-2)] p-7">
      <div className="h-display text-4xl text-[var(--ink)] mb-2">{value}</div>
      <div className="text-[14px] text-[var(--ink-1)] font-medium mb-1">{label}</div>
      <div className="text-[12.5px] text-[var(--ink-3)] leading-relaxed">{sub}</div>
    </div>
  );
}
