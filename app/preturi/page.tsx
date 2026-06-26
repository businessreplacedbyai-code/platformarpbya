import Link from "next/link";
import { BUNDLES, INDUSTRY_BUNDLES, FREE_AUDIT, GUARANTEES } from "@/lib/pricing";

export const metadata = {
  title: "Prețuri — agenți AI instalați de noi | ReplacedByAI",
  description:
    "Noi instalăm agentul AI pe afacerea ta: setup unic + abonament lunar, în lei. Începi cu un audit și un demo gratuit, fără obligații.",
  alternates: { canonical: "https://www.replacedbyai.ro/preturi" },
  openGraph: {
    title: "Prețuri — agenți AI instalați de noi | ReplacedByAI",
    description: "Setup + abonament, în lei. Audit și demo gratuit ca să vezi rezultatul înainte să plătești.",
    url: "https://www.replacedbyai.ro/preturi",
    type: "website",
    images: [{ url: "https://www.replacedbyai.ro/opengraph-image", width: 1200, height: 630 }],
  },
};

function lei(n: number) {
  return n.toLocaleString("ro-RO");
}

export default function PreturiPage() {
  return (
    <main style={{ background: "var(--bg)", color: "var(--ink)" }}>
      {/* HERO */}
      <section className="pt-32 pb-10 px-6 text-center max-w-3xl mx-auto">
        <p className="text-[12px] uppercase tracking-[0.32em] mb-5" style={{ color: "var(--ink-3)" }}>Prețuri · instalat de noi</p>
        <h1 className="h-display text-4xl md:text-6xl tracking-tight">Noi îți instalăm agentul. Tu primești clienții.</h1>
        <p className="mt-5 text-[16px] md:text-[17px]" style={{ color: "var(--ink-2)" }}>
          Setup unic + abonament lunar, în lei. Fără să te atingi de nimic tehnic.
          Începi cu un <strong>audit și un demo gratuit</strong> — vezi rezultatul înainte să plătești ceva.
        </p>
        <Link href="/contact" className="inline-block mt-7 px-7 h-12 leading-[3rem] rounded-xl text-[14px] font-medium" style={{ background: "var(--ink)", color: "var(--bg-2)" }}>
          Cere audit + demo gratuit →
        </Link>
      </section>

      {/* FREE AUDIT band */}
      <section className="px-6 max-w-5xl mx-auto pb-4">
        <div className="rounded-3xl p-8 md:p-10" style={{ background: "var(--ink)", color: "var(--bg-2)" }}>
          <div className="grid md:grid-cols-2 gap-6 items-center">
            <div>
              <div className="inline-block text-[11px] uppercase tracking-[0.2em] px-2.5 py-1 rounded-full mb-3" style={{ background: "rgba(255,255,255,0.12)" }}>Gratuit · pasul 1</div>
              <h2 className="text-[24px] md:text-[30px] font-medium tracking-tight mb-2">{FREE_AUDIT.name}</h2>
              <p className="text-[14.5px] opacity-75 leading-relaxed">{FREE_AUDIT.tagline}</p>
            </div>
            <ul className="space-y-2.5">
              {FREE_AUDIT.includes.map((it) => (
                <li key={it} className="flex items-start gap-2.5 text-[14px] opacity-90">
                  <span className="mt-0.5">✓</span>{it}
                </li>
              ))}
            </ul>
          </div>
          <Link href="/contact" className="inline-block mt-7 px-6 h-12 leading-[3rem] rounded-xl text-[14px] font-medium" style={{ background: "var(--bg-2)", color: "var(--ink)" }}>
            Vreau auditul gratuit →
          </Link>
        </div>
      </section>

      {/* PACHETE done-for-you */}
      <section className="px-6 max-w-6xl mx-auto py-12">
        <div className="text-center mb-8">
          <h2 className="h-display text-3xl md:text-4xl mb-2">Pachete — instalat de noi</h2>
          <p className="text-[14px]" style={{ color: "var(--ink-3)" }}>Setup unic (cash, o singură dată) + abonament lunar. Anulezi oricând.</p>
        </div>
        <div className="grid md:grid-cols-3 gap-5">
          {BUNDLES.map((b) => (
            <div key={b.key} className="rounded-2xl p-6 flex flex-col" style={{ background: "var(--bg-2)", border: b.highlight ? "1.5px solid var(--ink)" : "1px solid var(--border)" }}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-[11px] uppercase tracking-[0.2em]" style={{ color: "var(--ink-3)" }}>{b.badge}</span>
                {b.highlight && <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full" style={{ background: "var(--ink)", color: "var(--bg-2)" }}>Popular</span>}
              </div>
              <div className="text-[20px] font-semibold tracking-tight">{b.name}</div>
              <div className="text-[12.5px] mb-4" style={{ color: "var(--ink-3)" }}>{b.audience}</div>
              <div className="mb-1">
                <span className="text-[34px] font-semibold tracking-tight">{lei(b.price)}</span>
                <span className="text-[14px]" style={{ color: "var(--ink-3)" }}> lei/lună</span>
              </div>
              <div className="text-[12px] mb-4" style={{ color: "var(--ink-3)" }}>+ {lei(b.setup)} lei setup (o dată)</div>
              <ul className="space-y-2 mb-6 flex-1">
                {b.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-[13px]" style={{ color: "var(--ink-1)" }}>
                    <span className="mt-0.5" style={{ color: "#1F9D55" }}>✓</span>{f}
                  </li>
                ))}
              </ul>
              <div className="text-[11.5px] mb-4" style={{ color: "var(--ink-3)" }}>{b.competitor}</div>
              <Link href="/contact" className="w-full h-11 rounded-xl grid place-items-center text-[13.5px] font-medium" style={{ background: b.highlight ? "var(--ink)" : "var(--bg-3)", color: b.highlight ? "var(--bg-2)" : "var(--ink)", border: b.highlight ? "none" : "1px solid var(--border)" }}>
                Cere ofertă
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* PACHETE PE INDUSTRIE */}
      <section className="px-6 max-w-5xl mx-auto pb-12">
        <h3 className="text-[15px] font-medium mb-4" style={{ color: "var(--ink-2)" }}>Pachete pe industrie — intrare accesibilă</h3>
        <div className="grid md:grid-cols-2 gap-4">
          {INDUSTRY_BUNDLES.map((b) => (
            <div key={b.key} className="rounded-2xl p-6" style={{ background: "var(--bg-2)", border: "1px solid var(--border)" }}>
              <div className="text-[11px] uppercase tracking-[0.2em] mb-1" style={{ color: "var(--ink-3)" }}>{b.category}</div>
              <div className="text-[17px] font-medium">{b.name}</div>
              <div className="text-[13px] mb-3" style={{ color: "var(--ink-3)" }}>{b.tagline}</div>
              <ul className="space-y-1.5 mb-4">
                {b.includes.map((it) => (
                  <li key={it} className="flex items-start gap-2 text-[13px]" style={{ color: "var(--ink-1)" }}>
                    <span className="mt-0.5" style={{ color: "#1F9D55" }}>✓</span>{it}
                  </li>
                ))}
              </ul>
              <div className="flex items-center justify-between">
                <div className="text-[14px]"><strong>{lei(b.price)} lei</strong>/lună <span style={{ color: "var(--ink-3)" }}>+ {lei(b.setup)} setup</span></div>
                <Link href="/contact" className="px-4 h-10 grid place-items-center rounded-lg text-[13px] font-medium" style={{ background: "var(--ink)", color: "var(--bg-2)" }}>Cere ofertă</Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* GARANȚII */}
      <section className="px-6 max-w-5xl mx-auto pb-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {GUARANTEES.map((g) => (
            <div key={g.title} className="rounded-2xl p-5" style={{ background: "var(--bg-2)", border: "1px solid var(--border)" }}>
              <div className="text-[14px] font-medium mb-1">{g.title}</div>
              <div className="text-[12.5px]" style={{ color: "var(--ink-3)" }}>{g.body}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Self-serve note + CTA final */}
      <section className="px-6 max-w-3xl mx-auto pb-24 text-center">
        <h2 className="h-display text-3xl md:text-4xl mb-4">Vezi întâi, plătești după.</h2>
        <p className="text-[15px] mb-7" style={{ color: "var(--ink-2)" }}>
          Cere auditul gratuit: îți arătăm câți clienți pierzi și un demo de agent pe afacerea ta. Fără obligații.
        </p>
        <Link href="/contact" className="inline-block px-8 h-14 leading-[3.5rem] rounded-xl text-[15px] font-medium" style={{ background: "var(--ink)", color: "var(--bg-2)" }}>
          Cere audit + demo gratuit →
        </Link>
      </section>
    </main>
  );
}
