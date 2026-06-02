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
  CheckCircle2,
  Clock,
  Zap,
  MessageSquare,
  ChevronRight,
  Circle,
  AlertCircle,
} from "lucide-react";

export const dynamic = "force-dynamic";

const TYPE_EMOJI: Record<string, string> = {
  planned: "📋", configuring: "⚙️", testing: "🧪", live: "🚀", paused: "⏸️",
};

export default async function PortalDashboard() {
  const session = await getClientSession();
  if (!session?.clientSlug) redirect("/login?type=client");

  const client = await prisma.client.findUnique({
    where: { slug: session.clientSlug },
    include: {
      agents: { orderBy: { updatedAt: "desc" } },
      tasks: { orderBy: { orderIdx: "asc" } },
      intake: { select: { id: true } },
      purchaseRequests: {
        orderBy: { createdAt: "desc" },
        take: 5,
      },
    },
  });
  if (!client) redirect("/login?type=client");

  const liveAgents = client.agents.filter((a) => a.status === "live");
  const inProgressAgents = client.agents.filter((a) =>
    ["configuring", "testing"].includes(a.status)
  );
  const tasksDone = client.tasks.filter((t) => t.done).length;
  const tasksTotal = client.tasks.length;
  const tasksPct = tasksTotal > 0 ? Math.round((tasksDone / tasksTotal) * 100) : 0;
  const intakeDone = !!client.intakeSubmittedAt;
  const pendingRequests = client.purchaseRequests.filter((r) => r.status === "pending");

  // Next step logic
  const nextStep = getNextStep({ intakeDone, agents: client.agents, tasksDone, tasksTotal });

  // Activity feed: ultimele 6 taskuri bifate + agenți actualizați recent
  const recentActivity = [
    ...client.tasks
      .filter((t) => t.done && t.doneAt)
      .sort((a, b) => new Date(b.doneAt!).getTime() - new Date(a.doneAt!).getTime())
      .slice(0, 3)
      .map((t) => ({ type: "task" as const, label: t.title, at: t.doneAt! })),
    ...client.agents
      .filter((a) => a.status === "live" && a.goLiveAt)
      .slice(0, 2)
      .map((a) => {
        const cat = catalogAgents.find((x) => x.slug === a.agentSlug);
        return { type: "agent" as const, label: `${cat?.name ?? a.agentSlug} a intrat live`, at: a.goLiveAt! };
      }),
  ]
    .sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime())
    .slice(0, 5);

  return (
    <>
      {/* Header */}
      <header className="mb-8">
        <p className="eyebrow mb-2">Bun venit înapoi</p>
        <h1 className="h-display text-3xl md:text-4xl mb-1">{client.businessName}</h1>
        <p className="text-[14px] text-[var(--ink-3)]">
          {liveAgents.length > 0
            ? `${liveAgents.length} agent${liveAgents.length > 1 ? "i" : ""} activ${liveAgents.length > 1 ? "i" : ""} · totul merge`
            : "Implementare în progres · suntem pe fază"}
        </p>
      </header>

      {/* Next step banner */}
      {nextStep && (
        <Link
          href={nextStep.href}
          className={`block mb-8 rounded-2xl p-5 border hover:-translate-y-0.5 transition-all ${nextStep.cls}`}
        >
          <div className="flex items-center gap-4">
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${nextStep.iconCls}`}>
              <nextStep.icon size={20} />
            </div>
            <div className="flex-1">
              <div className="text-[14.5px] font-semibold">{nextStep.title}</div>
              <div className="text-[12.5px] opacity-80 mt-0.5">{nextStep.desc}</div>
            </div>
            <ArrowRight size={18} className="opacity-60 shrink-0" />
          </div>
        </Link>
      )}

      {/* KPIs */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
        <KpiCard
          icon={Bot}
          label="Agenți live"
          value={liveAgents.length}
          hint={inProgressAgents.length > 0 ? `${inProgressAgents.length} în lucru` : "activi acum"}
          accent="emerald"
        />
        <KpiCard
          icon={ClipboardCheck}
          label="Implementare"
          value={tasksPct}
          suffix="%"
          hint={`${tasksDone} din ${tasksTotal} pași`}
          accent="blue"
        />
        <KpiCard
          icon={ShoppingBag}
          label="Cereri active"
          value={pendingRequests.length}
          hint="în review"
          accent="violet"
        />
        <KpiCard
          icon={Zap}
          label="Plan activ"
          value={client.plan ? "✓" : "—"}
          hint={client.plan ?? "fără plan setat"}
          accent="amber"
        />
      </section>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Agenții mei */}
          <Panel
            title="Agenții tăi"
            action={{ label: "Cere agent nou", href: "/portal/marketplace" }}
          >
            {client.agents.length === 0 ? (
              <EmptyState
                icon={Sparkles}
                text="Niciun agent încă."
                action={{ label: "Explorează agenții disponibili", href: "/portal/marketplace" }}
              />
            ) : (
              <div className="space-y-2">
                {client.agents.map((ca) => {
                  const a = catalogAgents.find((x) => x.slug === ca.agentSlug);
                  const statusColor =
                    ca.status === "live" ? "text-emerald-700 bg-emerald-50 border-emerald-200" :
                    ca.status === "testing" ? "text-blue-700 bg-blue-50 border-blue-200" :
                    ca.status === "configuring" ? "text-violet-700 bg-violet-50 border-violet-200" :
                    ca.status === "paused" ? "text-red-700 bg-red-50 border-red-200" :
                    "text-amber-700 bg-amber-50 border-amber-200";
                  return (
                    <div key={ca.id} className="flex items-center gap-3 px-3 py-3 rounded-xl border border-[var(--border)] bg-[var(--bg)]">
                      <div className="w-10 h-10 rounded-xl bg-[var(--bg-3)] flex items-center justify-center shrink-0 text-xl">
                        {TYPE_EMOJI[ca.status] ?? "📋"}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-[14px] font-medium truncate">{a?.name ?? ca.agentSlug}</div>
                        <div className="text-[11.5px] text-[var(--ink-3)]">{a?.role ?? "Agent AI"}</div>
                      </div>
                      <span className={`text-[10px] uppercase tracking-wider px-2.5 py-1 rounded-full border font-medium ${statusColor}`}>
                        {ca.status}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </Panel>

          {/* Progress implementare */}
          <Panel title="Progres implementare" action={{ label: "Vezi detalii", href: "/portal/implementation" }}>
            <div className="mb-4">
              <div className="flex items-center justify-between text-[13px] mb-2">
                <span className="text-[var(--ink-2)]">{tasksDone} din {tasksTotal} pași completați</span>
                <span className="font-medium tabular-nums">{tasksPct}%</span>
              </div>
              <div className="h-2.5 rounded-full bg-[var(--bg-3)] overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${tasksPct === 100 ? "bg-emerald-500" : "bg-[var(--ink)]"}`}
                  style={{ width: `${tasksPct}%` }}
                />
              </div>
            </div>
            {/* Ultimii pași nefăcuți */}
            <div className="space-y-1">
              {client.tasks.filter((t) => !t.done).slice(0, 4).map((t) => (
                <div key={t.id} className="flex items-center gap-2 text-[13px] text-[var(--ink-2)] py-1">
                  <Circle size={13} className="text-[var(--ink-3)] shrink-0" />
                  {t.title}
                </div>
              ))}
              {client.tasks.filter((t) => !t.done).length === 0 && (
                <div className="flex items-center gap-2 text-[13px] text-emerald-700 py-1">
                  <CheckCircle2 size={13} className="shrink-0" />
                  Toți pașii sunt completați!
                </div>
              )}
            </div>
          </Panel>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Activitate recentă */}
          <Panel title="Activitate recentă">
            {recentActivity.length === 0 ? (
              <p className="text-[13px] text-[var(--ink-3)] py-4 text-center">Nicio activitate încă.</p>
            ) : (
              <div className="space-y-3">
                {recentActivity.map((item, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${item.type === "agent" ? "bg-emerald-100 text-emerald-700" : "bg-blue-50 text-blue-700"}`}>
                      {item.type === "agent" ? <Zap size={11} /> : <CheckCircle2 size={11} />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[12.5px] text-[var(--ink-1)] leading-snug">{item.label}</p>
                      <p className="text-[11px] text-[var(--ink-3)] mt-0.5">
                        {new Date(item.at).toLocaleDateString("ro-RO", { day: "2-digit", month: "short" })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Panel>

          {/* Acces rapid */}
          <Panel title="Acces rapid">
            <div className="space-y-1">
              {[
                { label: "Marketplace agenți", href: "/portal/marketplace", icon: Sparkles },
                { label: "Implementare", href: "/portal/implementation", icon: ClipboardCheck },
                { label: "Integrări", href: "/portal/integrations", icon: Zap },
                { label: "Facturare", href: "/portal/billing", icon: ShoppingBag },
                { label: "Contul meu", href: "/portal/account", icon: Bot },
              ].map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-[var(--bg-3)] transition-colors"
                >
                  <item.icon size={14} className="text-[var(--ink-3)]" />
                  <span className="text-[13.5px]">{item.label}</span>
                  <ChevronRight size={13} className="text-[var(--ink-3)] ml-auto" />
                </Link>
              ))}
            </div>
          </Panel>

          {/* Contact */}
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-2)] p-5">
            <p className="text-[13px] font-medium mb-1">Ai o întrebare?</p>
            <p className="text-[12px] text-[var(--ink-3)] mb-3">Suntem disponibili pe email și răspundem rapid.</p>
            <a
              href="mailto:contact@replacedbyai.ro"
              className="flex items-center gap-2 text-[13px] text-[var(--ink)] hover:underline"
            >
              <MessageSquare size={13} />
              contact@replacedbyai.ro
            </a>
          </div>
        </div>
      </div>
    </>
  );
}

type AgentData = { status: string }[];

function getNextStep({
  intakeDone,
  agents,
  tasksDone,
  tasksTotal,
}: {
  intakeDone: boolean;
  agents: AgentData;
  tasksDone: number;
  tasksTotal: number;
}) {
  if (!intakeDone) {
    return {
      icon: ClipboardCheck,
      title: "Completează formularul de onboarding",
      desc: "Avem nevoie de informații despre afacerea ta pentru a configura agenții.",
      href: "/portal/agents",
      cls: "border-amber-300 bg-gradient-to-r from-amber-50 to-orange-50 text-amber-900",
      iconCls: "bg-amber-100 text-amber-700",
    };
  }
  const hasLive = agents.some((a) => a.status === "live");
  const hasInProgress = agents.some((a) => ["configuring", "testing"].includes(a.status));
  if (!hasLive && hasInProgress) {
    return {
      icon: Clock,
      title: "Agenții tăi sunt în configurare",
      desc: "Echipa noastră lucrează la setarea și testarea agenților tăi.",
      href: "/portal/implementation",
      cls: "border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-900",
      iconCls: "bg-blue-100 text-blue-700",
    };
  }
  if (hasLive && tasksDone < tasksTotal) {
    return {
      icon: CheckCircle2,
      title: "Agenții tăi sunt live!",
      desc: `${tasksTotal - tasksDone} pași de implementare mai sunt de bifat.`,
      href: "/portal/implementation",
      cls: "border-emerald-200 bg-gradient-to-r from-emerald-50 to-teal-50 text-emerald-900",
      iconCls: "bg-emerald-100 text-emerald-700",
    };
  }
  if (agents.length === 0) {
    return {
      icon: Sparkles,
      title: "Cere primul tău agent AI",
      desc: "Explorează catalogul și alege agentul potrivit pentru afacerea ta.",
      href: "/portal/marketplace",
      cls: "border-violet-200 bg-gradient-to-r from-violet-50 to-purple-50 text-violet-900",
      iconCls: "bg-violet-100 text-violet-700",
    };
  }
  return null;
}

function Panel({
  title,
  children,
  action,
}: {
  title: string;
  children: React.ReactNode;
  action?: { label: string; href: string };
}) {
  return (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-2)] overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--border)]">
        <h2 className="text-[14px] font-medium">{title}</h2>
        {action && (
          <Link href={action.href} className="text-[12px] text-[var(--ink-3)] hover:text-[var(--ink)] flex items-center gap-1">
            {action.label} <ArrowRight size={12} />
          </Link>
        )}
      </div>
      <div className="p-4">{children}</div>
    </div>
  );
}

function EmptyState({
  icon: Icon,
  text,
  action,
}: {
  icon: typeof Sparkles;
  text: string;
  action?: { label: string; href: string };
}) {
  return (
    <div className="text-center py-8">
      <Icon size={24} className="mx-auto text-[var(--ink-3)] mb-2 opacity-40" />
      <p className="text-[13px] text-[var(--ink-3)] mb-3">{text}</p>
      {action && (
        <Link href={action.href} className="inline-block px-4 py-2 rounded-xl bg-[var(--ink)] text-[var(--bg-2)] text-[13px]">
          {action.label}
        </Link>
      )}
    </div>
  );
}

function KpiCard({
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
