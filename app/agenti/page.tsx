import Link from "next/link";
import { agents } from "@/lib/agents";
import { CTAFinal } from "@/components/home/CTAFinal";

export const metadata = {
  title: "Agenți AI — catalogul complet de 15 angajați artificiali",
  description:
    "Cei 15 agenți AI ReplacedByAI: VoiceBot, SchedulerBot, SalesBot, SupportBot, SocialBot și încă 10 — fiecare cu rol, capabilități și preț estimativ. Alege agentul potrivit pentru afacerea ta.",
  alternates: { canonical: "https://www.replacedbyai.ro/agenti" },
};

export default function AgentiPage() {
  return (
    <>
      <section className="pt-40 pb-16 px-6 max-w-6xl mx-auto">
        <div className="max-w-3xl">
          <p className="eyebrow mb-4">Catalogul de agenți</p>
          <h1 className="h-display text-5xl md:text-7xl mb-6">
            Echipa ta <span className="gradient-text">artificială</span>
          </h1>
          <p className="text-lg md:text-xl text-[var(--ink-2)]">
            15+ agenți specializați. Alege ce funcție vrei să automatizezi.
          </p>
        </div>
      </section>

      <section className="px-6 max-w-6xl mx-auto pb-32">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {agents.map((a) => {
            const Icon = a.icon;
            return (
              <Link
                key={a.slug}
                href={`/agenti/${a.slug}`}
                className="card-hover group block rounded-xl border border-[var(--border)] bg-[var(--bg-2)] p-5"
              >
                <div className="flex items-center justify-between mb-5">
                  <div className="w-10 h-10 rounded-lg bg-[var(--bg-3)] flex items-center justify-center text-[var(--ink-1)] group-hover:bg-[var(--ink)] group-hover:text-[var(--bg-2)] transition-all">
                    <Icon size={16} />
                  </div>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 pulse-dot" />
                </div>
                <div className="h-display-sm text-base mb-1">{a.name}</div>
                <div className="text-[11.5px] text-[var(--ink-3)] mb-2">{a.role}</div>
                <p className="text-[13px] text-[var(--ink-2)] leading-relaxed">
                  {a.short}
                </p>
              </Link>
            );
          })}
        </div>
      </section>

      <CTAFinal />
    </>
  );
}
