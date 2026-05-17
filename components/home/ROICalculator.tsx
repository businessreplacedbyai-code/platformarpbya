"use client";
import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Calculator, TrendingUp, ArrowRight, Phone, Calendar, MessageSquare } from "lucide-react";

type Scenario = {
  id: "calls" | "scheduling" | "support";
  label: string;
  icon: typeof Phone;
  description: string;
  agentSetup: number;
  agentMonthly: number;
};

const SCENARIOS: Scenario[] = [
  {
    id: "calls",
    label: "Preluare apeluri",
    icon: Phone,
    description: "VoiceBot care răspunde 24/7, ia comenzi și programări",
    agentSetup: 799,
    agentMonthly: 299,
  },
  {
    id: "scheduling",
    label: "Programări clienți",
    icon: Calendar,
    description: "SchedulerBot pe WhatsApp + reminders automate",
    agentSetup: 399,
    agentMonthly: 199,
  },
  {
    id: "support",
    label: "Suport / FAQ",
    icon: MessageSquare,
    description: "SupportBot care răspunde la întrebări recurente",
    agentSetup: 399,
    agentMonthly: 199,
  },
];

const EUR_TO_RON = 5;
const TAXES_MULTIPLIER = 1.4;

export function ROICalculator() {
  const [scenario, setScenario] = useState<Scenario>(SCENARIOS[0]);
  const [employees, setEmployees] = useState(1);
  const [salary, setSalary] = useState(4500);

  const numbers = useMemo(() => {
    const humanMonthly = employees * salary * TAXES_MULTIPLIER;
    const humanYearly = humanMonthly * 12;

    const agentSetupRon = scenario.agentSetup * EUR_TO_RON;
    const agentMonthlyRon = scenario.agentMonthly * EUR_TO_RON;
    const agentYearly = agentSetupRon + agentMonthlyRon * 12;

    const savings = Math.max(humanYearly - agentYearly, 0);
    const savingsPct = humanYearly > 0 ? Math.round((savings / humanYearly) * 100) : 0;

    const monthsToBreakeven =
      humanMonthly > agentMonthlyRon
        ? Math.ceil(agentSetupRon / (humanMonthly - agentMonthlyRon))
        : null;

    return { humanYearly, agentYearly, savings, savingsPct, monthsToBreakeven };
  }, [scenario, employees, salary]);

  const fmt = (n: number) =>
    new Intl.NumberFormat("ro-RO", { maximumFractionDigits: 0 }).format(n);

  return (
    <section id="calculator-roi" className="py-24 md:py-32 px-6 border-t border-[var(--border)]">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-14"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass text-[12px] text-[var(--ink-2)] mb-5">
            <Calculator size={12} className="text-[var(--accent)]" />
            Calculator ROI
          </div>
          <h2 className="h-display text-4xl md:text-5xl lg:text-6xl text-[var(--ink)] mb-4">
            Cât te costă să <span className="gradient-text">nu</span> automatizezi?
          </h2>
          <p className="text-[var(--ink-2)] text-lg max-w-2xl mx-auto">
            Mută sliderele și vezi cât economisești într-un an înlocuind munca repetitivă cu un agent AI.
          </p>
        </motion.div>

        <div className="rounded-3xl border border-[var(--border)] bg-[var(--bg-2)] overflow-hidden shadow-[0_30px_80px_-40px_rgba(0,0,0,0.18)]">
          {/* Scenario tabs */}
          <div className="grid grid-cols-3 border-b border-[var(--border)]">
            {SCENARIOS.map((s) => {
              const Icon = s.icon;
              const active = s.id === scenario.id;
              return (
                <button
                  key={s.id}
                  onClick={() => setScenario(s)}
                  className={`px-3 py-5 text-center transition-colors border-r border-[var(--border)] last:border-r-0 ${
                    active
                      ? "bg-[var(--bg-2)] text-[var(--ink)]"
                      : "bg-[var(--bg-3)]/40 text-[var(--ink-3)] hover:text-[var(--ink-1)] hover:bg-[var(--bg-3)]/70"
                  }`}
                >
                  <div className="flex flex-col items-center gap-2">
                    <Icon size={18} className={active ? "text-[var(--accent)]" : ""} />
                    <span className="text-[13px] md:text-sm font-medium">{s.label}</span>
                  </div>
                </button>
              );
            })}
          </div>

          <div className="grid md:grid-cols-2">
            {/* Controls */}
            <div className="p-7 md:p-10 border-b md:border-b-0 md:border-r border-[var(--border)]">
              <div className="text-[12px] eyebrow mb-2">Scenariu</div>
              <p className="text-[var(--ink-1)] text-[15px] mb-8 leading-relaxed">
                {scenario.description}
              </p>

              <SliderRow
                label="Persoane care fac asta acum"
                value={employees}
                min={1}
                max={10}
                step={1}
                format={(v) => `${v} ${v === 1 ? "persoană" : "persoane"}`}
                onChange={setEmployees}
              />

              <div className="h-6" />

              <SliderRow
                label="Salariu mediu lunar (net)"
                value={salary}
                min={2500}
                max={12000}
                step={250}
                format={(v) => `${fmt(v)} RON`}
                onChange={setSalary}
              />

              <p className="mt-6 text-[11.5px] text-[var(--ink-3)] leading-relaxed">
                Estimăm costul total cu taxe & contribuții la ~1.4× salariul net (CIM, CAS, CASS, asigurări).
              </p>
            </div>

            {/* Output */}
            <div className="p-7 md:p-10 bg-[var(--bg-3)]/30">
              <div className="text-[12px] eyebrow mb-6">Rezultat anual</div>

              <Row label="Cost cu angajați" value={`${fmt(numbers.humanYearly)} RON`} muted />
              <Row label="Cost cu agent AI" value={`${fmt(numbers.agentYearly)} RON`} muted />

              <div className="my-6 h-px bg-[var(--border)]" />

              <div className="flex items-baseline justify-between mb-1">
                <span className="text-[14px] text-[var(--ink-2)]">Economie / an</span>
                <span className="flex items-center gap-1 text-[12px] text-emerald-600 font-medium">
                  <TrendingUp size={12} />-{numbers.savingsPct}%
                </span>
              </div>
              <motion.div
                key={numbers.savings}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="h-display text-4xl md:text-5xl text-[var(--ink)] mb-6"
              >
                {fmt(numbers.savings)} <span className="text-[var(--ink-3)] text-2xl">RON</span>
              </motion.div>

              {numbers.monthsToBreakeven && (
                <div className="text-[12.5px] text-[var(--ink-2)] mb-7 leading-relaxed">
                  Recuperezi investiția în setup în{" "}
                  <span className="text-[var(--ink)] font-medium">
                    ~{numbers.monthsToBreakeven} {numbers.monthsToBreakeven === 1 ? "lună" : "luni"}
                  </span>
                  .
                </div>
              )}

              <Link
                href="/contact"
                className="btn btn-primary px-5 py-3 text-[14px] w-full justify-center group"
              >
                <span>Cere o analiză gratuită</span>
                <ArrowRight size={14} className="transition-transform group-hover:translate-x-0.5" />
              </Link>

              <p className="mt-4 text-[11px] text-[var(--ink-3)] text-center">
                Estimare orientativă. Cifrele exacte ți le confirmăm într-un audit gratuit de 30 minute.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function SliderRow({
  label,
  value,
  min,
  max,
  step,
  format,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  format: (v: number) => string;
  onChange: (v: number) => void;
}) {
  return (
    <div>
      <div className="flex items-baseline justify-between mb-2">
        <label className="text-[13px] text-[var(--ink-2)]">{label}</label>
        <span className="text-[15px] font-medium text-[var(--ink)] tabular-nums">
          {format(value)}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="roi-slider w-full"
        aria-label={label}
      />
    </div>
  );
}

function Row({ label, value, muted }: { label: string; value: string; muted?: boolean }) {
  return (
    <div className="flex items-baseline justify-between py-1.5">
      <span className={`text-[13.5px] ${muted ? "text-[var(--ink-3)]" : "text-[var(--ink-2)]"}`}>
        {label}
      </span>
      <span className={`text-[14px] tabular-nums ${muted ? "text-[var(--ink-2)]" : "text-[var(--ink)]"}`}>
        {value}
      </span>
    </div>
  );
}
