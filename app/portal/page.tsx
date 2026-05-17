import { getClientSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import { agents as catalogAgents } from "@/lib/agents";
import Link from "next/link";
import {
  Sparkles,
  ArrowRight,
  ShoppingBag,
  ClipboardCheck,
  Bot,
  TrendingUp,
} from "lucide-react";

export const dynamic = "force-dynamic";

export default async function PortalDashboard() {
  const session = await getClientSession();
  if (!session?.clientSlug) redirect("/login?type=client");

  const client = await prisma.client.findUnique({
    where: { slug: session.clientSlug },
    include: {
      agents: true,
      tasks: true,
      intake: true,
      purchaseRequests: {
        where: { status: { in: ["pending", "approved"] } },
        orderBy: { createdAt: "desc" },
      },
    },
  });
  if (!client) redirect("/login?type=client");

  const liveAgents = client.agents.filter((a) => a.status === "live").length;
  const inProgressAgents = client.agents.filter((a) => a.status !== "live" && a.status !== "paused").length;
  const tasksDone = client.tasks.filter((t) => t.done).length;
  const tasksTotal = client.tasks.length;
  const tasksPct = tasksTotal > 0 ? Math.round((tasksDone / tasksTotal) * 100) : 0;
  const intakeDone = !!client.intakeSubmittedAt;

  return (
    <>
      <header className="mb-10">
        <p className="eyebrow mb-2">Bun venit, {client.contactName.split(" ")[0]}</p>
        <h1 className="h-display text-3xl md:text-4xl mb-2">{client.businessName}</h1>
        <p className="text-[15px] text-[var(--ink-2)]">
          Aici găsești agenții tăi, progresul implementării și poți cere agenți noi.
        </p>
      </header>

      {/* KPIs */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
        <Stat icon={Bot} label="Agenți activi" value={liveAgents} hint={`${inProgressAgents} în implementare`} accent="emerald" />
        <Stat icon={TrendingUp} label="Progres total" value={tasksPct} suffix="%" hint={`${tasksDone}/${tasksTotal} task-uri`} accent="blue" />
        <Stat
          icon={ClipboardCheck}
          label="Formular intake"
          value={intakeDone ? "✓" : "—"}
          hint={intakeDone ? "Completat" : "În așteptare"}
          accent={intakeDone ? "emerald" : "amber"}
        />
        <Stat
          icon={ShoppingBag}
          label="Cereri active"
          value={client.purchaseRequests.length}
          hint="în review"
          accent="violet"
        />
      </section>

      {/* Intake CTA */}
      {!intakeDone && client.intakeToken && (
        <Link
          href={`/intake/${client.intakeToken}`}
          className="block mb-8 rounded-2xl border border-amber-300 bg-gradient-to-r from-amber-50 to-orange-50 p-5 hover:-translate-y-0.5 transition-all"
        >
          <div className="flex items-center gap-4">
            <div className="w-11 h-11 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
              <ClipboardCheck size={20} />
            </div>
            <div className="flex-1">
              <div className="text-[14.5px] font-medium text-amber-900">
                Completează formularul de onboarding
              </div>
              <div className="text-[12.5px] text-amber-700">
                Avem nevoie de 7 secțiuni de info pentru a configura agenții tăi.
              </div>
            </div>
            <ArrowRight size={18} className="text-amber-700" />
          </div>
        </Link>
      )}

      <section className="grid lg:grid-cols-2 gap-6">
        {/* Agenții mei */}
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-2)] overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--border)]">
            <h2 className="text-[14px] font-medium">Agenții tăi</h2>
            <Link
              href="/portal/agents"
              className="text-[12px] text-[var(--ink-3)] hover:text-[var(--ink)] flex items-center gap-1"
            >
              Vezi toți <ArrowRight size={12} />
            </Link>
          </div>
          <div className="p-2">
            {client.agents.length === 0 ? (
              <div className="text-center py-10">
                <Sparkles size={24} className="mx-auto text-[var(--ink-3)] mb-2" />
                <p className="text-[13px] text-[var(--ink-3)] mb-3">Niciun agent încă.</p>
                <Link
                  href="/portal/marketplace"
                  className="inline-block px-4 py-2 rounded-xl bg-[var(--ink)] text-[var(--bg-2)] text-[13px]"
                >
                  Cere primul agent
                </Link>
              </div>
            ) : (
              client.agents.slice(0, 5).map((ca) => {
                const a = catalogAgents.find((x) => x.slug === ca.agentSlug);
                return (
                  <div
                    key={ca.id}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-[var(--bg-3)] transition-colors"
                  >
                    <div className="w-9 h-9 rounded-lg bg-[var(--bg-3)] flex items-center justify-center shrink-0">
                      {a?.icon ? <a.icon size={15} /> : <Sparkles size={15} />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[13.5px] font-medium truncate">{a?.name ?? ca.agentSlug}</div>
                      <div className="text-[11.5px] text-[var(--ink-3)] truncate">{a?.role}</div>
                    </div>
                    <span className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full border ${agentBadge(ca.status)}`}>
                      {ca.status}
                    </span>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Cereri */}
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-2)] overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--border)]">
            <h2 className="text-[14px] font-medium">Cereri trimise</h2>
            <Link
              href="/portal/marketplace"
              className="text-[12px] text-[var(--ink-3)] hover:text-[var(--ink)] flex items-center gap-1"
            >
              Cere agent nou <ArrowRight size={12} />
            </Link>
          </div>
          <div className="p-2">
            {client.purchaseRequests.length === 0 ? (
              <div className="text-center py-10">
                <p className="text-[13px] text-[var(--ink-3)]">Nicio cerere în review.</p>
              </div>
            ) : (
              client.purchaseRequests.map((r) => {
                const a = catalogAgents.find((x) => x.slug === r.agentSlug);
                return (
                  <div key={r.id} className="flex items-center gap-3 px-3 py-2.5">
                    <div className="w-9 h-9 rounded-lg bg-[var(--bg-3)] flex items-center justify-center shrink-0">
                      {a?.icon ? <a.icon size={15} /> : <Sparkles size={15} />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[13.5px] font-medium truncate">{a?.name ?? r.agentSlug}</div>
                      <div className="text-[11px] text-[var(--ink-3)]">
                        {new Date(r.createdAt).toLocaleDateString("ro-RO")}
                      </div>
                    </div>
                    <span className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full border ${requestBadge(r.status)}`}>
                      {r.status}
                    </span>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </section>
    </>
  );
}

function agentBadge(s: string) {
  switch (s) {
    case "live":
      return "border-emerald-200 text-emerald-700 bg-emerald-50";
    case "paused":
      return "border-red-200 text-red-700 bg-red-50";
    case "testing":
    case "configuring":
      return "border-blue-200 text-blue-700 bg-blue-50";
    default:
      return "border-amber-200 text-amber-700 bg-amber-50";
  }
}

function requestBadge(s: string) {
  if (s === "approved") return "border-emerald-200 text-emerald-700 bg-emerald-50";
  return "border-amber-200 text-amber-700 bg-amber-50";
}

function Stat({
  icon: Icon,
  label,
  value,
  hint,
  accent,
  suffix,
}: {
  icon: typeof Bot;
  label: string;
  value: string | number;
  hint?: string;
  accent: "amber" | "blue" | "emerald" | "violet";
  suffix?: string;
}) {
  const accents = {
    amber: "bg-amber-50 text-amber-700",
    blue: "bg-blue-50 text-blue-700",
    emerald: "bg-emerald-50 text-emerald-700",
    violet: "bg-violet-50 text-violet-700",
  };
  return (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-2)] p-5">
      <div className={`w-9 h-9 rounded-lg flex items-center justify-center mb-3 ${accents[accent]}`}>
        <Icon size={16} />
      </div>
      <div className="h-display text-3xl mb-1 tabular-nums">
        {value}
        {suffix && <span className="text-xl ml-0.5 text-[var(--ink-3)]">{suffix}</span>}
      </div>
      <div className="text-[12px] eyebrow">{label}</div>
      {hint && <div className="text-[11px] text-[var(--ink-3)] mt-1">{hint}</div>}
    </div>
  );
}
