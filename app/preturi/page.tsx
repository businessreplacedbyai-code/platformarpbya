import Link from "next/link";
import {
  BUNDLES,
  INDUSTRY_BUNDLES,
  AGENT_PRICES,
  GUARANTEES,
  DISCOUNTS,
  PILOT_OFFER,
} from "@/lib/pricing";

export const metadata = {
  title: "Prețuri agenți AI — Growth, Scale, Enterprise | ReplacedByAI",
  description:
    "Prețuri transparente pentru agenți AI: Growth de la €249/lună, Scale €499/lună, Enterprise €1.200/lună. Fără costuri ascunse. Garanție 30 de zile sau bani înapoi.",
  alternates: { canonical: "https://www.replacedbyai.ro/preturi" },
  openGraph: {
    title: "Prețuri agenți AI | ReplacedByAI",
    description: "Pachete clare în EUR pentru afaceri din România. Growth €249, Scale €499, Enterprise €1.200. Garanție 30 zile.",
    url: "https://www.replacedbyai.ro/preturi",
    type: "website",
    images: [{ url: "https://www.replacedbyai.ro/opengraph-image", width: 1200, height: 630 }],
  },
};

export default function PreturiPage() {
  return (
    <main style={{ background: "var(--bg)", color: "var(--ink)" }}>
      {/* HERO */}
      <section className="pt-32 pb-14 px-6 text-center max-w-3xl mx-auto">
        <p
          className="text-[12px] uppercase tracking-[0.32em] mb-5"
          style={{ color: "var(--ink-3)" }}
        >
          Prețuri · 2026
        </p>
        <h1 className="h-display text-4xl md:text-6xl tracking-tight">
          Trei pachete. Zero surprize.
        </h1>
        <p
          className="mt-5 text-[16px] md:text-[17px]"
          style={{ color: "var(--ink-2)" }}
        >
          Pentru afaceri serioase din România — clinici private, firme B2B,
          agenții, lanțuri. Concurența cere €400-5.000/lună. Noi pornim de la{" "}
          <strong>€249</strong>.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-2 mt-7 text-[12.5px]">
          {GUARANTEES.map((g) => (
            <span
              key={g.title}
              className="px-3 py-1.5 rounded-full"
              style={{
                background: "var(--bg-3)",
                color: "var(--ink-1)",
                border: "1px solid var(--border)",
              }}
            >
              ✓ {g.title}
            </span>
          ))}
        </div>
      </section>

      {/* PILOT BAND — start fără risc */}
      <section className="px-6 pb-14 max-w-5xl mx-auto">
        <div
          className="rounded-3xl p-8 md:p-10 flex flex-col md:flex-row items-center gap-8"
          style={{
            background: "var(--ink)",
            color: "var(--bg)",
            backgroundImage:
              "radial-gradient(60% 80% at 100% 0%, rgba(230,201,163,0.16) 0%, transparent 60%)",
          }}
        >
          <div className="flex-1">
            <span className="text-[10px] uppercase tracking-[0.22em] opacity-60 mb-3 block">
              Începe fără risc
            </span>
            <h2 className="text-[26px] md:text-[32px] font-medium tracking-tight mb-2">
              {PILOT_OFFER.name} — un agent AI, live în 48h
            </h2>
            <p className="text-[14px] opacity-70 max-w-lg leading-relaxed mb-4">
              {PILOT_OFFER.tagline}
            </p>
            <ul className="flex flex-wrap gap-x-5 gap-y-1.5">
              {PILOT_OFFER.includes.map((i) => (
                <li key={i} className="text-[12.5px] opacity-80 flex items-center gap-1.5">
                  <span style={{ color: "#E6C9A3" }}>→</span> {i}
                </li>
              ))}
            </ul>
          </div>
          <div className="shrink-0 text-center">
            <div className="flex items-baseline justify-center gap-1 mb-1">
              <span className="text-[56px] font-semibold tracking-tight">€{PILOT_OFFER.price}</span>
            </div>
            <div className="text-[12px] opacity-55 mb-4">
              o singură plată · {PILOT_OFFER.durationDays} zile
            </div>
            <Link
              href="/contact?pilot=1"
              className="inline-block h-12 px-8 rounded-xl grid place-items-center text-[14px] font-medium leading-[3rem]"
              style={{ background: "var(--bg)", color: "var(--ink)" }}
            >
              Pornește pilotul →
            </Link>
          </div>
        </div>
      </section>

      {/* MAIN BUNDLES */}
      <section className="px-6 pb-16 max-w-6xl mx-auto">
        <p
          className="text-[12px] uppercase tracking-[0.28em] mb-5"
          style={{ color: "var(--ink-3)" }}
        >
          Pachete principale
        </p>
        <div className="grid md:grid-cols-3 gap-5">
          {BUNDLES.map((b) => (
            <div
              key={b.key}
              className="rounded-3xl p-7 flex flex-col"
              style={{
                background: b.highlight ? "var(--ink)" : "var(--bg-2)",
                color: b.highlight ? "var(--bg)" : "var(--ink)",
                border: b.highlight
                  ? "none"
                  : "1px solid var(--border)",
                position: "relative",
              }}
            >
              <span
                className="self-start text-[10px] uppercase tracking-[0.18em] px-2.5 py-1 rounded-full mb-4"
                style={{
                  background: b.highlight
                    ? "rgba(255,255,255,0.12)"
                    : "var(--bg-3)",
                  color: b.highlight
                    ? "var(--bg)"
                    : "var(--ink-2)",
                }}
              >
                {b.badge}
              </span>
              <div className="text-[22px] font-medium tracking-tight">
                {b.name}
              </div>
              <div
                className="text-[12.5px] mt-1 mb-5"
                style={{
                  color: b.highlight
                    ? "rgba(255,255,255,0.65)"
                    : "var(--ink-3)",
                }}
              >
                {b.audience}
              </div>

              <div className="mb-1">
                <span className="text-[42px] font-semibold tracking-tight">
                  €{b.price.toLocaleString("ro-RO")}
                </span>
                <span
                  className="text-[15px]"
                  style={{
                    color: b.highlight
                      ? "rgba(255,255,255,0.65)"
                      : "var(--ink-3)",
                  }}
                >
                  {" "}
                  /lună
                </span>
              </div>
              <div
                className="text-[12px] mb-5"
                style={{
                  color: b.highlight
                    ? "rgba(255,255,255,0.55)"
                    : "var(--ink-3)",
                }}
              >
                + €{b.setup} setup one-time
              </div>

              <ul className="space-y-2.5 mb-6 flex-1">
                {b.features.map((f) => (
                  <li
                    key={f}
                    className="flex items-start gap-2 text-[13px]"
                  >
                    <span
                      style={{
                        color: b.highlight
                          ? "rgba(255,255,255,0.7)"
                          : "var(--ink-2)",
                      }}
                    >
                      →
                    </span>
                    {f}
                  </li>
                ))}
              </ul>

              <div
                className="text-[11.5px] mb-5 px-3 py-2 rounded-lg"
                style={{
                  background: b.highlight
                    ? "rgba(255,255,255,0.08)"
                    : "var(--bg-3)",
                  color: b.highlight
                    ? "rgba(255,255,255,0.7)"
                    : "var(--ink-3)",
                }}
              >
                Concurența: <strong>{b.competitor}</strong>
              </div>

              <Link
                href="/contact"
                className="h-11 rounded-xl grid place-items-center text-[13px] font-medium"
                style={{
                  background: b.highlight ? "var(--bg)" : "var(--ink)",
                  color: b.highlight ? "var(--ink)" : "var(--bg)",
                }}
              >
                Începe cu {b.name} →
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* WEBSITE PREMIUM BANNER */}
      <section className="px-6 pb-10 max-w-6xl mx-auto">
        <div
          className="rounded-3xl p-8 md:p-10 flex flex-col md:flex-row items-center justify-between gap-6"
          style={{ background: "var(--ink)", color: "var(--bg)" }}
        >
          <div>
            <span className="text-[10px] uppercase tracking-[0.22em] opacity-60 mb-3 block">
              Serviciu nou
            </span>
            <h3 className="text-[22px] md:text-[26px] font-medium tracking-tight mb-2">
              Site-uri premium cu animații 3D
            </h3>
            <p className="text-[14px] opacity-65 max-w-lg leading-relaxed">
              Design unic, WebGL, Three.js — site-uri care transformă vizitatorii în clienți. De la €299 one-time.
            </p>
          </div>
          <Link
            href="/website-premium"
            className="shrink-0 h-12 px-7 rounded-xl grid place-items-center text-[14px] font-medium whitespace-nowrap"
            style={{ background: "var(--bg)", color: "var(--ink)" }}
          >
            Vezi pachete →
          </Link>
        </div>
      </section>

      {/* INDUSTRY BUNDLES */}
      <section
        className="px-6 py-14"
        style={{ background: "var(--bg-2)" }}
      >
        <div className="max-w-5xl mx-auto">
          <p
            className="text-[12px] uppercase tracking-[0.28em] mb-2"
            style={{ color: "var(--ink-3)" }}
          >
            Pachete pe industrie
          </p>
          <h2 className="h-display text-2xl md:text-3xl tracking-tight mb-8">
            Entry point mai accesibil — pentru businessul tău specific
          </h2>
          <div className="grid md:grid-cols-2 gap-5">
            {INDUSTRY_BUNDLES.map((b) => (
              <div
                key={b.key}
                className="rounded-3xl p-7"
                style={{
                  background: "var(--bg)",
                  border: "1px solid var(--border)",
                }}
              >
                <span
                  className="text-[11px] uppercase tracking-[0.18em] px-2.5 py-1 rounded-full"
                  style={{
                    background: "var(--accent-soft, var(--bg-3))",
                    color: "var(--accent, var(--ink-1))",
                  }}
                >
                  {b.category}
                </span>
                <div className="text-[22px] font-medium tracking-tight mt-4">
                  {b.name}
                </div>
                <div
                  className="text-[13px] mt-1 mb-5"
                  style={{ color: "var(--ink-3)" }}
                >
                  {b.tagline}
                </div>
                <div className="mb-1">
                  <span className="text-[42px] font-semibold tracking-tight">
                    €{b.price}
                  </span>
                  <span
                    className="text-[15px]"
                    style={{ color: "var(--ink-3)" }}
                  >
                    {" "}
                    /lună
                  </span>
                </div>
                <div
                  className="text-[12px] mb-5"
                  style={{ color: "var(--ink-3)" }}
                >
                  + €{b.setup} setup
                </div>
                <ul className="space-y-2 mb-2">
                  {b.includes.map((i) => (
                    <li
                      key={i}
                      className="flex items-start gap-2 text-[13px]"
                      style={{ color: "var(--ink-1)" }}
                    >
                      <span style={{ color: "var(--ink-2)" }}>→</span>
                      {i}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* INDIVIDUAL AGENTS */}
      <section className="px-6 py-16 max-w-6xl mx-auto">
        <p
          className="text-[12px] uppercase tracking-[0.28em] mb-2"
          style={{ color: "var(--ink-3)" }}
        >
          Agenți individuali
        </p>
        <h2 className="h-display text-2xl md:text-3xl tracking-tight mb-2">
          Pentru clienți care vor un singur serviciu
        </h2>
        <p
          className="text-[14px] mb-8"
          style={{ color: "var(--ink-3)" }}
        >
          Plătești doar agentul care îți trebuie. Combinabili oricând.
        </p>

        <div
          className="rounded-2xl overflow-hidden"
          style={{ border: "1px solid var(--border)" }}
        >
          {/* Table header */}
          <div
            className="grid grid-cols-[2fr_1fr_1fr_2.5fr] gap-4 px-6 py-3 text-[11px] uppercase tracking-[0.18em]"
            style={{
              background: "var(--bg-3)",
              color: "var(--ink-3)",
            }}
          >
            <span>Agent</span>
            <span>Preț/lună</span>
            <span>Setup</span>
            <span>Cel mai bun pentru</span>
          </div>
          {AGENT_PRICES.map((a, i) => (
            <div
              key={a.slug}
              className="grid grid-cols-[2fr_1fr_1fr_2.5fr] gap-4 px-6 py-4 items-baseline text-[14px]"
              style={{
                background: "var(--bg-2)",
                borderTop: i > 0 ? "1px solid var(--border)" : "none",
              }}
            >
              <div>
                <Link
                  href={`/agenti/${a.slug}`}
                  className="font-medium hover:underline"
                  style={{ color: "var(--ink)" }}
                >
                  {a.name}
                </Link>
                <div
                  className="text-[12px] mt-0.5"
                  style={{ color: "var(--ink-3)" }}
                >
                  {a.role}
                </div>
              </div>
              <div className="font-medium">€{a.monthly}</div>
              <div style={{ color: "var(--ink-2)" }}>€{a.setup}</div>
              <div
                className="text-[13px]"
                style={{ color: "var(--ink-2)" }}
              >
                {a.bestFor}
              </div>
            </div>
          ))}
        </div>

        <p
          className="text-[12px] mt-5 text-center"
          style={{ color: "var(--ink-3)" }}
        >
          Plată anuală: <strong>−€{DISCOUNTS.annualMonthly}/lună</strong> ·
          Fără opțiune anulare: <strong>−{DISCOUNTS.noCancelPct}%</strong>
        </p>
      </section>

      {/* CTA */}
      <section className="px-6 py-20 text-center">
        <h2 className="h-display text-3xl md:text-5xl tracking-tight">
          Nu ești sigur ce pachet ți se potrivește?
        </h2>
        <p
          className="mt-4 text-[15px] max-w-xl mx-auto"
          style={{ color: "var(--ink-2)" }}
        >
          Programează 20 minute. Îți recomandăm exact ce ai nevoie — fără
          presiune.
        </p>
        <Link
          href="/contact"
          className="inline-block mt-8 px-8 h-14 leading-[3.5rem] rounded-xl text-[15px] font-medium"
          style={{ background: "var(--ink)", color: "var(--bg)" }}
        >
          Programează discuție gratuită →
        </Link>
      </section>
    </main>
  );
}
