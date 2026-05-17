"use client";
import { motion } from "framer-motion";
import Image from "next/image";
import { Button } from "@/components/ui/Button";
import { ArrowRight, Sparkles, Volume2 } from "lucide-react";

const words = ["Afacerea", "ta", "nu", "mai", "are", "nevoie", "de", "angajați."];

export function Hero() {
  return (
    <section className="relative min-h-[100svh] w-full flex flex-col items-center justify-center overflow-hidden pt-32 pb-20 px-6">
      {/* Mesh gradient background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="mesh-bg" />
        <div className="mesh-orb-3" />
        <div className="absolute inset-0 bg-grid" />
        <div className="noise" />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-2 mb-10 px-3.5 py-1.5 rounded-full glass text-[13px] text-[var(--ink-2)]"
        >
          <Sparkles size={13} className="text-[var(--accent)]" />
          <span>Lansare: 15 agenți AI pentru IMM-uri românești</span>
          <span className="text-[var(--ink-4)]">·</span>
          <span className="text-[var(--ink)] flex items-center gap-1 font-medium">
            Vezi noutățile <ArrowRight size={11} />
          </span>
        </motion.div>

        <h1 className="h-display text-[14vw] sm:text-[10vw] md:text-[7.5vw] lg:text-[112px] text-[var(--ink)] mb-8 max-w-[14ch] mx-auto">
          {words.map((w, i) => (
            <motion.span
              key={i}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.55,
                delay: 0.08 + i * 0.04,
                ease: [0.25, 0.1, 0.25, 1],
              }}
              className="inline-block mr-[0.22em]"
            >
              {w === "angajați." ? (
                <span className="gradient-text">{w}</span>
              ) : (
                w
              )}
            </motion.span>
          ))}
        </h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.7, delay: 0.7 }}
          className="text-lg md:text-xl text-[var(--ink-2)] max-w-2xl mx-auto mb-10 leading-relaxed"
        >
          Implementăm agenți AI care preiau apeluri, vând, programează, răspund și
          facturează. <span className="text-[var(--ink)]">24/7. Fără greșeli.</span>
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.9 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-3"
        >
          <Button href="/contact" variant="primary" size="lg" arrow>
            Cere o analiză gratuită
          </Button>
          <Button href="#audio-demo" variant="secondary" size="lg">
            <Volume2 size={14} className="inline mr-1.5 -mt-0.5" />
            Ascultă VoiceBot
          </Button>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.7, delay: 1.1 }}
          className="mt-6 text-[13px] text-[var(--ink-3)]"
        >
          Răspundem în 4 ore · Setup în 48h · Fără contract pe termen lung
        </motion.p>

        {/* Product preview mockup */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 1.2, ease: [0.25, 0.1, 0.25, 1] }}
          className="relative mt-20 max-w-5xl mx-auto"
        >
          <div className="absolute -inset-x-10 -bottom-10 h-40 bg-gradient-to-t from-[var(--bg)] to-transparent pointer-events-none z-10" />
          <div className="relative rounded-2xl border border-[var(--border)] bg-[var(--bg-2)] shadow-[0_30px_80px_-30px_rgba(0,0,0,0.15)] overflow-hidden">
            {/* Window chrome */}
            <div className="flex items-center gap-2 px-4 py-3 border-b border-[var(--border)] bg-[var(--bg-3)]/40">
              <div className="flex gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#FF5F57]" />
                <span className="w-2.5 h-2.5 rounded-full bg-[#FEBC2E]" />
                <span className="w-2.5 h-2.5 rounded-full bg-[#28C840]" />
              </div>
              <div className="flex-1 text-center text-[11px] text-[var(--ink-3)]">
                app.replacedbyai.ro / dashboard
              </div>
            </div>
            <div className="grid md:grid-cols-3 gap-px bg-[var(--border)]">
              <DashCell label="Apeluri preluate astăzi" value="342" trend="+18%" />
              <DashCell label="Programări create" value="89" trend="+24%" />
              <DashCell label="Economii lunare" value="€2,400" trend="—" />
            </div>
            <div className="grid md:grid-cols-2 gap-px bg-[var(--border)]">
              <ChatPreview />
              <AgentList />
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function DashCell({ label, value, trend }: { label: string; value: string; trend: string }) {
  return (
    <div className="bg-[var(--bg-2)] p-5">
      <div className="text-[11px] eyebrow mb-2">{label}</div>
      <div className="flex items-baseline gap-2">
        <span className="h-display text-3xl text-[var(--ink)]">{value}</span>
        <span className="text-[11px] text-emerald-600 font-medium">{trend}</span>
      </div>
    </div>
  );
}

function ChatPreview() {
  return (
    <div className="bg-[var(--bg-2)] p-5">
      <div className="text-[11px] eyebrow mb-4">Conversație live · WhatsApp</div>
      <div className="space-y-2.5">
        <Bubble side="left">Bună! Vreau să rezerv o masă vineri.</Bubble>
        <Bubble side="right">Sigur! Pentru câte persoane și la ce oră preferi?</Bubble>
        <Bubble side="left">4 persoane, la 20:00.</Bubble>
        <Bubble side="right">Confirmat. Vinerea, 20:00, 4 persoane. Trimit reminder cu o oră înainte.</Bubble>
      </div>
    </div>
  );
}

function Bubble({ side, children }: { side: "left" | "right"; children: React.ReactNode }) {
  return (
    <div className={`flex ${side === "right" ? "justify-end" : "justify-start"}`}>
      <div
        className={`text-[12.5px] px-3 py-2 max-w-[80%] rounded-2xl ${
          side === "right"
            ? "bg-[var(--ink)] text-[var(--bg-2)] rounded-br-sm"
            : "bg-[var(--bg-3)] text-[var(--ink-1)] rounded-bl-sm"
        }`}
      >
        {children}
      </div>
    </div>
  );
}

function AgentList() {
  const items = [
    { name: "VoiceBot", status: "Activ", color: "bg-emerald-500" },
    { name: "SchedulerBot", status: "Activ", color: "bg-emerald-500" },
    { name: "SalesBot", status: "Activ", color: "bg-emerald-500" },
    { name: "SupportBot", status: "Standby", color: "bg-amber-500" },
  ];
  return (
    <div className="bg-[var(--bg-2)] p-5">
      <div className="text-[11px] eyebrow mb-4">Agenți activi</div>
      <ul className="space-y-2.5">
        {items.map((it) => (
          <li key={it.name} className="flex items-center justify-between text-[13px]">
            <div className="flex items-center gap-2.5">
              <span className={`w-1.5 h-1.5 rounded-full ${it.color} pulse-dot`} />
              <span className="text-[var(--ink-1)]">{it.name}</span>
            </div>
            <span className="text-[11px] text-[var(--ink-3)]">{it.status}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
