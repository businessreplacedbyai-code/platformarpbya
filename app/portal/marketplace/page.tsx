import { getClientSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import { agents as catalogAgents } from "@/lib/agents";
import { requestAgent } from "../actions";
import { CheckCircle2, Clock, ShoppingBag, AlertTriangle } from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function Marketplace() {
  const session = await getClientSession();
  if (!session?.clientSlug) redirect("/login?type=client");
  const client = await prisma.client.findUnique({
    where: { slug: session.clientSlug },
    include: {
      agents: true,
      purchaseRequests: { where: { status: "pending" } },
    },
  });
  if (!client) redirect("/login?type=client");

  const owned = new Set(client.agents.map((a) => a.agentSlug));
  const pending = new Set(client.purchaseRequests.map((r) => r.agentSlug));
  const intakeDone = !!client.intakeSubmittedAt;

  return (
    <>
      <header className="mb-8">
        <p className="eyebrow mb-2">Catalog</p>
        <h1 className="h-display text-3xl mb-2">Agenți disponibili</h1>
        <p className="text-[14.5px] text-[var(--ink-2)]">
          Alege un agent și trimite o cerere. Echipa noastră îți confirmă în maxim 24h.
        </p>
      </header>

      {!intakeDone && (
        <div className="mb-6 rounded-xl px-4 py-3 flex items-start gap-3"
          style={{ background: "var(--bg-2)", border: "1px solid #D97706" }}>
          <AlertTriangle size={16} className="text-amber-600 mt-0.5 shrink-0" />
          <p className="text-[13.5px]" style={{ color: "var(--ink-1)" }}>
            Trebuie să completezi{" "}
            <Link href="/portal/implementation" className="underline font-medium">
              formularul de onboarding
            </Link>{" "}
            înainte să poți solicita un agent.
          </p>
        </div>
      )}

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {catalogAgents.map((a) => {
          const isOwned = owned.has(a.slug);
          const isPending = pending.has(a.slug);
          return (
            <div
              key={a.slug}
              className="rounded-2xl border border-[var(--border)] bg-[var(--bg-2)] p-5 flex flex-col"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="w-11 h-11 rounded-xl bg-[var(--bg-3)] flex items-center justify-center">
                  <a.icon size={18} />
                </div>
                {isOwned && (
                  <span className="text-[10px] uppercase tracking-wider px-2 py-1 rounded-full border border-emerald-200 text-emerald-700 bg-emerald-50 flex items-center gap-1">
                    <CheckCircle2 size={10} /> Atribuit
                  </span>
                )}
                {isPending && (
                  <span className="text-[10px] uppercase tracking-wider px-2 py-1 rounded-full border border-amber-200 text-amber-700 bg-amber-50 flex items-center gap-1">
                    <Clock size={10} /> În review
                  </span>
                )}
              </div>
              <div className="text-[10px] eyebrow text-[var(--ink-3)] mb-1">{a.role}</div>
              <h3 className="text-[16px] font-medium mb-2">{a.name}</h3>
              <p className="text-[13px] text-[var(--ink-2)] leading-relaxed mb-4 flex-1">
                {a.short}
              </p>

              <div className="flex items-center justify-between mb-4 pt-3 border-t border-[var(--border)]">
                <div>
                  <div className="text-[10px] eyebrow text-[var(--ink-3)]">Setup</div>
                  <div className="text-[13.5px] font-medium tabular-nums">{a.setupFrom} €</div>
                </div>
                <div className="text-right">
                  <div className="text-[10px] eyebrow text-[var(--ink-3)]">Lunar</div>
                  <div className="text-[13.5px] font-medium tabular-nums">{a.monthlyFrom} €</div>
                </div>
              </div>

              {!isOwned && !isPending && intakeDone && (
                <form
                  action={async (fd) => {
                    "use server";
                    await requestAgent(a.slug, String(fd.get("message") || "") || undefined);
                  }}
                >
                  <textarea
                    name="message"
                    rows={2}
                    placeholder="De ce ai nevoie de acest agent? (opțional)"
                    className="w-full mb-2 px-3 py-2 rounded-xl border border-[var(--border)] bg-[var(--bg)] text-[12.5px] focus:outline-none focus:ring-2 focus:ring-[var(--ink)]/20"
                  />
                  <button
                    type="submit"
                    className="w-full px-4 py-2.5 rounded-xl bg-[var(--ink)] text-[var(--bg-2)] text-[13px] flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
                  >
                    <ShoppingBag size={14} /> Solicită agentul
                  </button>
                </form>
              )}
              {!isOwned && !isPending && !intakeDone && (
                <button
                  disabled
                  title="Completează formularul de onboarding mai întâi"
                  className="w-full px-4 py-2.5 rounded-xl border border-[var(--border)] text-[var(--ink-3)] text-[13px] cursor-not-allowed"
                >
                  Onboarding necesar
                </button>
              )}
              {isPending && (
                <button
                  disabled
                  className="w-full px-4 py-2.5 rounded-xl border border-[var(--border)] text-[var(--ink-3)] text-[13px] cursor-not-allowed"
                >
                  Cerere trimisă
                </button>
              )}
              {isOwned && (
                <button
                  disabled
                  className="w-full px-4 py-2.5 rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-700 text-[13px] cursor-default"
                >
                  Deja în contul tău
                </button>
              )}
            </div>
          );
        })}
      </div>
    </>
  );
}
