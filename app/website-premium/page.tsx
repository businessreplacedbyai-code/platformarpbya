"use client";
import Link from "next/link";
import { motion } from "framer-motion";
import { Check, ArrowRight, Globe, Zap, Box, Sparkles, Code2, Layers } from "lucide-react";

const PACKAGES = [
  {
    key: "PRESENCE",
    badge: "Esențial",
    name: "Presence",
    tagline: "Primul tău site profesional",
    price: 299,
    monthly: 29,
    highlight: false,
    features: [
      "Design custom — zero template",
      "Animații de scroll fluide",
      "Mobil 100% optimizat",
      "SEO tehnic complet",
      "Formulare de contact + lead capture",
      "Hosting + domeniu 1 an inclus",
      "Livrare în 7 zile",
    ],
    notIncluded: ["Animații 3D", "Three.js / WebGL"],
  },
  {
    key: "EXPERIENCE",
    badge: "Cel mai ales",
    name: "Experience",
    tagline: "Site cu animații 3D profesionale",
    price: 599,
    monthly: 49,
    highlight: true,
    features: [
      "Tot ce include Presence",
      "Animații 3D custom (Three.js / WebGL)",
      "Scroll storytelling — fiecare secție trăiește",
      "Particule și efecte de lumini 3D",
      "Loading screen animat cu logo-ul tău",
      "Integrare Google Analytics 4",
      "CMS pentru editare ușoară a conținutului",
      "Livrare în 14 zile",
    ],
    notIncluded: [],
  },
  {
    key: "IDENTITY",
    badge: "Premium",
    name: "Identity",
    tagline: "Identitate digitală completă",
    price: 999,
    monthly: 69,
    highlight: false,
    features: [
      "Tot ce include Experience",
      "Branding complet (logo + culori + fonturi)",
      "Pagini multiple (până la 10 pagini)",
      "3D product showcase interactiv",
      "Animații cursor custom",
      "Conexiune CRM / newsletter",
      "Raport lunar performanță",
      "Suport prioritar 12 luni",
      "Livrare în 21 zile",
    ],
    notIncluded: [],
  },
  {
    key: "PLATFORM",
    badge: "Magazine & Platforme",
    name: "Platform",
    tagline: "Magazin online sau platformă digitală custom",
    price: 1500,
    monthly: 99,
    highlight: false,
    features: [
      "Magazin online complet (e-commerce)",
      "Coș, checkout, plăți cu cardul (Stripe)",
      "Catalog produse + gestiune stoc",
      "Conturi clienți + comenzi + facturare automată",
      "Panou de administrare ușor de folosit",
      "Integrare curieri, e-Factura, marketing",
      "Platforme custom (booking, SaaS, dashboard-uri)",
      "Scalabil — crește odată cu afacerea ta",
    ],
    notIncluded: [],
  },
];

const FEATURES = [
  {
    icon: Box,
    title: "3D Nativ în Browser",
    desc: "Three.js și WebGL — animații 3D reale, nu GIF-uri. Funcționează pe orice dispozitiv modern.",
  },
  {
    icon: Zap,
    title: "Performanță 100/100",
    desc: "Google PageSpeed perfect. Animațiile 3D nu încetinesc site-ul — știm cum se optimizează.",
  },
  {
    icon: Sparkles,
    title: "Design Unic Garantat",
    desc: "Zero template-uri. Fiecare pixel e gândit pentru brandul tău. Nu vei vedea site-ul tău la altcineva.",
  },
  {
    icon: Layers,
    title: "Scroll Storytelling",
    desc: "Povestea brandului tău se desfășoară pe măsură ce utilizatorul scrollează. Imersiv, memorabil.",
  },
  {
    icon: Globe,
    title: "SEO + Vizibilitate",
    desc: "Site-ul arată bine și în Google. Structură semantică, meta-taguri, sitemap, schema.org.",
  },
  {
    icon: Code2,
    title: "Next.js / React",
    desc: "Tehnologie de top — aceeași platformă folosită de Vercel, Linear, Loom. Scalabilă oricând.",
  },
  {
    icon: Box,
    title: "Magazine & Platforme digitale",
    desc: "Nu doar site-uri de prezentare — construim magazine online complete și platforme custom (e-commerce, booking, SaaS) cu plăți, conturi și administrare ușoară.",
  },
];

const EXAMPLES = [
  { label: "Agenție imobiliară", effect: "Tur virtual 3D al proprietăților" },
  { label: "Clinică privată", effect: "Animație anatomică 3D a specialităților" },
  { label: "Restaurant premium", effect: "Meniu 3D cu rotație de preparate" },
  { label: "Firmă B2B", effect: "Dashboard animat cu statistici live" },
  { label: "Studio foto / video", effect: "Portfolio cu tranziții cinematice" },
  { label: "Startup tech", effect: "Product demo 3D interactiv" },
];

export default function WebsitePremiumPage() {
  return (
    <main style={{ background: "var(--bg)", color: "var(--ink)" }}>

      {/* HERO */}
      <section className="relative pt-40 pb-24 px-6 text-center overflow-hidden">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[600px] opacity-[0.07]"
            style={{ background: "radial-gradient(ellipse at center top, var(--accent), transparent 65%)" }} />
        </div>
        <div className="relative max-w-4xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[11px] uppercase tracking-[0.28em] mb-8 border"
              style={{ color: "var(--ink-3)", borderColor: "var(--border)" }}>
              Nou · Site-uri Premium 3D
            </span>
            <h1 className="h-display text-5xl md:text-7xl tracking-tight mb-6 leading-[1.02]">
              Site-ul tău nu trebuie<br />
              să arate ca <span className="gradient-text">al tuturor.</span>
            </h1>
            <p className="text-[17px] md:text-xl max-w-2xl mx-auto leading-relaxed mb-10"
              style={{ color: "var(--ink-2)" }}>
              Creăm site-uri cu animații 3D profesionale care transformă vizitatorii în clienți.
              Design unic, performanță maximă, livrare rapidă.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/contact" className="btn btn-primary px-7 py-3.5 text-[15px] flex items-center gap-2">
                Vreau un site premium <ArrowRight size={16} />
              </Link>
              <Link href="#pachete" className="btn btn-secondary px-7 py-3.5 text-[15px]">
                Vezi pachete & prețuri
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* FEATURES GRID */}
      <section className="px-6 py-20" style={{ background: "var(--bg-2)" }}>
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <p className="eyebrow mb-4">Ce primești</p>
            <h2 className="h-display text-3xl md:text-5xl">
              Nu vindem site-uri.<br />
              <span className="gradient-text">Vindem experiențe.</span>
            </h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {FEATURES.map((f, i) => {
              const Icon = f.icon;
              return (
                <motion.div key={f.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{ duration: 0.5, delay: i * 0.07 }}
                  className="rounded-2xl p-7 border"
                  style={{ background: "var(--bg)", borderColor: "var(--border)" }}>
                  <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-5"
                    style={{ background: "var(--bg-3)" }}>
                    <Icon size={20} style={{ color: "var(--ink-1)" }} />
                  </div>
                  <h3 className="text-[16px] font-medium mb-2">{f.title}</h3>
                  <p className="text-[14px] leading-relaxed" style={{ color: "var(--ink-3)" }}>{f.desc}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* EXAMPLES */}
      <section className="px-6 py-20">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <p className="eyebrow mb-4">Exemple de implementare</p>
            <h2 className="h-display text-3xl md:text-4xl">Cum arată 3D în industria ta</h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {EXAMPLES.map((e, i) => (
              <motion.div key={e.label}
                initial={{ opacity: 0, scale: 0.97 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.06 }}
                className="rounded-2xl p-6 border"
                style={{ background: "var(--bg-2)", borderColor: "var(--border)" }}>
                <div className="text-[12px] uppercase tracking-[0.2em] mb-3" style={{ color: "var(--ink-3)" }}>
                  {e.label}
                </div>
                <div className="text-[15px] font-medium leading-snug">{e.effect}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* PACKAGES */}
      <section id="pachete" className="px-6 py-24" style={{ background: "var(--bg-2)" }}>
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <p className="eyebrow mb-4">Pachete & prețuri</p>
            <h2 className="h-display text-3xl md:text-5xl mb-4">
              Investiție clară.<br />
              <span className="gradient-text">Rezultat garantat.</span>
            </h2>
            <p className="text-[15px]" style={{ color: "var(--ink-2)" }}>
              Prețuri one-time + mentenanță lunară opțională. Fără abonamente forțate.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {PACKAGES.map((p, i) => (
              <motion.div key={p.key}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="rounded-3xl p-8 flex flex-col"
                style={{
                  background: p.highlight ? "var(--ink)" : "var(--bg)",
                  color: p.highlight ? "var(--bg)" : "var(--ink)",
                  border: p.highlight ? "none" : "1px solid var(--border)",
                }}>
                <span className="self-start text-[10px] uppercase tracking-[0.2em] px-3 py-1 rounded-full mb-5"
                  style={{
                    background: p.highlight ? "rgba(255,255,255,0.12)" : "var(--bg-3)",
                    color: p.highlight ? "rgba(255,255,255,0.85)" : "var(--ink-2)",
                  }}>
                  {p.badge}
                </span>
                <div className="text-[22px] font-medium tracking-tight">{p.name}</div>
                <div className="text-[13px] mb-6" style={{ color: p.highlight ? "rgba(255,255,255,0.55)" : "var(--ink-3)" }}>
                  {p.tagline}
                </div>
                <div className="mb-1">
                  <span className="text-[44px] font-semibold tracking-tight">€{p.price.toLocaleString("ro-RO")}</span>
                  <span className="text-[15px] ml-1" style={{ color: p.highlight ? "rgba(255,255,255,0.55)" : "var(--ink-3)" }}>
                    one-time
                  </span>
                </div>
                <div className="text-[12px] mb-7" style={{ color: p.highlight ? "rgba(255,255,255,0.45)" : "var(--ink-3)" }}>
                  + €{p.monthly}/lună mentenanță opțională
                </div>
                <ul className="space-y-2.5 mb-8 flex-1">
                  {p.features.map((f) => (
                    <li key={f} className="flex items-start gap-2.5 text-[13.5px]">
                      <Check size={14} className="mt-0.5 shrink-0" style={{ color: p.highlight ? "rgba(255,255,255,0.7)" : "var(--ink-2)" }} />
                      <span style={{ color: p.highlight ? "rgba(255,255,255,0.85)" : "var(--ink-1)" }}>{f}</span>
                    </li>
                  ))}
                </ul>
                <Link href="/contact"
                  className="h-12 rounded-xl grid place-items-center text-[14px] font-medium transition-opacity hover:opacity-90"
                  style={{
                    background: p.highlight ? "var(--bg)" : "var(--ink)",
                    color: p.highlight ? "var(--ink)" : "var(--bg)",
                  }}>
                  Vreau {p.name} →
                </Link>
              </motion.div>
            ))}
          </div>

          <p className="text-center text-[12.5px] mt-8" style={{ color: "var(--ink-3)" }}>
            Prețurile nu includ TVA. Plata se face 50% la comandă, 50% la livrare.
          </p>
        </div>
      </section>

      {/* CTA FINAL */}
      <section className="px-6 py-28 text-center">
        <div className="max-w-2xl mx-auto">
          <h2 className="h-display text-4xl md:text-5xl mb-5">
            Gata să ieși<br />
            <span className="gradient-text">din mulțime?</span>
          </h2>
          <p className="text-[16px] mb-10" style={{ color: "var(--ink-2)" }}>
            Discuție gratuită de 20 minute. Îți arătăm exemple din industria ta și stabilim împreună ce pachet ți se potrivește.
          </p>
          <Link href="/contact"
            className="inline-flex items-center gap-2 btn btn-primary px-8 py-4 text-[15px]">
            Programează discuție gratuită <ArrowRight size={16} />
          </Link>
        </div>
      </section>

    </main>
  );
}
