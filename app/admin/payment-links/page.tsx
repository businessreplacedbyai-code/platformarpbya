import { AdminShell } from "@/components/admin/AdminShell";
import { prisma } from "@/lib/db";
import { LinkForm } from "./LinkForm";
import { disablePaymentLink } from "./actions";
import { CopyLink } from "./CopyLink";
import { Link2, CheckCircle2, XCircle, Power } from "lucide-react";

export const metadata = { title: "Payment Links · Admin" };
export const dynamic = "force-dynamic";

const STATUS: Record<string, { label: string; color: string }> = {
  active: { label: "Activ", color: "#2563EB" },
  paid: { label: "Plătit", color: "#059669" },
  disabled: { label: "Dezactivat", color: "#6B7280" },
  expired: { label: "Expirat", color: "#9CA3AF" },
};

export default async function PaymentLinksPage({
  searchParams,
}: {
  searchParams: Promise<{ ok?: string; err?: string }>;
}) {
  const sp = await searchParams;
  const links = await prisma.paymentLink.findMany({
    orderBy: { createdAt: "desc" },
    take: 50,
  });
  const clients = await prisma.client.findMany({
    select: { id: true, businessName: true },
    orderBy: { businessName: "asc" },
  });

  const banner =
    sp.ok === "disabled" ? { t: "Link dezactivat.", ok: true } :
    sp.ok ? { t: "Link generat. Copiază-l și trimite-l clientului.", ok: true } :
    sp.err === "stripe" ? { t: "Stripe a respins. Verifică suma și moneda.", ok: false } :
    sp.err === "missing" ? { t: "Completează descrierea și suma.", ok: false } :
    sp.err ? { t: "Eroare.", ok: false } : null;

  const totalActive = links.filter((l) => l.status === "active").reduce((s, l) => s + l.amount, 0);

  return (
    <AdminShell>
      <div className="max-w-[920px] space-y-6">
        <header>
          <p className="eyebrow mb-1">Stripe</p>
          <h1 className="h-display text-3xl mb-1">Linkuri plată custom</h1>
          <p className="text-[14px] text-[var(--ink-2)]">
            Pentru deal-urile tale pe teren. Generezi link unic, îl trimiți pe WhatsApp,
            plătește pe loc, factura iese automat, agentul se activează automat.
          </p>
        </header>

        {banner && (
          <div className="rounded-xl px-4 py-3 text-[13px]"
            style={{ background: banner.ok ? "#ECFDF5" : "#FEF2F2", border: `1px solid ${banner.ok ? "#A7F3D0" : "#FECACA"}`, color: banner.ok ? "#065F46" : "#991B1B" }}>
            {banner.t}
          </div>
        )}

        <LinkForm clients={clients} />

        {/* ISTORIC */}
        <section>
          <div className="flex items-baseline justify-between mb-3">
            <h2 className="h-display text-xl">Linkuri generate</h2>
            <span className="text-[12px] text-[var(--ink-3)]">
              Active: <strong>{links.filter(l => l.status === "active").length}</strong> ·
              valoare: <strong>{(totalActive / 100).toLocaleString("ro-RO", { minimumFractionDigits: 2 })}</strong> (mixt)
            </span>
          </div>

          {links.length === 0 ? (
            <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-2)] p-10 text-center">
              <Link2 size={28} className="mx-auto text-[var(--ink-3)] mb-2" />
              <p className="text-[13px] text-[var(--ink-2)]">Nici un link generat încă.</p>
            </div>
          ) : (
            <div className="rounded-2xl overflow-hidden border border-[var(--border)]">
              <table className="w-full text-[13px]">
                <thead>
                  <tr style={{ background: "var(--bg-2)" }} className="border-b border-[var(--border)]">
                    <th className="px-4 py-3 text-left text-[11px] uppercase tracking-wider text-[var(--ink-2)]">Descriere</th>
                    <th className="px-4 py-3 text-right text-[11px] uppercase tracking-wider text-[var(--ink-2)]">Sumă</th>
                    <th className="px-4 py-3 text-left text-[11px] uppercase tracking-wider text-[var(--ink-2)]">Status</th>
                    <th className="px-4 py-3 text-right text-[11px] uppercase tracking-wider text-[var(--ink-2)]">Acțiuni</th>
                  </tr>
                </thead>
                <tbody>
                  {links.map((l, i) => {
                    const cfg = STATUS[l.status] ?? STATUS.active;
                    return (
                      <tr key={l.id} style={{ background: i % 2 ? "var(--bg-2)" : "var(--bg)" }} className="border-b border-[var(--border)]">
                        <td className="px-4 py-3">
                          <div className="font-medium">{l.description}</div>
                          <div className="text-[11px] text-[var(--ink-3)] mt-0.5 flex items-center gap-2">
                            {l.mode === "subscription" ? "abonament lunar" : "plată unică"}
                            {l.agentSlug && <>· agent: {l.agentSlug}</>}
                            {l.customerEmail && <>· {l.customerEmail}</>}
                          </div>
                          {l.internalNote && (
                            <div className="text-[11px] text-[var(--ink-3)] mt-0.5 italic">↳ {l.internalNote}</div>
                          )}
                        </td>
                        <td className="px-4 py-3 text-right tabular-nums">
                          <strong>{(l.amount / 100).toLocaleString("ro-RO", { minimumFractionDigits: 2 })}</strong> {l.currency.toUpperCase()}
                        </td>
                        <td className="px-4 py-3">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10.5px] font-medium"
                            style={{ background: `${cfg.color}15`, color: cfg.color }}>
                            {l.status === "paid" ? <CheckCircle2 size={11} /> : l.status === "disabled" ? <XCircle size={11} /> : null}
                            {cfg.label}
                          </span>
                          {l.paidAt && <div className="text-[10px] text-[var(--ink-3)] mt-0.5">{new Date(l.paidAt).toLocaleDateString("ro-RO")}</div>}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-end gap-1.5">
                            {l.status === "active" && (
                              <>
                                <CopyLink url={l.url} description={l.description} />
                                <form action={disablePaymentLink}>
                                  <input type="hidden" name="id" value={l.id} />
                                  <button type="submit" title="Dezactivează"
                                    className="p-1.5 rounded-lg hover:bg-red-50 text-[var(--ink-3)] hover:text-red-500">
                                    <Power size={13} />
                                  </button>
                                </form>
                              </>
                            )}
                            {l.status !== "active" && l.url && (
                              <a href={l.url} target="_blank" rel="noopener noreferrer"
                                className="text-[11.5px] text-[var(--ink-3)] underline">
                                vezi link
                              </a>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </AdminShell>
  );
}
