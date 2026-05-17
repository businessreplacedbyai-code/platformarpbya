"use client";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";

const steps = [
  {
    num: "01",
    title: "Analiză gratuită",
    body: "Discutăm afacerea ta, identificăm unde pierzi timp și bani, recomandăm agenții potriviți. Durează 30 de minute.",
    time: "Ziua 1",
  },
  {
    num: "02",
    title: "Implementare",
    body: "Configurăm, testăm și integrăm agenții în sistemele tale existente. Tu nu faci nimic tehnic. Noi ne ocupăm de tot.",
    time: "Ziua 1–2",
  },
  {
    num: "03",
    title: "Live & optimizare",
    body: "Agenții sunt activi. Monitorizăm, ajustăm și îmbunătățim continuu. Raport lunar cu rezultate concrete.",
    time: "Continuu",
  },
];

export function HowItWorks() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section
      id="cum-functioneaza"
      ref={ref}
      className="relative py-32 px-6 bg-[var(--ink)] text-[var(--bg-2)] overflow-hidden"
    >
      {/* Subtle radial highlights */}
      <div className="absolute inset-0 pointer-events-none opacity-30">
        <div className="absolute top-0 left-1/4 w-[40rem] h-[40rem] bg-[radial-gradient(circle,rgba(167,139,250,0.15),transparent_70%)] blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-[40rem] h-[40rem] bg-[radial-gradient(circle,rgba(244,114,182,0.1),transparent_70%)] blur-3xl" />
      </div>

      <div className="relative max-w-6xl mx-auto">
        <div className="max-w-3xl mb-20">
          <p className="eyebrow !text-[var(--ink-4)] mb-4">Procesul</p>
          <h2 className="h-display text-4xl md:text-6xl">
            De la idee la agent activ <br />
            <span className="bg-gradient-to-r from-white via-white/80 to-white/30 bg-clip-text text-transparent">
              în 48 de ore.
            </span>
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-px bg-white/10 rounded-2xl overflow-hidden border border-white/10">
          {steps.map((s, i) => (
            <motion.div
              key={s.num}
              initial={{ opacity: 0, y: 30 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.7, delay: 0.2 + i * 0.15 }}
              className="bg-[var(--ink)] p-8 md:p-10"
            >
              <div className="flex items-center justify-between mb-12">
                <span className="text-[13px] text-white/40 font-mono">
                  {s.num}
                </span>
                <span className="text-[11px] uppercase tracking-wider text-white/40 px-2.5 py-1 rounded-full border border-white/10">
                  {s.time}
                </span>
              </div>
              <h3 className="h-display-sm text-2xl md:text-3xl mb-4">{s.title}</h3>
              <p className="text-[15px] text-white/60 leading-relaxed">
                {s.body}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
