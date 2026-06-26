"use client";
import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, ArrowLeft, RefreshCw, CheckCircle2 } from "lucide-react";

type Tag =
  | "voice"
  | "scheduling"
  | "sales"
  | "support"
  | "social"
  | "content"
  | "accounting"
  | "hr"
  | "inventory";

type Option = { label: string; tags: Tag[] };
type Question = { q: string; options: Option[] };

const QUESTIONS: Question[] = [
  {
    q: "Care e cea mai mare durere a afacerii tale acum?",
    options: [
      { label: "Pierdem apeluri când nu putem răspunde", tags: ["voice", "support"] },
      { label: "Clienții nu-și fac programări sau uită", tags: ["scheduling"] },
      { label: "Lead-urile cad între scaune", tags: ["sales"] },
      { label: "Marketing-ul stă pe loc", tags: ["social", "content"] },
      { label: "Facturarea / contabilitatea consumă timp", tags: ["accounting"] },
    ],
  },
  {
    q: "Câți angajați aveți?",
    options: [
      { label: "1–5 (suntem mici, fiecare poartă mai multe pălării)", tags: ["voice", "scheduling", "content"] },
      { label: "6–20 (am început să ne organizăm pe departamente)", tags: ["sales", "support", "social"] },
      { label: "20–50 (operațional, dar costuri mari)", tags: ["sales", "hr", "accounting"] },
      { label: "50+ (avem volum, vrem să scalăm fără să dublăm staff-ul)", tags: ["voice", "support", "hr", "inventory"] },
    ],
  },
  {
    q: "În ce moment al zilei pierdeți cel mai mult?",
    options: [
      { label: "Seara după 18:00 și weekend-urile", tags: ["voice", "scheduling", "support"] },
      { label: "Dimineața, când suntem inundați de cereri", tags: ["voice", "support", "sales"] },
      { label: "Constant — nu reușim niciodată să prindem din urmă", tags: ["sales", "social", "content"] },
      { label: "La final de lună, când facturăm și raportăm", tags: ["accounting"] },
    ],
  },
  {
    q: "Cum primiți cel mai des clienți noi?",
    options: [
      { label: "Telefon / mobil", tags: ["voice", "scheduling"] },
      { label: "WhatsApp / Facebook Messenger / Instagram DM", tags: ["scheduling", "support", "social"] },
      { label: "Email / formular site", tags: ["sales", "content"] },
      { label: "Walk-in / la sediu fizic", tags: ["scheduling", "inventory"] },
    ],
  },
  {
    q: "Care e bugetul lunar pe care l-ai aloca unui agent AI?",
    options: [
      { label: "Sub 1000 RON (vrem să testăm)", tags: ["social", "content"] },
      { label: "1000–2500 RON (cea mai mare durere)", tags: ["scheduling", "support", "content"] },
      { label: "2500–5000 RON (vrem 2–3 agenți)", tags: ["voice", "sales", "social"] },
      { label: "5000+ RON (transformare reală)", tags: ["voice", "sales", "hr", "accounting"] },
    ],
  },
];

// Map tag → agent slug + display
const RECOMMENDATIONS: Record<Tag, { slug: string; name: string; tagline: string }> = {
  voice: { slug: "voicebot", name: "VoiceBot", tagline: "Preia 100% din apeluri, 24/7" },
  scheduling: { slug: "schedulerbot", name: "SchedulerBot", tagline: "Programări WhatsApp + reminder-uri auto" },
  sales: { slug: "salesbot", name: "SalesBot", tagline: "Califică lead-uri și ține pipeline-ul cald" },
  support: { slug: "supportbot", name: "SupportBot", tagline: "Răspunde 24/7 pe baza documentelor tale" },
  social: { slug: "socialbot", name: "SocialBot", tagline: "Calendar editorial + postare automată" },
  content: { slug: "contentbot", name: "ContentBot", tagline: "Articole, email-uri, copy de vânzare" },
  accounting: { slug: "accountbot", name: "AccountBot", tagline: "Facturare automată & follow-up plăți" },
  hr: { slug: "hrbot", name: "HRBot", tagline: "Screening CV-uri & interviuri inițiale" },
  inventory: { slug: "inventorybot", name: "InventoryBot", tagline: "Stoc monitorizat, reaprovizionare auto" },
};

export function Quiz() {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Tag[][]>([]);
  const [done, setDone] = useState(false);

  const isLast = step === QUESTIONS.length - 1;

  const handlePick = (tags: Tag[]) => {
    const next = [...answers, tags];
    setAnswers(next);
    if (isLast) {
      setDone(true);
    } else {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    if (step === 0) return;
    setAnswers(answers.slice(0, -1));
    setStep(step - 1);
  };

  const handleReset = () => {
    setStep(0);
    setAnswers([]);
    setDone(false);
  };

  const scores = scoreAnswers(answers);
  const top = scores.slice(0, 3);

  if (done) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="rounded-3xl border border-[var(--border)] bg-[var(--bg-2)] p-8 md:p-12">
          <div className="flex items-center gap-2 text-emerald-600 mb-4">
            <CheckCircle2 size={18} />
            <span className="text-[13px] font-medium uppercase tracking-wider">Recomandare</span>
          </div>
          <h2 className="h-display text-3xl md:text-5xl text-[var(--ink)] mb-3">
            Agentul tău e <span className="gradient-text">{RECOMMENDATIONS[top[0].tag].name}</span>
          </h2>
          <p className="text-[var(--ink-2)] text-lg mb-10">
            {RECOMMENDATIONS[top[0].tag].tagline}.
          </p>

          <div className="grid md:grid-cols-3 gap-3 mb-10">
            {top.map((t, i) => {
              const rec = RECOMMENDATIONS[t.tag];
              const featured = i === 0;
              return (
                <Link
                  key={t.tag}
                  href={`/agenti/${rec.slug}`}
                  className={`block rounded-2xl border p-5 transition-all hover:-translate-y-0.5 ${
                    featured
                      ? "border-[var(--ink)] bg-[var(--ink)] text-[var(--bg-2)]"
                      : "border-[var(--border)] bg-[var(--bg-3)]/40 text-[var(--ink-1)] hover:border-[var(--ink)]"
                  }`}
                >
                  <div className={`text-[11px] uppercase tracking-wider mb-2 ${featured ? "text-[var(--bg-2)]/60" : "text-[var(--ink-3)]"}`}>
                    #{i + 1} match · {t.score} pct
                  </div>
                  <div className="h-display text-xl mb-1">{rec.name}</div>
                  <div className={`text-[13px] ${featured ? "text-[var(--bg-2)]/80" : "text-[var(--ink-2)]"}`}>
                    {rec.tagline}
                  </div>
                </Link>
              );
            })}
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <Link
              href={`/agenti/${RECOMMENDATIONS[top[0].tag].slug}`}
              className="btn btn-primary px-6 py-3 text-[14px] flex-1 justify-center"
            >
              Vezi {RECOMMENDATIONS[top[0].tag].name}
              <ArrowRight size={14} />
            </Link>
            <button
              onClick={handleReset}
              className="btn btn-secondary px-5 py-3 text-[13.5px] justify-center"
              type="button"
            >
              <RefreshCw size={13} />
              Refă quiz-ul
            </button>
          </div>
        </div>
      </motion.div>
    );
  }

  const question = QUESTIONS[step];
  const progress = ((step + (answers.length > step ? 1 : 0)) / QUESTIONS.length) * 100;

  return (
    <div className="rounded-3xl border border-[var(--border)] bg-[var(--bg-2)] overflow-hidden">
      {/* Progress bar */}
      <div className="h-1 bg-[var(--bg-3)] relative">
        <motion.div
          className="absolute inset-y-0 left-0 bg-[var(--accent)]"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.35, ease: "easeOut" }}
        />
      </div>

      <div className="p-7 md:p-10">
        <div className="flex items-center justify-between text-[12px] text-[var(--ink-3)] mb-6">
          <span>
            Întrebarea {step + 1} din {QUESTIONS.length}
          </span>
          {step > 0 && (
            <button
              onClick={handleBack}
              className="flex items-center gap-1 hover:text-[var(--ink)] transition-colors"
              type="button"
            >
              <ArrowLeft size={11} /> Înapoi
            </button>
          )}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -12 }}
            transition={{ duration: 0.3 }}
          >
            <h2 className="h-display text-2xl md:text-3xl text-[var(--ink)] mb-7 leading-tight">
              {question.q}
            </h2>

            <ul className="space-y-2.5">
              {question.options.map((opt, i) => (
                <li key={i}>
                  <button
                    onClick={() => handlePick(opt.tags)}
                    type="button"
                    className="w-full text-left px-5 py-4 rounded-xl border border-[var(--border)] bg-[var(--bg-2)] hover:border-[var(--ink)] hover:bg-[var(--bg-3)]/30 transition-all group flex items-center justify-between"
                  >
                    <span className="text-[14.5px] text-[var(--ink-1)] pr-3">{opt.label}</span>
                    <ArrowRight
                      size={16}
                      className="text-[var(--ink-3)] group-hover:text-[var(--ink)] group-hover:translate-x-0.5 transition-all shrink-0"
                    />
                  </button>
                </li>
              ))}
            </ul>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

function scoreAnswers(answers: Tag[][]): { tag: Tag; score: number }[] {
  const counts = new Map<Tag, number>();
  // Earlier answers (which are more about pain point) weighted higher
  answers.forEach((tags, idx) => {
    const weight = idx === 0 ? 3 : idx === 4 ? 2 : 1;
    tags.forEach((t) => counts.set(t, (counts.get(t) || 0) + weight));
  });
  return Array.from(counts.entries())
    .map(([tag, score]) => ({ tag, score }))
    .sort((a, b) => b.score - a.score);
}
