import { CTAFinal } from "@/components/home/CTAFinal";

export const metadata = {
  title: "Despre noi — cine suntem și de ce existam",
  description:
    "ReplacedByAI este agenția AI din România care construiește angajați artificiali pentru IMM-uri. Misiune, valori și viziune — automatizare AI pentru afaceri românești.",
  alternates: { canonical: "https://www.replacedbyai.ro/despre" },
};

const values = [
  {
    num: "01",
    title: "Construim, nu consultăm",
    body: "Nu vindem PowerPoint-uri. Implementăm agenți care lucrează de a doua zi.",
  },
  {
    num: "02",
    title: "Rezultate sau bani înapoi",
    body: "Dacă nu vedem îmbunătățiri în 30 de zile, nu plătești nimic.",
  },
  {
    num: "03",
    title: "AI etic, date sigure",
    body: "Servere în Europa, GDPR compliant. Datele tale nu antrenează niciun model.",
  },
];

export default function DesprePage() {
  return (
    <>
      <section className="pt-40 pb-20 px-6 max-w-5xl mx-auto">
        <p className="eyebrow mb-4">Despre noi</p>
        <h1 className="h-display text-5xl md:text-7xl mb-8">
          Înlocuim angajații. <br />
          Și suntem <span className="gradient-text">mândri</span> de asta.
        </h1>
        <div className="space-y-6 text-lg md:text-xl text-[var(--ink-1)] leading-relaxed max-w-3xl">
          <p>
            ReplacedByAI a apărut dintr-o frustrare simplă: prea mulți antreprenori
            români pierd timp, bani și clienți pentru că nu au cum să fie peste tot
            în același timp.
          </p>
          <p>
            Am început să construim agenți AI în 2024. Implementăm agenți
            personalizați pentru afaceri din România — de la restaurante și clinici
            la magazine online și firme de servicii.
          </p>
          <p className="text-[var(--ink-2)]">
            Misiunea noastră: să facem din fiecare IMM din România o companie care
            funcționează ca un brand global — fără să angajezi 50 de oameni.
          </p>
        </div>
      </section>

      <section className="px-6 max-w-6xl mx-auto py-20 border-t border-[var(--border)]">
        <h2 className="h-display text-3xl md:text-5xl mb-12">
          Cum <span className="gradient-text">gândim</span>
        </h2>
        <div className="grid md:grid-cols-3 gap-3">
          {values.map((v) => (
            <div
              key={v.num}
              className="rounded-2xl border border-[var(--border)] bg-[var(--bg-2)] p-7"
            >
              <div className="text-[13px] text-[var(--ink-3)] font-mono mb-4">{v.num}</div>
              <h3 className="h-display-sm text-xl mb-3">{v.title}</h3>
              <p className="text-[var(--ink-2)] leading-relaxed text-[14.5px]">{v.body}</p>
            </div>
          ))}
        </div>
      </section>

      <CTAFinal />
    </>
  );
}
