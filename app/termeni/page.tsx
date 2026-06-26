import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Termeni și condiții | ReplacedByAI",
  description: "Termenii și condițiile de utilizare ale serviciilor ReplacedByAI — agenți AI pentru afaceri din România.",
  alternates: { canonical: "https://www.replacedbyai.ro/termeni" },
  robots: { index: false, follow: false },
};

export default function TermsPage() {
  return (
    <main className="min-h-screen pt-32 pb-20 px-6">
      <article className="max-w-3xl mx-auto">
        <p className="eyebrow mb-4">Legal</p>
        <h1 className="h-display text-4xl md:text-5xl mb-4">Termeni și condiții</h1>
        <p className="text-[var(--ink-3)] text-sm mb-12">Ultima actualizare: 26 mai 2025</p>

        <div className="space-y-8 text-[15px] text-[var(--ink-2)] leading-relaxed">

          <section>
            <h2 className="text-xl font-semibold text-[var(--ink)] mb-3">1. Părțile contractante</h2>
            <p>Prezentul document reglementează relația dintre <strong>ReplacedByAI</strong> (denumit în continuare „Prestatorul") și orice persoană fizică sau juridică (denumită „Clientul") care utilizează serviciile oferite prin platforma <strong>www.replacedbyai.ro</strong>.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[var(--ink)] mb-3">2. Descrierea serviciilor</h2>
            <p>ReplacedByAI oferă implementarea și gestionarea de agenți AI pentru automatizarea proceselor de business, inclusiv dar fără a se limita la: agenți vocali, chatbots, agenți de programări, vânzări, suport clienți și social media. Specificațiile tehnice și comerciale ale fiecărui serviciu sunt detaliate în propunerea comercială individuală.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[var(--ink)] mb-3">3. Accesul la servicii</h2>
            <p>Accesul la platformă devine activ după:</p>
            <ul className="list-disc ml-5 mt-2 space-y-1">
              <li>Crearea contului (cu email și parolă sau cu Google)</li>
              <li>Activarea unui plan plătit sau a perioadei de trial gratuit</li>
            </ul>
            <p className="mt-3">Accesul la contul client se face prin credențialele alese la înregistrare. Clientul este responsabil pentru păstrarea confidențialității datelor de autentificare.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[var(--ink)] mb-3">4. Prețuri și plată</h2>
            <p>Prețurile planurilor sunt exprimate în USD și se achită online, în avans, prin procesatorul de plăți (Stripe). Factura fiscală se emite în RON, la cursul BNR din ziua emiterii, și se transmite prin e-Factura. Plata se face la momentul abonării.</p>
            <p className="mt-3">Abonamentele se reînnoiesc automat (lunar sau anual, în funcție de plan) până la anularea de către Client din contul propriu. Anularea oprește reînnoirea de la următoarea perioadă; perioada deja plătită rămâne activă.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[var(--ink)] mb-3">5. Audit gratuit și anulare</h2>
            <p>Înainte de a începe, oferim un <strong>audit și un demo gratuit</strong>, fără obligații. După contractare, anularea se face oricând prin notificare; serviciul rămâne activ până la finalul perioadei deja plătite. Nu există contract pe termen lung forțat.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[var(--ink)] mb-3">6. Obligațiile Clientului</h2>
            <ul className="list-disc ml-5 space-y-1">
              <li>Să furnizeze informații corecte și complete în formularul de onboarding</li>
              <li>Să asigure accesul tehnic necesar integrărilor (calendar, CRM, telefonie)</li>
              <li>Să nu utilizeze serviciile în scopuri ilegale sau care contravin bunelor practici</li>
              <li>Să notifice Prestatorul cu privire la orice problemă tehnică în termen de 48 ore</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[var(--ink)] mb-3">7. Proprietate intelectuală</h2>
            <p>Prompturile, fluxurile de lucru, configurațiile și know-how-ul tehnic dezvoltat de ReplacedByAI rămân proprietatea intelectuală a Prestatorului. Clientul primește un drept de utilizare neexclusiv pe durata contractului.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[var(--ink)] mb-3">8. Limitarea răspunderii</h2>
            <p>ReplacedByAI nu răspunde pentru pierderi indirecte, pierderea de profit sau date, cauzate de utilizarea sau indisponibilitatea temporară a serviciilor. Răspunderea totală a Prestatorului este limitată la valoarea totală plătită de Client în ultimele <strong>3 luni</strong> calendaristice.</p>
            <p className="mt-3">Serviciile AI pot genera răspunsuri imperfecte. Clientul este responsabil pentru supervizarea și validarea rezultatelor critice.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[var(--ink)] mb-3">9. Confidențialitate</h2>
            <p>Ambele părți se obligă să păstreze confidențialitatea informațiilor comerciale și tehnice la care au acces în cadrul colaborării, atât pe durata contractului cât și 2 ani după încetarea acestuia.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[var(--ink)] mb-3">10. Reziliere</h2>
            <p>Contractul poate fi reziliat de oricare dintre părți cu un preaviz de <strong>30 de zile</strong>, transmis în scris pe email. În caz de încălcare gravă a termenilor, Prestatorul poate suspenda imediat accesul la servicii.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[var(--ink)] mb-3">11. Legea aplicabilă</h2>
            <p>Prezentul contract este guvernat de legislația română. Orice litigiu se va soluționa amiabil, iar în caz de eșec, de instanțele competente din România.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[var(--ink)] mb-3">12. Contact</h2>
            <p>
              Pentru orice întrebări legate de acești termeni:{" "}
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
