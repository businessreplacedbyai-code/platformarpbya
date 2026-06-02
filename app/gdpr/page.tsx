import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "GDPR — Protecția datelor cu caracter personal | ReplacedByAI",
  description: "Informații complete despre prelucrarea datelor personale de către ReplacedByAI, conform Regulamentului GDPR (UE) 2016/679.",
  alternates: { canonical: "https://www.replacedbyai.ro/gdpr" },
  robots: { index: false, follow: false },
};

export default function GdprPage() {
  return (
    <main className="min-h-screen pt-32 pb-20 px-6">
      <article className="max-w-3xl mx-auto">
        <p className="eyebrow mb-4">Legal</p>
        <h1 className="h-display text-4xl md:text-5xl mb-4">Protecția datelor — GDPR</h1>
        <p className="text-[var(--ink-3)] text-sm mb-12">Ultima actualizare: 26 mai 2025 · Regulamentul (UE) 2016/679</p>

        <div className="space-y-8 text-[15px] text-[var(--ink-2)] leading-relaxed">

          <section>
            <h2 className="text-xl font-semibold text-[var(--ink)] mb-3">Operator de date cu caracter personal</h2>
            <div className="p-4 rounded-xl bg-[var(--bg-2)] border border-[var(--border)] space-y-1">
              <p><strong>Denumire:</strong> ReplacedByAI</p>
              <p><strong>Țara:</strong> România</p>
              <p><strong>Email contact GDPR:</strong>{" "}
                <a href="mailto:contact@replacedbyai.ro" className="underline hover:opacity-70">contact@replacedbyai.ro</a>
              </p>
              <p><strong>Website:</strong> www.replacedbyai.ro</p>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[var(--ink)] mb-3">Temeiul legal al prelucrării</h2>
            <div className="space-y-3">
              <div className="flex gap-3">
                <span className="shrink-0 w-6 h-6 rounded-full bg-[var(--bg-3)] border border-[var(--border)] flex items-center justify-center text-[11px] font-bold text-[var(--ink)]">a</span>
                <div>
                  <p className="font-medium text-[var(--ink)]">Consimțământ — Art. 6(1)(a) GDPR</p>
                  <p className="text-[13.5px] mt-0.5">Formular de contact, comunicări de marketing. Retragerea consimțământului se face oricând prin email.</p>
                </div>
              </div>
              <div className="flex gap-3">
                <span className="shrink-0 w-6 h-6 rounded-full bg-[var(--bg-3)] border border-[var(--border)] flex items-center justify-center text-[11px] font-bold text-[var(--ink)]">b</span>
                <div>
                  <p className="font-medium text-[var(--ink)]">Executarea contractului — Art. 6(1)(b) GDPR</p>
                  <p className="text-[13.5px] mt-0.5">Livrarea serviciilor AI, acces portal client, suport tehnic, facturare.</p>
                </div>
              </div>
              <div className="flex gap-3">
                <span className="shrink-0 w-6 h-6 rounded-full bg-[var(--bg-3)] border border-[var(--border)] flex items-center justify-center text-[11px] font-bold text-[var(--ink)]">c</span>
                <div>
                  <p className="font-medium text-[var(--ink)]">Obligație legală — Art. 6(1)(c) GDPR</p>
                  <p className="text-[13.5px] mt-0.5">Arhivare fiscală, contabilitate, obligații de raportare conform legislației române.</p>
                </div>
              </div>
              <div className="flex gap-3">
                <span className="shrink-0 w-6 h-6 rounded-full bg-[var(--bg-3)] border border-[var(--border)] flex items-center justify-center text-[11px] font-bold text-[var(--ink)]">f</span>
                <div>
                  <p className="font-medium text-[var(--ink)]">Interes legitim — Art. 6(1)(f) GDPR</p>
                  <p className="text-[13.5px] mt-0.5">Securitatea platformei, prevenirea fraudei, analitice agregate anonimizate.</p>
                </div>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[var(--ink)] mb-3">Categorii de date prelucrate</h2>
            <div className="overflow-hidden rounded-xl border border-[var(--border)]">
              <table className="w-full text-[13.5px]">
                <thead>
                  <tr className="border-b border-[var(--border)] bg-[var(--bg-2)]">
                    <th className="text-left px-4 py-3 font-medium text-[var(--ink)]">Categorie</th>
                    <th className="text-left px-4 py-3 font-medium text-[var(--ink)]">Date</th>
                    <th className="text-left px-4 py-3 font-medium text-[var(--ink)]">Retenție</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border)]">
                  <tr className="bg-[var(--bg)]">
                    <td className="px-4 py-3">Lead-uri</td>
                    <td className="px-4 py-3">Nume, email, telefon, firmă</td>
                    <td className="px-4 py-3">24 luni</td>
                  </tr>
                  <tr className="bg-[var(--bg-2)]">
                    <td className="px-4 py-3">Clienți activi</td>
                    <td className="px-4 py-3">Date contact + date business (onboarding)</td>
                    <td className="px-4 py-3">Durata contractului</td>
                  </tr>
                  <tr className="bg-[var(--bg)]">
                    <td className="px-4 py-3">Date financiare</td>
                    <td className="px-4 py-3">Facturi, plăți</td>
                    <td className="px-4 py-3">10 ani (legal)</td>
                  </tr>
                  <tr className="bg-[var(--bg-2)]">
                    <td className="px-4 py-3">Date tehnice</td>
                    <td className="px-4 py-3">IP hash, logs</td>
                    <td className="px-4 py-3">90 zile</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[var(--ink)] mb-3">Sub-procesatori (împuterniciți)</h2>
            <div className="overflow-hidden rounded-xl border border-[var(--border)]">
              <table className="w-full text-[13.5px]">
                <thead>
                  <tr className="border-b border-[var(--border)] bg-[var(--bg-2)]">
                    <th className="text-left px-4 py-3 font-medium text-[var(--ink)]">Furnizor</th>
                    <th className="text-left px-4 py-3 font-medium text-[var(--ink)]">Scop</th>
                    <th className="text-left px-4 py-3 font-medium text-[var(--ink)]">Locație</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border)]">
                  <tr className="bg-[var(--bg)]">
                    <td className="px-4 py-3 font-medium">Vercel</td>
                    <td className="px-4 py-3">Hosting aplicație web</td>
                    <td className="px-4 py-3">SUA / UE</td>
                  </tr>
                  <tr className="bg-[var(--bg-2)]">
                    <td className="px-4 py-3 font-medium">Neon (PostgreSQL)</td>
                    <td className="px-4 py-3">Bază de date</td>
                    <td className="px-4 py-3">UE (Frankfurt)</td>
                  </tr>
                  <tr className="bg-[var(--bg)]">
                    <td className="px-4 py-3 font-medium">Resend</td>
                    <td className="px-4 py-3">Email tranzacțional</td>
                    <td className="px-4 py-3">SUA (GDPR DPA)</td>
                  </tr>
                  <tr className="bg-[var(--bg-2)]">
                    <td className="px-4 py-3 font-medium">Stripe</td>
                    <td className="px-4 py-3">Procesare plăți</td>
                    <td className="px-4 py-3">UE / SUA</td>
                  </tr>
                  <tr className="bg-[var(--bg)]">
                    <td className="px-4 py-3 font-medium">VAPI / ElevenLabs</td>
                    <td className="px-4 py-3">Agent vocal AI</td>
                    <td className="px-4 py-3">SUA (GDPR DPA)</td>
                  </tr>
                  <tr className="bg-[var(--bg-2)]">
                    <td className="px-4 py-3 font-medium">OpenAI / Anthropic</td>
                    <td className="px-4 py-3">Modele LLM</td>
                    <td className="px-4 py-3">SUA (GDPR DPA)</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="mt-3 text-[13px] text-[var(--ink-3)]">Toți furnizorii din afara UE operează sub Standard Contractual Clauses (SCC) sau mecanisme echivalente de transfer internațional de date.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[var(--ink)] mb-3">Drepturile persoanelor vizate</h2>
            <p>Conform Art. 15-22 GDPR, ai dreptul la: <strong>acces, rectificare, ștergere, portabilitate, opoziție și restricționarea prelucrării</strong>.</p>
            <p className="mt-3">
              Exercită-ți drepturile scriind la{" "}
              <a href="mailto:contact@replacedbyai.ro" className="underline hover:opacity-70">contact@replacedbyai.ro</a>.
              Răspundem în maxim <strong>30 de zile calendaristice</strong>.
            </p>
            <p className="mt-3">
              Ai dreptul să depui plângere la <strong>ANSPDCP</strong>:{" "}
              <a href="https://www.dataprotection.ro" target="_blank" rel="noopener noreferrer" className="underline hover:opacity-70">www.dataprotection.ro</a> · Bd. Magheru 28-30, București.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[var(--ink)] mb-3">Notificarea incidentelor</h2>
            <p>În cazul unei breșe de securitate care prezintă risc pentru drepturile tale, vom notifica ANSPDCP în termen de <strong>72 de ore</strong> și te vom informa direct dacă riscul este ridicat.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[var(--ink)] mb-3">Contact</h2>
            <p>
              Orice solicitare GDPR:{" "}
              <a href="mailto:contact@replacedbyai.ro" className="underline hover:opacity-70">
                contact@replacedbyai.ro
              </a>
            </p>
          </section>

        </div>
      </article>
    </main>
  );
}
