import { getClientSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import { CheckCircle2, Circle, ClipboardCheck } from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

const PHASES: { key: string; label: string; desc: string }[] = [
  { key: "setup", label: "1. Setup", desc: "Pregătire cont, branding, acces" },
  { key: "config", label: "2. Configurare agent", desc: "Antrenare voce, scripturi, scenarii" },
  { key: "integrations", label: "3. Integrări", desc: "Conectare CRM, telefonie, calendar" },
  { key: "testing", label: "4. Testare", desc: "Testare end-to-end, ajustări fine" },
  { key: "preview", label: "5. Pornire live", desc: "Verifici și pornești agentul" },
];

export default async function Implementation() {
  const session = await getClientSession();
  if (!session?.clientSlug) redirect("/login?type=client");
  const client = await prisma.client.findUnique({
    where: { slug: session.clientSlug },
    include: {
      tasks: { orderBy: { orderIdx: "asc" } },
    },
  });
  if (!client) redirect("/login?type=client");

  const done = client.tasks.filter((t) => t.done).length;
  const total = client.tasks.length;
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;
  const intakeDone = !!client.intakeSubmittedAt;

  return (
    <>
      <header className="mb-8">
        <p className="eyebrow mb-2">Implementare</p>
        <h1 className="h-display text-3xl mb-2">Progresul implementării</h1>
        <p className="text-[14.5px] text-[var(--ink-2)]">
          Pașii de la cont la agent live. Vezi ce ai bifat și ce mai ai de făcut.
        </p>
      </header>

      {/* Intake status */}
      <div className="mb-8 rounded-2xl border border-[var(--border)] bg-[var(--bg-2)] p-5">
        <div className="flex items-center gap-4">
          <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${intakeDone ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}`}>
            <ClipboardCheck size={18} />
          </div>
          <div className="flex-1">
            <div className="text-[14.5px] font-medium">Formular onboarding</div>
            <div className="text-[12.5px] text-[var(--ink-3)]">
              {intakeDone
                ? `Completat pe ${new Date(client.intakeSubmittedAt!).toLocaleDateString("ro-RO")}`
                : "Completează-l ca agenții să răspundă pe specificul afacerii tale"}
            </div>
          </div>
          {!intakeDone && client.intakeToken && (
            <Link
              href={`/intake/${client.intakeToken}`}
              className="px-4 py-2 rounded-xl bg-[var(--ink)] text-[var(--bg-2)] text-[12.5px]"
            >
              Completează acum
            </Link>
          )}
        </div>
      </div>

      {/* Overall progress */}
      <div className="mb-8 rounded-2xl border border-[var(--border)] bg-[var(--bg-2)] p-6">
        <div className="flex items-baseline justify-between mb-3">
          <div>
            <div className="text-[11px] eyebrow text-[var(--ink-3)] mb-1">Progres general</div>
            <div className="h-display text-3xl tabular-nums">
              {pct}<span className="text-xl ml-0.5 text-[var(--ink-3)]">%</span>
            </div>
          </div>
          <div className="text-right">
            <div className="text-[11px] eyebrow text-[var(--ink-3)] mb-1">Task-uri</div>
            <div className="text-[14px] tabular-nums">{done} / {total}</div>
          </div>
        </div>
        <div className="h-2 rounded-full bg-[var(--bg-3)] overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-emerald-500 to-emerald-600 transition-all duration-500"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      {/* Phases */}
      {total === 0 ? (
        <div className="text-center py-12 rounded-2xl border border-[var(--border)] bg-[var(--bg-2)]">
          <p className="text-[13.5px] text-[var(--ink-3)]">
            Agenții apar aici după ce îi configurăm pe afacerea ta. Te anunțăm.
          </p>
        </div>
      ) : (
        <div className="space-y-5">
          {PHASES.map((phase) => {
            const tasks = client.tasks.filter((t) => t.phase === phase.key);
            if (tasks.length === 0) return null;
            const phaseDone = tasks.filter((t) => t.done).length;
            const phasePct = Math.round((phaseDone / tasks.length) * 100);
            return (
              <div
                key={phase.key}
                className="rounded-2xl border border-[var(--border)] bg-[var(--bg-2)] p-5"
              >
                <div className="flex items-center justify-between mb-1">
                  <h2 className="text-[15px] font-medium">{phase.label}</h2>
                  <span className="text-[12px] tabular-nums text-[var(--ink-3)]">
                    {phaseDone}/{tasks.length}
                  </span>
                </div>
                <p className="text-[12.5px] text-[var(--ink-3)] mb-3">{phase.desc}</p>
                <div className="h-1 rounded-full bg-[var(--bg-3)] overflow-hidden mb-4">
                  <div
                    className={`h-full transition-all duration-500 ${
                      phasePct === 100 ? "bg-emerald-500" : "bg-[var(--ink)]"
                    }`}
                    style={{ width: `${phasePct}%` }}
                  />
                </div>
                <ul className="space-y-1">
                  {tasks.map((t) => (
                    <li
                      key={t.id}
                      className="flex items-start gap-2.5 px-2 py-1.5 rounded-lg"
                    >
                      {t.done ? (
                        <CheckCircle2 size={15} className="mt-0.5 text-emerald-600 shrink-0" />
                      ) : (
                        <Circle size={15} className="mt-0.5 text-[var(--ink-3)] shrink-0" />
                      )}
                      <span
                        className={`text-[13.5px] ${
                          t.done ? "line-through text-[var(--ink-3)]" : "text-[var(--ink-1)]"
                        }`}
                      >
                        {t.title}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}
