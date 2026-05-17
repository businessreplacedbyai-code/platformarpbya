import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "GDPR — Protecția datelor",
  description:
    "Informații GDPR despre prelucrarea datelor de către ReplacedByAI SRL.",
};

export default function GdprPage() {
  return (
    <main className="min-h-screen pt-32 pb-20 px-6">
      <article className="max-w-3xl mx-auto">
        <p className="eyebrow mb-4">Legal</p>
        <h1 className="h-display text-4xl md:text-5xl mb-6">GDPR</h1>
        <p className="text-[var(--ink-3)] mb-10">Ultima actualizare: 13 mai 2026</p>

        <div className="space-y-6 text-[var(--ink-2)] leading-relaxed">
          <section>
            <h2 className="text-2xl text-[var(--ink)] mb-3">Operator de date</h2>
            <p>
              ReplacedByAI SRL, sediu în Botoșani, România. Persoană de contact GDPR:{" "}
              <a href="mailto:dpo@replacedbyai.ro" className="underline">
                dpo@replacedbyai.ro
              </a>
              .
            </p>
          </section>
          <section>
            <h2 className="text-2xl text-[var(--ink)] mb-3">Temei legal</h2>
            <p>
              Prelucrăm date pe baza: (a) consimțământ explicit (formular contact),
              (b) executare contract (clienți activi), (c) interes legitim (analytics
              agregate).
            </p>
          </section>
          <section>
            <h2 className="text-2xl text-[var(--ink)] mb-3">Perioadă de stocare</h2>
            <p>
              Lead-uri: maxim 24 luni de la ultimul contact. Date clienți: pe durata
              contractului + 10 ani pentru facturi (cerință legală).
            </p>
          </section>
          <section>
            <h2 className="text-2xl text-[var(--ink)] mb-3">Sub-procesatori</h2>
            <p>
              Folosim: Vercel (hosting), Supabase/Neon (DB), Resend (email
              tranzacțional), VAPI + ElevenLabs (voce), OpenAI/Anthropic (LLM).
              Toți sunt conformi GDPR.
            </p>
          </section>
        </div>
      </article>
    </main>
  );
}
