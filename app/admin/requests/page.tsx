import { AdminShell } from "@/components/admin/AdminShell";
import { prisma } from "@/lib/db";
import { agents } from "@/lib/agents";
import { updatePurchaseRequest } from "../client-actions";
import Link from "next/link";
import { CheckCircle2, XCircle, Sparkles } from "lucide-react";

export const dynamic = "force-dynamic";

const STATUS_FILTERS = ["all", "pending", "approved", "rejected", "implemented"] as const;

export default async function RequestsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;
  const filter =
    status && STATUS_FILTERS.includes(status as typeof STATUS_FILTERS[number])
      ? status
      : "pending";

  const requests = await prisma.agentPurchaseRequest.findMany({
    where: filter !== "all" ? { status: filter } : undefined,
    orderBy: { createdAt: "desc" },
    include: { client: true },
  });

  return (
    <AdminShell>
      <header className="mb-8">
        <p className="eyebrow mb-2">Cereri agenți</p>
        <h1 className="h-display text-3xl">Solicitări din portal client</h1>
      </header>

      <div className="flex gap-1 mb-6 border-b border-[var(--border)] overflow-x-auto">
        {STATUS_FILTERS.map((s) => (
          <Link
            key={s}
            href={s === "pending" ? "/admin/requests" : `/admin/requests?status=${s}`}
            className={`px-4 py-2 text-[13px] border-b-2 -mb-px whitespace-nowrap transition-colors ${
              filter === s
                ? "border-[var(--ink)] text-[var(--ink)]"
                : "border-transparent text-[var(--ink-3)] hover:text-[var(--ink-1)]"
            }`}
          >
            {s === "all" ? "Toate" : s}
          </Link>
        ))}
      </div>

      {requests.length === 0 ? (
        <div className="text-center py-20 rounded-2xl border border-[var(--border)] bg-[var(--bg-2)]">
          <Sparkles size={28} className="mx-auto text-[var(--ink-3)] mb-3" />
          <p className="text-[14px] text-[var(--ink-3)]">Nicio cerere în această categorie.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {requests.map((r) => {
            const agent = agents.find((a) => a.slug === r.agentSlug);
            return (
              <div
                key={r.id}
                className="rounded-2xl border border-[var(--border)] bg-[var(--bg-2)] p-5"
              >
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-11 h-11 rounded-xl bg-[var(--bg-3)] flex items-center justify-center text-[var(--ink-1)] shrink-0">
                    {agent?.icon ? <agent.icon size={18} /> : <Sparkles size={18} />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-[15px] font-medium">{agent?.name ?? r.agentSlug}</h3>
                      <span className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full border ${badge(r.status)}`}>
                        {r.status}
                      </span>
                    </div>
                    <Link
                      href={`/admin/clients/${r.client.slug}`}
                      className="text-[13px] text-[var(--ink-2)] hover:text-[var(--ink)] hover:underline"
                    >
                      {r.client.businessName}
                    </Link>
                    <span className="text-[12px] text-[var(--ink-3)] ml-2">
                      · {new Date(r.createdAt).toLocaleDateString("ro-RO")}
                    </span>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-[10px] eyebrow text-[var(--ink-3)]">Setup / lunar</div>
                    <div className="text-[13px] font-medium tabular-nums">
                      {agent?.setupFrom ?? "—"} € / {agent?.monthlyFrom ?? "—"} €
                    </div>
                  </div>
                </div>

                {r.message && (
                  <div className="mb-4 text-[13px] text-[var(--ink-2)] bg-[var(--bg)] border border-[var(--border)] rounded-xl p-3">
                    {r.message}
                  </div>
                )}

                {r.status === "pending" ? (
                  <form
                    action={async (fd) => {
                      "use server";
                      const action = String(fd.get("action"));
                      await updatePurchaseRequest(
                        r.id,
                        action,
                        String(fd.get("adminNote") || "") || undefined
                      );
                    }}
                    className="space-y-3"
                  >
                    <textarea
                      name="adminNote"
                      rows={2}
                      placeholder="Notă (opțional) — văzută de client"
                      className="w-full px-3 py-2 rounded-xl border border-[var(--border)] bg-[var(--bg)] text-[13.5px] focus:outline-none focus:ring-2 focus:ring-[var(--ink)]/20"
                    />
                    <div className="flex gap-2">
                      <button
                        type="submit"
                        name="action"
                        value="approved"
                        className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-[13px] transition-colors"
                      >
                        <CheckCircle2 size={14} /> Aprobă
                      </button>
                      <button
                        type="submit"
                        name="action"
                        value="rejected"
                        className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-[var(--border)] text-[13px] hover:bg-[var(--bg-3)] transition-colors"
                      >
                        <XCircle size={14} /> Respinge
                      </button>
                    </div>
                  </form>
                ) : (
                  r.adminNote && (
                    <div className="text-[12.5px] text-[var(--ink-3)] italic">
                      Răspuns admin: {r.adminNote}
                    </div>
                  )
                )}
              </div>
            );
          })}
        </div>
      )}
    </AdminShell>
  );
}

function badge(s: string) {
  switch (s) {
    case "pending":
      return "border-amber-200 text-amber-700 bg-amber-50";
    case "approved":
    case "implemented":
      return "border-emerald-200 text-emerald-700 bg-emerald-50";
    case "rejected":
      return "border-red-200 text-red-700 bg-red-50";
    default:
      return "border-[var(--border)] text-[var(--ink-3)] bg-[var(--bg-3)]";
  }
}
