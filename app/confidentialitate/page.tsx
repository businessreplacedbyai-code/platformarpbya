import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Politica de confidențialitate",
  description:
    "Cum colectează, folosește și protejează ReplacedByAI datele tale personale.",
};

export default function PrivacyPage() {
  return (
    <main className="min-h-screen pt-32 pb-20 px-6">
      <article className="max-w-3xl mx-auto">
        <p className="eyebrow mb-4">Legal</p>
        <h1 className="h-display text-4xl md:text-5xl mb-6">Politica de confidențialitate</h1>
        <p className="text-[var(--ink-3)] mb-10">Ultima actualizare: 13 mai 2026</p>

        <div className="space-y-6 text-[var(--ink-2)] leading-relaxed">
          <section>
            <h2 className="text-2xl text-[var(--ink)] mb-3">1. Date colectate</h2>
            <p>
              Colectăm doar datele necesare pentru a livra serviciile: nume, email,
              telefon, denumire firmă și informații despre business (când completezi
              formularul de intake).
            </p>
          </section>
          <section>
            <h2 className="text-2xl text-[var(--ink)] mb-3">2. Cum folosim datele</h2>
            <p>
              Datele sunt folosite pentru: contact comercial, livrarea serviciilor,
              facturare și suport. Nu vindem date către terți.
            </p>
          </section>
          <section>
            <h2 className="text-2xl text-[var(--ink)] mb-3">3. Drepturile tale</h2>
            <p>
              Conform GDPR ai dreptul la acces, rectificare, ștergere, portabilitate și
              opoziție. Trimite cereri la{" "}
              <a href="mailto:privacy@replacedbyai.ro" className="underline">
                privacy@replacedbyai.ro
              </a>
              .
            </p>
          </section>
          <section>
            <h2 className="text-2xl text-[var(--ink)] mb-3">4. Cookies</h2>
            <p>
              Folosim cookies tehnice strict necesare pentru autentificare și sesiuni.
              Nu folosim cookies de tracking comercial.
            </p>
          </section>
        </div>
      </article>
    </main>
  );
}
