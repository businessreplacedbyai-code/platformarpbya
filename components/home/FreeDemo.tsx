"use client";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { MessageCircle, Globe, Sparkles } from "lucide-react";

// CTA „demo gratuit" — acroșaj lead-gen: îți facem un demo de agent vocal pe afacerea ta, gratis.
export function FreeDemo() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  const steps = [
    { icon: MessageCircle, t: "1. Ne spui ce afacere ai", d: "Un mesaj scurt. Numele afacerii și cu ce te ocupi." },
    { icon: Sparkles, t: "2. Îți facem demo-ul", d: "Un agent vocal AI configurat pe afacerea ta — gratis." },
    { icon: Globe, t: "3. Îl asculți live", d: "Auzi cum preia un apel real. Te convinge → ți-l instalăm." },
  ];

  return (
    <section id="demo-gratuit" ref={ref} className="relative py-32 px-6 overflow-hidden">
      <div className="absolute inset-0 pointer-events-none opacity-50">
        <div className="absolute top-1/3 right-1/4 w-[40rem] h-[40rem] bg-[radial-gradient(circle,rgba(212,175,55,0.12),transparent_70%)] blur-3xl" />
      </div>

      <div className="relative max-w-5xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
        >
          <p className="eyebrow mb-4">Demo gratuit · fără obligații</p>
          <h2 className="h-display text-4xl md:text-5xl lg:text-6xl mb-6 leading-[1.05]">
            Auzi cum sună agentul tău{" "}
            <span className="gradient-text">— gratis.</span>
          </h2>
          <p className="text-lg text-[var(--ink-2)] leading-relaxed max-w-2xl mx-auto mb-12">
            Ne spui ce afacere ai, iar noi îți facem un demo de agent vocal pe specificul tău.
            Îl asculți cum preia un apel real. Dacă te convinge, ți-l instalăm. Fără card, fără obligații.
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-3 gap-4 mb-12 text-left">
          {steps.map((s, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.1 + i * 0.1 }}
              className="card-hover rounded-2xl border border-[var(--border)] bg-[var(--bg-2)] p-6"
            >
              <div className="w-11 h-11 rounded-xl bg-[var(--bg-3)] flex items-center justify-center text-[var(--ink-1)] mb-4">
                <s.icon size={18} />
              </div>
              <div className="text-[15px] font-medium text-[var(--ink)]">{s.t}</div>
              <div className="text-[13px] text-[var(--ink-3)] mt-1 leading-relaxed">{s.d}</div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <a
            href="/contact"
            className="inline-flex items-center gap-2 px-7 py-4 rounded-full bg-[var(--ink)] text-[var(--bg-2)] text-[15px] font-medium hover:-translate-y-0.5 hover:shadow-[0_10px_30px_-10px_rgba(0,0,0,0.3)] transition-all"
          >
            <Sparkles size={16} />
            Cere demo gratuit
          </a>
          <p className="mt-4 text-[13px] text-[var(--ink-3)]">
            Gratis · fără card · fără obligații
          </p>
        </motion.div>
      </div>
    </section>
  );
}
