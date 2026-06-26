import { CTAFinal } from "@/components/home/CTAFinal";

export const metadata = {
  title: "Rezultate — studii de caz și cifre din afaceri reale",
  description:
    "Cifre măsurate la clienții ReplacedByAI: apeluri preluate, no-show redus, lead-uri calificate, costuri salvate. Doar rezultate verificate, fără promisiuni goale.",
  alternates: { canonical: "https://www.replacedbyai.ro/rezultate" },
};

export default function RezultatePage() {
  return (
    <>
      <section className="pt-40 pb-4 px-6 max-w-6xl mx-auto">
        <div className="max-w-3xl">
          <p className="eyebrow mb-4">Rezultate</p>
          <h1 className="h-display text-5xl md:text-7xl mb-6">
            Cifre reale. <br />
            <span className="gradient-text">Afaceri reale.</span>
          </h1>
          <p className="text-lg md:text-xl text-[var(--ink-2)]">
            Nu vindem teorie. Vindem rezultate măsurate lunar la clienții noștri.
          </p>
        </div>
      </section>

      <section className="px-6 max-w-4xl mx-auto py-20">
        <div className="rounded-3xl border border-[var(--border)] bg-[var(--bg-2)] p-10 md:p-16 text-center">
          <p className="eyebrow mb-4">În curând</p>
          <h2 className="h-display text-3xl md:text-5xl mb-6">
            Primele studii de caz <span className="gradient-text">vin în scurt timp.</span>
          </h2>
          <p className="text-[var(--ink-2)] max-w-xl mx-auto mb-8 leading-relaxed">
            Primii clienți își pornesc agenții și site-urile din platformă. Imediat ce avem
            rezultate verificate, le publicăm aici — fără mockup-uri, fără cifre
            inventate.
          </p>
          <a
            href="/contact"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[var(--ink)] text-[var(--bg-2)] text-[15px] font-medium hover:-translate-y-0.5 transition-all"
          >
            Vrei să fii primul studiu de caz? →
          </a>
        </div>
      </section>

      <CTAFinal />
    </>
  );
}
