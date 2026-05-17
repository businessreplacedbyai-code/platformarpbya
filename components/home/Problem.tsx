"use client";
import { motion, AnimatePresence, useInView } from "framer-motion";
import { useRef, useState } from "react";
import {
  PhoneOff,
  Clock,
  Banknote,
  CalendarX,
  PhoneCall,
  CalendarCheck,
  Sparkles,
  Receipt,
} from "lucide-react";

type Mode = "before" | "after";

const STATES: Record<
  Mode,
  {
    label: string;
    sub: string;
    points: { icon: typeof PhoneOff; title: string; detail: string }[];
  }
> = {
  before: {
    label: "Cu angajați umani",
    sub: "Cum arată o zi tipică acum.",
    points: [
      {
        icon: PhoneOff,
        title: "Telefonul sună și nimeni nu răspunde",
        detail: "Pierzi 3 din 10 apeluri seara și în weekend.",
      },
      {
        icon: CalendarX,
        title: "Programări pierdute",
        detail: "Răspunsul vine prea târziu — clientul merge la concurență.",
      },
      {
        icon: Clock,
        title: "Munca repetitivă consumă oameni",
        detail: "Aceleași 200 de întrebări pe zi, în loc de muncă creativă.",
      },
      {
        icon: Banknote,
        title: "Facturi întârziate, cash-flow incert",
        detail: "Memoria umană e fragilă. Banii vin târziu.",
      },
    ],
  },
  after: {
    label: "Cu agenți AI",
    sub: "Cum arată ziua peste 48h de la setup.",
    points: [
      {
        icon: PhoneCall,
        title: "100% din apeluri preluate, 24/7",
        detail: "VoiceBot răspunde instant, în română, fără pauze.",
      },
      {
        icon: CalendarCheck,
        title: "Programări confirmate în minute",
        detail: "WhatsApp + reminders automate. No-show redus cu 70%.",
      },
      {
        icon: Sparkles,
        title: "Echipa ta face muncă reală",
        detail: "AI-ul preia ce e repetitiv. Oamenii rezolvă ce contează.",
      },
      {
        icon: Receipt,
        title: "Facturi emise automat la timp",
        detail: "Cash-flow predictibil. Zero memorie umană implicată.",
      },
    ],
  },
};

export function Problem() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });
  const [mode, setMode] = useState<Mode>("before");
  const current = STATES[mode];
  const isAfter = mode === "after";

  return (
    <section ref={ref} className="relative py-32 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5 }}
            className="eyebrow mb-4"
          >
            Problema → Soluția
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="h-display text-4xl md:text-6xl mb-6"
          >
            Vezi diferența. <br />
            <span className="gradient-text">Apasă mai jos.</span>
          </motion.h2>
        </div>

        {/* Toggle */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.25 }}
          className="flex justify-center mb-10"
        >
          <div className="relative inline-flex items-center p-1 rounded-full bg-[var(--bg-3)] border border-[var(--border)]">
            <motion.div
              aria-hidden
              animate={{ x: isAfter ? "100%" : "0%" }}
              transition={{ type: "spring", stiffness: 380, damping: 32 }}
              className="absolute top-1 left-1 bottom-1 w-[calc(50%-4px)] rounded-full bg-[var(--bg)] shadow-[0_1px_2px_rgba(0,0,0,0.06),0_4px_12px_-4px_rgba(0,0,0,0.08)]"
            />
            {(Object.keys(STATES) as Mode[]).map((m) => {
              const active = m === mode;
              return (
                <button
                  key={m}
                  onClick={() => setMode(m)}
                  className={`relative z-10 px-5 md:px-7 py-2 text-[13.5px] font-medium transition-colors ${
                    active ? "text-[var(--ink)]" : "text-[var(--ink-3)] hover:text-[var(--ink-1)]"
                  }`}
                  aria-pressed={active}
                >
                  {STATES[m].label}
                </button>
              );
            })}
          </div>
        </motion.div>

        <p className="text-center text-[var(--ink-3)] text-[14px] mb-12">{current.sub}</p>

        <AnimatePresence mode="wait">
          <motion.div
            key={mode}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.35 }}
            className="grid md:grid-cols-2 gap-3"
          >
            {current.points.map((p, i) => {
              const Icon = p.icon;
              return (
                <motion.div
                  key={`${mode}-${i}`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: i * 0.06 }}
                  className={`card-hover flex items-start gap-4 p-6 rounded-2xl border ${
                    isAfter
                      ? "border-emerald-200 bg-gradient-to-br from-emerald-50/60 to-[var(--bg-2)]"
                      : "border-rose-200/70 bg-gradient-to-br from-rose-50/50 to-[var(--bg-2)]"
                  }`}
                >
                  <div
                    className={`w-10 h-10 shrink-0 rounded-xl flex items-center justify-center ${
                      isAfter
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-rose-100 text-rose-700"
                    }`}
                  >
                    <Icon size={18} />
                  </div>
                  <div className="min-w-0 pt-0.5">
                    <p className="text-[15px] md:text-base text-[var(--ink)] font-medium leading-snug">
                      {p.title}
                    </p>
                    <p className="text-[13px] text-[var(--ink-2)] mt-1 leading-relaxed">
                      {p.detail}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}
