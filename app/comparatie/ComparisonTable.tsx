"use client";
import { motion } from "framer-motion";
import { Check, X } from "lucide-react";

type Row = {
  criterion: string;
  human: { text: string; positive?: boolean };
  ai: { text: string; positive?: boolean };
};

const rows: Row[] = [
  {
    criterion: "Cost anual total",
    human: { text: "60.000–120.000 RON", positive: false },
    ai: { text: "10.000–25.000 RON", positive: true },
  },
  {
    criterion: "Disponibilitate",
    human: { text: "8h/zi · 5 zile/săpt.", positive: false },
    ai: { text: "24h/zi · 7 zile/săpt.", positive: true },
  },
  {
    criterion: "Timp de răspuns",
    human: { text: "5–15 minute", positive: false },
    ai: { text: "Sub 30 secunde", positive: true },
  },
  {
    criterion: "Concediu / boală",
    human: { text: "21 zile/an + concediu medical", positive: false },
    ai: { text: "Niciodată", positive: true },
  },
  {
    criterion: "Training inițial",
    human: { text: "3–6 luni", positive: false },
    ai: { text: "Rapid", positive: true },
  },
  {
    criterion: "Consistență",
    human: { text: "Variabilă (oboseală, dispoziție)", positive: false },
    ai: { text: "Identică 24/7", positive: true },
  },
  {
    criterion: "Limbi vorbite",
    human: { text: "1–2", positive: false },
    ai: { text: "50+ (RO, EN, HU, IT...)", positive: true },
  },
  {
    criterion: "Empatie reală / situații delicate",
    human: { text: "Punct forte uman", positive: true },
    ai: { text: "Limitată — escaladează la om", positive: false },
  },
  {
    criterion: "Negociere creativă",
    human: { text: "Avantaj uman", positive: true },
    ai: { text: "Doar pe șabloane definite", positive: false },
  },
  {
    criterion: "Scalare la 10× volume",
    human: { text: "Recrutare lentă & costisitoare", positive: false },
    ai: { text: "Instant, zero cost suplimentar", positive: true },
  },
  {
    criterion: "Audit & conformitate (GDPR)",
    human: { text: "Greu de monitorizat", positive: false },
    ai: { text: "Log complet, auditabil", positive: true },
  },
];

export function ComparisonTable() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.1 }}
      transition={{ duration: 0.6 }}
      className="rounded-2xl border border-[var(--border)] bg-[var(--bg-2)] overflow-hidden"
    >
      {/* Header */}
      <div className="grid grid-cols-[1.2fr_1fr_1fr] md:grid-cols-3 border-b border-[var(--border)] bg-[var(--bg-3)]/40">
        <div className="px-5 py-4 text-[12px] eyebrow">Criteriu</div>
        <div className="px-5 py-4 text-[13px] font-medium text-[var(--ink-2)] border-l border-[var(--border)]">
          Angajat uman
        </div>
        <div className="px-5 py-4 text-[13px] font-medium text-[var(--ink)] border-l border-[var(--border)] flex items-center gap-2">
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-[var(--accent)]" />
          Agent AI
        </div>
      </div>

      {/* Rows */}
      {rows.map((r, i) => (
        <motion.div
          key={r.criterion}
          initial={{ opacity: 0, x: -8 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.4, delay: i * 0.04 }}
          className="grid grid-cols-[1.2fr_1fr_1fr] md:grid-cols-3 border-b border-[var(--border)] last:border-b-0 hover:bg-[var(--bg-3)]/20 transition-colors"
        >
          <div className="px-5 py-4 text-[13.5px] text-[var(--ink-1)] font-medium">
            {r.criterion}
          </div>
          <Cell {...r.human} />
          <Cell {...r.ai} />
        </motion.div>
      ))}
    </motion.div>
  );
}

function Cell({ text, positive }: { text: string; positive?: boolean }) {
  const Icon = positive ? Check : X;
  return (
    <div className="px-5 py-4 text-[13px] text-[var(--ink-1)] border-l border-[var(--border)] flex items-start gap-2">
      <Icon
        size={14}
        className={`mt-0.5 shrink-0 ${
          positive ? "text-emerald-600" : "text-rose-400"
        }`}
      />
      <span className="leading-relaxed">{text}</span>
    </div>
  );
}
