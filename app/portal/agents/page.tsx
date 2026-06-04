import { getClientSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import { agents as catalogAgents } from "@/lib/agents";
import { getEntitlement, VALID_AGENTS } from "@/lib/provisioning";
import { chooseAgent } from "../actions";
import { Sparkles, CheckCircle2, Loader2, Plus, Clock } from "lucide-react";

export const dynamic = "force-dynamic";

const PHASES = [
  { key: "planned", label: "În coadă", color: "amber" },
  { key: "configuring", label: "Se configurează", color: "blue" },
  { key: "testing", label: "În testare", color: "blue" },
  { key: "live", label: "Activ", color: "emerald" },
  { key: "paused", label: "Pauzat", color: "red" },
];

export default async function MyAgents({
  searchParams,
}: {
  searchParams: Promise<{ ok?: string; err?: string }>;
}) {
  const sp = await searchParams;
  const session = await getClientSession();
  if (!session?.clientSlug) redirect("/login?type=client");
  const client = await prisma.client.findUnique({
    where: { slug: session.clientSlug },
    include: { agents: { orderBy: { createdAt: "asc" } } },
  });
  if (!client) redirect("/login?type=client");

  const ent = await getEntitlement(client.id);
  const taken = new Set(client.agents.filter((a) => a.status !== "canceled").map((a) => a.agentSlug));
  const available = VALID_AGENTS.filter((s) => !taken.has(s)).map(
    (s) => catalogAgents.find((c) => c.slug === s)
  ).filter(Boolean);

  const banner = sp.ok === "added"
    ? { t: "Agent adăugat — se configurează automat. Te anunțăm când e activ.", ok: true }
    : sp.err === "no_slots"
    ? { t: "Ai folosit toate sloturile din planul tău. Fă upgrade pentru mai mulți agenți.", ok: false }
    : sp.err === "provision"
    ? { t: "Agentul a fost adăugat, dar activarea automată a întâmpinat o problemă. Echipa verifică.", ok: false }
    : null;

  return (
    <>
      <header className="mb-6">
        <p className="eyebrow mb-2">Agenții tăi</p>
        <h1 className="h-display text-3xl">Agenții tăi AI</h1>
      </header>

      {banner && (
        <div
          className="mb-6 rounded-xl px-4 py-3 text-[13px]"
          style={{
            background: banner.ok ? "#ECFDF5" : "#FEF2F2",
            border: `1px solid ${banner.ok ? "#A7F3D0" : "#FECACA"}`,
            color: banner.ok ? "#065F46" : "#991B1B",
          }}
        >
          {banner.t}
        </div>
      )}

      {/* Entitlement / sloturi */}
      {ent.planKey && (
        <div className="mb-8 rounded-2xl border border-[var(--border)] bg-[var(--bg-2)] p-5 flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="text-[11px] eyebrow text-[var(--ink-3)] mb-1">Planul tău</div>
            <div className="text-[16px] font-medium capitalize">{ent.planKey}</div>
          </div>
          <div className="flex items-center gap-6">
            <div className="text-center">
              <div className="text-[22px] font-semibold tabular-nums">{ent.used}</div>
              <div className="text-[11px] text-[var(--ink-3)]">activi / în setup</div>
            </div>
            <div className="text-center">
              <div className="text-[22px] font-semibold tabular-nums" style={{ color: ent.remaining > 0 ? "#059669" : "var(--ink-3)" }}>
                {ent.slots >= 99 ? "∞" : ent.remaining}
              </div>
              <div className="text-[11px] text-[var(--ink-3)]">sloturi libere</div>
            </div>
          </div>
        </div>
      )}

      {/* Agenți activi/în setup */}
      {client.agents.filter((a) => a.status !== "canceled").length === 0 ? (
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-2)] p-10 text-center mb-8">
          <Sparkles size={30} className="mx-auto text-[var(--ink-3)] mb-3" />
          <p className="text-[14px] text-[var(--ink-2)]">
            {ent.slots > 0
              ? "Alege primii agenți din sloturile tale, mai jos."
              : "Nu ai niciun agent încă. Alege un plan din Facturare."}
          </p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-10">
          {client.agents.filter((a) => a.status !== "canceled").map((ca) => {
            const a = catalogAgents.find((x) => x.slug === ca.agentSlug);
            const phase = PHASES.find((p) => p.key === ca.status) ?? PHASES[0];
            const inProgress = ["planned", "configuring", "testing"].includes(ca.status);
            return (
              <div key={ca.id} className="rounded-2xl border border-[var(--border)] bg-[var(--bg-2)] p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className="w-11 h-11 rounded-xl bg-[var(--bg-3)] flex items-center justify-center">
                    {a?.icon ? <a.icon size={18} /> : <Sparkles size={18} />}
                  </div>
                  <span className={`text-[10px] uppercase tracking-wider px-2 py-1 rounded-full border ${badge(phase.color)} inline-flex items-center gap-1`}>
                    {inProgress && ca.status !== "planned" && <Loader2 size={9} className="animate-spin" />}
                    {ca.status === "planned" && <Clock size={9} />}
                    {phase.label}
                  </span>
                </div>
                <div className="text-[10px] eyebrow text-[var(--ink-3)] mb-1">{a?.role}</div>
                <h3 className="text-[15.5px] font-medium mb-2">{a?.name ?? ca.agentSlug}</h3>
                <p className="text-[12.5px] text-[var(--ink-2)] leading-relaxed mb-3">{a?.short}</p>
                {ca.status === "live" && ca.goLiveAt ? (
                  <div className="flex items-center gap-1.5 text-[11.5px] text-emerald-700">
                    <CheckCircle2 size={12} /> Activ din {new Date(ca.goLiveAt).toLocaleDateString("ro-RO")}
                  </div>
                ) : inProgress ? (
                  <div className="text-[11.5px] text-[var(--ink-3)]">
                    {ca.status === "planned" ? "În coadă pentru configurare automată…" : "Setup automat în curs — gata în câteva minute."}
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
      )}

      {/* Alegere agenți (dacă mai are sloturi) */}
      {ent.remaining > 0 && available.length > 0 && (
        <section>
          <div className="flex items-baseline justify-between mb-4">
            <h2 className="h-display text-xl">Adaugă un agent</h2>
            <span className="text-[12px] text-[var(--ink-3)]">
              {ent.slots >= 99 ? "Nelimitat" : `${ent.remaining} sloturi libere`}
            </span>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {available.map((a) => a && (
              <form key={a.slug} action={chooseAgent} className="rounded-2xl border border-[var(--border)] bg-[var(--bg-2)] p-5 flex flex-col">
                <input type="hidden" name="agentSlug" value={a.slug} />
                <div className="w-10 h-10 rounded-xl bg-[var(--bg-3)] flex items-center justify-center mb-3">
                  {a.icon ? <a.icon size={17} /> : <Sparkles size={17} />}
                </div>
                <div className="text-[10px] eyebrow text-[var(--ink-3)] mb-1">{a.role}</div>
                <h3 className="text-[14.5px] font-medium mb-1.5">{a.name}</h3>
                <p className="text-[12px] text-[var(--ink-2)] leading-relaxed mb-4 flex-1">{a.short}</p>
                <button type="submit" className="w-full h-9 rounded-lg text-[12.5px] font-medium flex items-center justify-center gap-1.5" style={{ background: "var(--ink)", color: "var(--bg)" }}>
                  <Plus size={13} /> Activează agentul
                </button>
              </form>
            ))}
          </div>
        </section>
      )}

      {/* Fără plan → spre facturare */}
      {!ent.planKey && (
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-2)] p-8 text-center">
          <p className="text-[14px] text-[var(--ink-2)] mb-4">Alege un plan ca să activezi agenți.</p>
          <a href="/portal/billing" className="inline-block px-5 py-2.5 rounded-xl bg-[var(--ink)] text-[var(--bg)] text-[13.5px]">
            Vezi planuri
          </a>
        </div>
      )}
    </>
  );
}

function badge(color: string) {
  switch (color) {
    case "emerald": return "border-emerald-200 text-emerald-700 bg-emerald-50";
    case "red": return "border-red-200 text-red-700 bg-red-50";
    case "blue": return "border-blue-200 text-blue-700 bg-blue-50";
    default: return "border-amber-200 text-amber-700 bg-amber-50";
  }
}
