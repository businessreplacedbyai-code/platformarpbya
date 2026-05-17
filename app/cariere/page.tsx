import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Cariere",
  description:
    "Construim viitorul automatizării AI în România. Vezi roluri deschise la ReplacedByAI.",
};

export default function CareersPage() {
  return (
    <main className="min-h-screen pt-32 pb-20 px-6">
      <section className="max-w-3xl mx-auto text-center">
        <p className="eyebrow mb-4">Cariere</p>
        <h1 className="h-display text-4xl md:text-6xl mb-6">
          Construim cea mai mare agenție AI <span className="gradient-text">din România.</span>
        </h1>
        <p className="text-lg text-[var(--ink-2)] mb-10 leading-relaxed">
          În acest moment nu avem roluri deschise public, dar suntem mereu deschiși la
          oameni excepționali în AI engineering, sales și operations.
        </p>
        <Link
          href="mailto:cariere@replacedbyai.ro"
          className="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-[var(--ink)] text-[var(--bg)] text-sm font-medium hover:opacity-90 transition-opacity"
        >
          Trimite CV la cariere@replacedbyai.ro
        </Link>
      </section>
    </main>
  );
}
