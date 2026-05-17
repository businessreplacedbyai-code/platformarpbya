"use client";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Check, Quote } from "lucide-react";
import { AnimatedNumber } from "@/components/ui/AnimatedNumber";

type Case = {
  industry: string;
  name: string;
  location: string;
  quote: string;
  author: string;
  authorRole: string;
  metrics: { label: string; value: number; prefix?: string; suffix?: string }[];
  highlights: string[];
};

const cases: Case[] = [
  {
    industry: "HoReCa",
    name: "Restaurantul Vero",
    location: "Botoșani",
    quote: "În prima săptămână am preluat cu 30% mai multe comenzi. Nu mai am angajați la telefon.",
    author: "Cătălin M.",
    authorRole: "Owner",
    metrics: [
      { label: "Apeluri ratate", value: 0 },
      { label: "Creștere comenzi", value: 34, suffix: "%" },
      { label: "Costuri reduse/lună", value: 1400, prefix: "€" },
    ],
    highlights: [
      "0 apeluri ratate în 30 de zile",
      "+34% comenzi preluate la oră de vârf",
      "−€1,400 costuri lunare cu personalul",
    ],
  },
  {
    industry: "Medical",
    name: "Clinică stomatologică",
    location: "Cluj-Napoca",
    quote: "Recepționera mea s-a putut concentra pe pacienții fizici. No-show-ul a căzut spectaculos.",
    author: "Dr. Andreea P.",
    authorRole: "Manager clinică",
    metrics: [
      { label: "Rată no-show", value: 8, suffix: "%" },
      { label: "Programări noi/lună", value: 230 },
      { label: "Ore economisite/lună", value: 60, suffix: "h" },
    ],
    highlights: [
      "No-show scăzut de la 28% la 8%",
      "Programări 24/7 pe WhatsApp + web",
      "Reminder-uri automate trimise",
    ],
  },
];

export function Results() {
  return (
    <section id="rezultate" className="relative py-32 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-20">
          <p className="eyebrow mb-4">Rezultate reale</p>
          <h2 className="h-display text-4xl md:text-6xl">
            Cifre din afaceri reale. <br />
            <span className="gradient-text">Nu mockups.</span>
          </h2>
        </div>

        <div className="space-y-6">
          {cases.map((c, i) => (
            <CaseCard key={i} c={c} />
          ))}
        </div>
      </div>
    </section>
  );
}

function CaseCard({ c }: { c: Case }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <motion.article
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7 }}
      className="grid lg:grid-cols-5 gap-px bg-[var(--border)] rounded-2xl border border-[var(--border)] overflow-hidden"
    >
      <div className="lg:col-span-3 bg-[var(--bg-2)] p-8 md:p-12">
        <div className="flex items-center gap-3 mb-6">
          <span className="pill"><span className="pill-dot" />Studiu de caz</span>
          <span className="text-[12px] text-[var(--ink-3)]">{c.industry} · {c.location}</span>
        </div>
        <h3 className="h-display text-3xl md:text-4xl mb-8">{c.name}</h3>

        <div className="border-l-2 border-[var(--ink)] pl-5 mb-8">
          <Quote size={18} className="text-[var(--ink-3)] mb-3" />
          <p className="text-lg text-[var(--ink-1)] leading-relaxed mb-4">
            „{c.quote}"
          </p>
          <div className="text-[13px] text-[var(--ink-3)]">
            <span className="text-[var(--ink-1)] font-medium">{c.author}</span> · {c.authorRole}
          </div>
        </div>

        <ul className="space-y-2.5">
          {c.highlights.map((h, j) => (
            <li key={j} className="flex items-start gap-3 text-[15px] text-[var(--ink-1)]">
              <Check size={16} className="text-emerald-600 mt-1 shrink-0" />
              <span>{h}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="lg:col-span-2 bg-[var(--bg-3)]/40 p-8 md:p-12 flex flex-col justify-center gap-8">
        {c.metrics.map((m, j) => (
          <div key={j}>
            <div className="eyebrow mb-2">{m.label}</div>
            <div className="h-display text-5xl md:text-6xl text-[var(--ink)]">
              <AnimatedNumber value={m.value} prefix={m.prefix} suffix={m.suffix} />
            </div>
          </div>
        ))}
      </div>
    </motion.article>
  );
}
