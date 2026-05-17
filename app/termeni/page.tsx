import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Termeni și condiții",
  description:
    "Termenii și condițiile de utilizare ale platformei ReplacedByAI.",
};

export default function TermsPage() {
  return (
    <main className="min-h-screen pt-32 pb-20 px-6">
      <article className="max-w-3xl mx-auto prose prose-invert">
        <p className="eyebrow mb-4">Legal</p>
        <h1 className="h-display text-4xl md:text-5xl mb-6">Termeni și condiții</h1>
        <p className="text-[var(--ink-3)] mb-10">
          Ultima actualizare: 13 mai 2026
        </p>

        <div className="space-y-6 text-[var(--ink-2)] leading-relaxed">
          <section>
            <h2 className="text-2xl text-[var(--ink)] mb-3">1. Acceptarea termenilor</h2>
            <p>
              Prin utilizarea platformei ReplacedByAI accepți termenii descriși mai jos.
              Dacă nu ești de acord, te rugăm să nu folosești serviciile noastre.
            </p>
          </section>
          <section>
            <h2 className="text-2xl text-[var(--ink)] mb-3">2. Servicii oferite</h2>
            <p>
              ReplacedByAI implementează agenți AI pentru afaceri. Detaliile fiecărui
              pachet sunt comunicate în propunerea comercială.
            </p>
          </section>
          <section>
            <h2 className="text-2xl text-[var(--ink)] mb-3">3. Plată și facturare</h2>
            <p>
              Facturile sunt emise lunar/an, conform pachetului ales. Plata se face în RON
              sau EUR, în termen de 14 zile de la emiterea facturii.
            </p>
          </section>
          <section>
            <h2 className="text-2xl text-[var(--ink)] mb-3">4. Limitarea răspunderii</h2>
            <p>
              ReplacedByAI nu răspunde pentru pierderi indirecte rezultate din utilizarea
              agenților AI. Răspunderea totală este limitată la valoarea plătită în
              ultimele 3 luni.
            </p>
          </section>
          <section>
            <h2 className="text-2xl text-[var(--ink)] mb-3">5. Contact</h2>
            <p>
              Întrebări legate de termeni:{" "}
              <a href="mailto:legal@replacedbyai.ro" className="underline">
                legal@replacedbyai.ro
              </a>
            </p>
          </section>
        </div>
      </article>
    </main>
  );
}
