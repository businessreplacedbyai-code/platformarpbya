"use client";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Plus } from "lucide-react";

const faqs = [
  {
    q: "Cât durează implementarea?",
    a: "Instalăm agentul în ~5 zile lucrătoare de la audit. Tu nu faci nimic tehnic — ne ocupăm noi de configurare, voce și integrări.",
  },
  {
    q: "Trebuie să schimb ceva în afacerea mea?",
    a: "Nu. Agenții se integrează în ce ai deja: telefonul existent, WhatsApp-ul business, Google Calendar, site-ul tău.",
  },
  {
    q: "Ce se întâmplă dacă agentul nu știe să răspundă?",
    a: "Escaladează automat la tine prin SMS sau email. Niciun client nu rămâne fără răspuns.",
  },
  {
    q: "Pot testa înainte să plătesc?",
    a: "Da. Începi cu un audit și un demo de agent gratuit, pe afacerea ta — vezi rezultatul înainte să plătești ceva.",
  },
  {
    q: "Funcționează și pentru afaceri mici?",
    a: "Tocmai pentru ele am construit ReplacedByAI. Un restaurant cu 3 angajați beneficiază la fel ca un lanț cu 50 de locații.",
  },
  {
    q: "Ce se întâmplă cu datele clienților mei?",
    a: "Serverele sunt în Europa (GDPR compliant). Datele tale nu sunt folosite pentru antrenarea niciunui model AI.",
  },
];

export function FAQ() {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <section className="relative py-32 px-6">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-16">
          <p className="eyebrow mb-4">Întrebări frecvente</p>
          <h2 className="h-display text-4xl md:text-5xl">
            Te <span className="gradient-text">ajutăm</span> cu răspunsurile.
          </h2>
        </div>

        <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-2)] divide-y divide-[var(--border)] overflow-hidden">
          {faqs.map((f, i) => {
            const isOpen = open === i;
            return (
              <div key={i}>
                <button
                  onClick={() => setOpen(isOpen ? null : i)}
                  className="w-full text-left px-6 py-5 flex items-center justify-between gap-6 group hover:bg-[var(--bg-3)]/40 transition-colors"
                >
                  <span className="h-display-sm text-[17px] text-[var(--ink)]">
                    {f.q}
                  </span>
                  <motion.span
                    animate={{ rotate: isOpen ? 45 : 0 }}
                    transition={{ duration: 0.3 }}
                    className="shrink-0 text-[var(--ink-2)]"
                  >
                    <Plus size={18} />
                  </motion.span>
                </button>
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                      className="overflow-hidden"
                    >
                      <p className="px-6 pb-6 text-[15px] text-[var(--ink-2)] leading-relaxed pr-12">
                        {f.a}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
