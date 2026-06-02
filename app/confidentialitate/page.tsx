import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Politica de confidențialitate | ReplacedByAI",
  description: "Cum colectează, folosește și protejează ReplacedByAI datele tale personale, conform GDPR.",
  alternates: { canonical: "https://www.replacedbyai.ro/confidentialitate" },
  robots: { index: false, follow: false },
};

export default function PrivacyPage() {
  return (
    <main className="min-h-screen pt-32 pb-20 px-6">
      <article className="max-w-3xl mx-auto">
        <p className="eyebrow mb-4">Legal</p>
        <h1 className="h-display text-4xl md:text-5xl mb-4">Politica de confidențialitate</h1>
        <p className="text-[var(--ink-3)] text-sm mb-12">Ultima actualizare: 26 mai 2025</p>

        <div className="space-y-8 text-[15px] text-[var(--ink-2)] leading-relaxed">

          <section>
            <h2 className="text-xl font-semibold text-[var(--ink)] mb-3">1. Cine suntem</h2>
            <p><strong>ReplacedByAI</strong> este operatorul de date pentru informațiile colectate prin platforma <strong>www.replacedbyai.ro</strong>. Ne poți contacta la <a href="mailto:contact@replacedbyai.ro" className="underline hover:opacity-70">contact@replacedbyai.ro</a>.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[var(--ink)] mb-3">2. Ce date colectăm</h2>
            <p>Colectăm doar datele strict necesare pentru furnizarea serviciilor:</p>
            <ul className="list-disc ml-5 mt-2 space-y-1">
              <li><strong>Date de identificare:</strong> nume, prenume, denumire firmă, CUI</li>
              <li><strong>Date de contact:</strong> adresă email, număr de telefon</li>
              <li><strong>Date de business:</strong> informații despre procesele și serviciile firmei tale (formular onboarding)</li>
              <li><strong>Date tehnice:</strong> adresă IP (hash anonimizat), browser, pagini vizitate</li>
              <li><strong>Date de plată:</strong> procesate exclusiv prin Stripe — nu stocăm date de card</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[var(--ink)] mb-3">3. De ce colectăm aceste date</h2>
            <div className="space-y-3">
              <div className="p-4 rounded-xl bg-[var(--bg-2)] border border-[var(--border)]">
                <p className="font-medium text-[var(--ink)] mb-1">Executarea contractului</p>
                <p>Configurarea și livrarea agenților AI, suport tehnic, facturare.</p>
              </div>
              <div className="p-4 rounded-xl bg-[var(--bg-2)] border border-[var(--border)]">
                <p className="font-medium text-[var(--ink)] mb-1">Consimțământ explicit</p>
                <p>Comunicări comerciale și newsletter (poți retrage oricând consimțământul).</p>
              </div>
              <div className="p-4 rounded-xl bg-[var(--bg-2)] border border-[var(--border)]">
                <p className="font-medium text-[var(--ink)] mb-1">Obligație legală</p>
                <p>Arhivare fiscală și contabilă conform legislației române.</p>
              </div>
              <div className="p-4 rounded-xl bg-[var(--bg-2)] border border-[var(--border)]">
                <p className="font-medium text-[var(--ink)] mb-1">Interes legitim</p>
                <p>Securitatea platformei, prevenirea fraudei, îmbunătățirea serviciilor.</p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[var(--ink)] mb-3">4. Cât timp păstrăm datele</h2>
            <ul className="list-disc ml-5 space-y-1">
              <li><strong>Lead-uri (persoane care au completat formularul):</strong> maxim 24 luni de la ultimul contact</li>
              <li><strong>Date clienți activi:</strong> pe durata contractului</li>
              <li><strong>Date financiare și facturi:</strong> 10 ani (obligație legală)</li>
              <li><strong>Date tehnice (IP hash, logs):</strong> maxim 90 de zile</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[var(--ink)] mb-3">5. Cui transmitem datele</h2>
            <p>Nu vindem și nu închiriem date personale. Transmitem date exclusiv către:</p>
            <ul className="list-disc ml-5 mt-2 space-y-1">
              <li><strong>Vercel</strong> — hosting aplicație (SUA, certificat EU-US Data Privacy Framework)</li>
              <li><strong>Neon / Supabase</strong> — bază de date (servere în UE)</li>
              <li><strong>Resend</strong> — email tranzacțional (SUA, GDPR compliant)</li>
              <li><strong>Stripe</strong> — procesare plăți (certificat PCI DSS)</li>
              <li><strong>VAPI, ElevenLabs, OpenAI, Anthropic</strong> — procesare AI voce/text (date procesate, nestocate permanent)</li>
            </ul>
            <p className="mt-3">Toți sub-procesatorii sunt conformi GDPR și au semnat acorduri de prelucrare a datelor (DPA).</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[var(--ink)] mb-3">6. Cookies</h2>
            <p>Folosim exclusiv cookies tehnice strict necesare pentru:</p>
            <ul className="list-disc ml-5 mt-2 space-y-1">
              <li>Autentificare și menținerea sesiunii</li>
              <li>Securitate (protecție CSRF)</li>
            </ul>
            <p className="mt-3">Nu folosim cookies de tracking publicitar sau analitice de la terți (Google Analytics, Meta Pixel etc.).</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[var(--ink)] mb-3">7. Drepturile tale</h2>
            <p>Conform GDPR (Regulamentul UE 2016/679) ai următoarele drepturi:</p>
            <ul className="list-disc ml-5 mt-2 space-y-1">
              <li><strong>Acces</strong> — să afli ce date deținem despre tine</li>
              <li><strong>Rectificare</strong> — să corectezi date incorecte</li>
              <li><strong>Ștergere</strong> — „dreptul de a fi uitat"</li>
              <li><strong>Portabilitate</strong> — să primești datele într-un format structurat</li>
              <li><strong>Opoziție</strong> — să te opui prelucrării pe baza interesului legitim</li>
              <li><strong>Restricționare</strong> — să limitezi prelucrarea în anumite situații</li>
            </ul>
            <p className="mt-3">
              Trimite cererea la{" "}
              <a href="mailto:contact@replacedbyai.ro" className="underline hover:opacity-70">contact@replacedbyai.ro</a>.
              Răspundem în maxim <strong>30 de zile</strong>.
            </p>
            <p className="mt-3">Poți depune plângere și la <strong>ANSPDCP</strong> (Autoritatea Națională de Supraveghere a Prelucrării Datelor cu Caracter Personal) — <a href="https://www.dataprotection.ro" target="_blank" rel="noopener noreferrer" className="underline hover:opacity-70">dataprotection.ro</a>.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[var(--ink)] mb-3">8. Securitatea datelor</h2>
            <p>Aplicăm măsuri tehnice și organizatorice adecvate: criptare în tranzit (HTTPS/TLS), hash-uri pentru parole și IP-uri, acces restricționat la date, backup-uri regulate. În caz de incident de securitate care afectează datele tale, te vom notifica în maxim 72 ore.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[var(--ink)] mb-3">9. Modificări ale politicii</h2>
            <p>Putem actualiza această politică periodic. Modificările semnificative vor fi comunicate pe email cu minim 14 zile înainte de intrarea în vigoare.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[var(--ink)] mb-3">10. Contact</h2>
            <p>
              Pentru orice întrebare legată de prelucrarea datelor tale:{" "}
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
