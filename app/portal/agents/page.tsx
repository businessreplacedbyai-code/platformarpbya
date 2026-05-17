import { getClientSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import { agents as catalogAgents } from "@/lib/agents";
import { Sparkles, CheckCircle2 } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function MyAgents() {
  const session = await getClientSession();
  if (!session?.clientSlug) redirect("/login?type=client");
  const client = await prisma.client.findUnique({
    where: { slug: session.clientSlug },
    include: { agents: { orderBy: { createdAt: "asc" } } },
  });
  if (!client) redirect("/login?type=client");

  const PHASES: { key: string; label: string }[] = [
    { key: "planned", label: "Planificat" },
    { key: "configuring", label: "Configurare" },
    { key: "testing", label: "Testare" },
    { key: "live", label: "Activ" },
    { key: "paused", label: "Pauzat" },
  ];

  return (
    <>
      <header className="mb-8">
        <p className="eyebrow mb-2">Agenții tăi</p>
        <h1 className="h-display text-3xl">Agenții activi sau în implementare</h1>
      </header>

      {client.agents.length === 0 ? (
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-2)] p-12 text-center">
          <Sparkles size={32} className="mx-auto text-[var(--ink-3)] mb-3" />
          <p className="text-[14px] text-[var(--ink-2)] mb-4">Nu ai niciun agent încă.</p>
          <a
            href="/portal/marketplace"
            className="inline-block px-5 py-2.5 rounded-xl bg-[var(--ink)] text-[var(--bg-2)] text-[13.5px]"
          >
            Vezi catalogul de agenți
          </a>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {client.agents.map((ca) => {
            const a = catalogAgents.find((x) => x.slug === ca.agentSlug);
            const phaseLabel = PHASES.find((p) => p.key === ca.status)?.label ?? ca.status;
            return (
              <div
                key={ca.id}
                className="rounded-2xl border border-[var(--border)] bg-[var(--bg-2)] p-5"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="w-11 h-11 rounded-xl bg-[var(--bg-3)] flex items-center justify-center">
                    {a?.icon ? <a.icon size={18} /> : <Sparkles size={18} />}
                  </div>
                  <span className={`text-[10px] uppercase tracking-wider px-2 py-1 rounded-full border ${badge(ca.status)}`}>
                    {phaseLabel}
                  </span>
                </div>
                <div className="text-[10px] eyebrow text-[var(--ink-3)] mb-1">{a?.role}</div>
                <h3 className="text-[15.5px] font-medium mb-2">{a?.name ?? ca.agentSlug}</h3>
                <p className="text-[12.5px] text-[var(--ink-2)] leading-relaxed mb-3">
                  {a?.short}
                </p>
                {ca.goLiveAt && (
                  <div className="flex items-center gap-1.5 text-[11.5px] text-emerald-700">
                    <CheckCircle2 size={12} />
                    Activ din {new Date(ca.goLiveAt).toLocaleDateString("ro-RO")}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}

function badge(s: string) {
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
