import { AdminShell } from "@/components/admin/AdminShell";
import { prisma } from "@/lib/db";
import { oblioEnabled, isVatPayer } from "@/lib/oblio";
import { InvoiceForm } from "./InvoiceForm";
import { resendInvoice } from "./actions";
import { FileText, Download, Mail, AlertTriangle, CheckCircle2 } from "lucide-react";

export const metadata = { title: "Facturare · Admin" };
export const dynamic = "force-dynamic";

export default async function FacturiPage({
  searchParams,
}: {
  searchParams: Promise<{ ok?: string; err?: string }>;
}) {
  const sp = await searchParams;
  const invoices = await prisma.invoice.findMany({ orderBy: { createdAt: "desc" }, take: 50 });
  const enabled = oblioEnabled();

  const total30 = invoices
    .filter((i) => i.status !== "error" && i.createdAt > new Date(Date.now() - 30 * 86400000))
    .reduce((s, i) => s + i.amount, 0);

  const banner =
    sp.ok && sp.ok !== "resent"
      ? { t: `Factură emisă: ${sp.ok}`, ok: true }
      : sp.ok === "resent"
      ? { t: "Factura a fost retrimisă pe email.", ok: true }
      : sp.err === "oblio"
      ? { t: "Oblio a respins factura. Verifică datele (CUI, serie, TVA).", ok: false }
      : sp.err === "no_items"
      ? { t: "Adaugă cel puțin o linie cu preț.", ok: false }
      : sp.err
      ? { t: "A apărut o eroare. Reîncearcă.", ok: false }
      : null;

  return (
    <AdminShell>
      <div className="max-w-[920px] space-y-6">
        <header>
          <p className="eyebrow mb-1">Facturare</p>
          <h1 className="h-display text-3xl mb-1">Facturi custom</h1>
          <p className="text-[14px] text-[var(--ink-2)]">
            Emite facturi legale pentru deal-urile tale — direct prin Oblio, trimise automat la ANAF.
          </p>
        </header>

        {!enabled && (
          <div className="rounded-xl px-4 py-3 flex items-start gap-3" style={{ background: "#FFF7ED", border: "1px solid #F59E0B" }}>
            <AlertTriangle size={15} className="text-amber-600 mt-0.5 shrink-0" />
            <p className="text-[13px] text-amber-800">
              Oblio nu e configurat complet (lipsesc env vars sau seria). Verifică <code className="bg-amber-100 px-1 rounded">OBLIO_*</code>.
            </p>
          </div>
        )}

        {banner && (
          <div className="rounded-xl px-4 py-3 text-[13px] flex items-center gap-2"
            style={{ background: banner.ok ? "#ECFDF5" : "#FEF2F2", border: `1px solid ${banner.ok ? "#A7F3D0" : "#FECACA"}`, color: banner.ok ? "#065F46" : "#991B1B" }}>
            {banner.ok ? <CheckCircle2 size={15} /> : <AlertTriangle size={15} />}
            {banner.t}
          </div>
        )}

        <InvoiceForm vatPayer={isVatPayer()} />

        {/* ISTORIC */}
        <section>
          <div className="flex items-baseline justify-between mb-3">
            <h2 className="h-display text-xl">Facturi emise</h2>
            <span className="text-[12px] text-[var(--ink-3)]">
              Ultimele 30 zile: <strong>{(total30 / 100).toLocaleString("ro-RO")} </strong>(mixt monede)
            </span>
          </div>

          {invoices.length === 0 ? (
            <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-2)] p-10 text-center">
              <FileText size={28} className="mx-auto text-[var(--ink-3)] mb-2" />
              <p className="text-[13px] text-[var(--ink-2)]">Nicio factură emisă încă.</p>
            </div>
          ) : (
            <div className="rounded-2xl overflow-hidden border border-[var(--border)]">
              <table className="w-full text-[13px]">
                <thead>
                  <tr style={{ background: "var(--bg-2)" }} className="border-b border-[var(--border)]">
                    <th className="px-4 py-3 text-left text-[11px] uppercase tracking-wider text-[var(--ink-2)]">Număr</th>
                    <th className="px-4 py-3 text-left text-[11px] uppercase tracking-wider text-[var(--ink-2)]">Client</th>
                    <th className="px-4 py-3 text-right text-[11px] uppercase tracking-wider text-[var(--ink-2)]">Total</th>
                    <th className="px-4 py-3 text-left text-[11px] uppercase tracking-wider text-[var(--ink-2)]">Data</th>
                    <th className="px-4 py-3 text-right text-[11px] uppercase tracking-wider text-[var(--ink-2)]">Acțiuni</th>
                  </tr>
                </thead>
                <tbody>
                  {invoices.map((inv, i) => (
                    <tr key={inv.id} style={{ background: i % 2 ? "var(--bg-2)" : "var(--bg)" }} className="border-b border-[var(--border)]">
                      <td className="px-4 py-3 font-medium">
                        {inv.status === "error" ? (
                          <span className="text-red-500 text-[11px]">EȘUAT</span>
                        ) : (
                          <span>{inv.series}-{inv.number}</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div>{inv.clientName}</div>
                        {inv.clientCui && <div className="text-[11px] text-[var(--ink-3)]">{inv.clientCui}</div>}
                      </td>
                      <td className="px-4 py-3 text-right tabular-nums">
                        {(inv.amount / 100).toLocaleString("ro-RO", { minimumFractionDigits: 2 })} {inv.currency}
                      </td>
                      <td className="px-4 py-3 text-[12px] text-[var(--ink-2)]">
                        {new Date(inv.createdAt).toLocaleDateString("ro-RO")}
                        {inv.status === "sent" && <span className="ml-1 text-emerald-600 text-[10px]">· trimis</span>}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1 justify-end">
                          {inv.status !== "error" && (
                            <>
                              <a href={`/api/admin/invoices/pdf?id=${inv.id}`} target="_blank" rel="noopener noreferrer"
                                className="p-1.5 rounded-lg hover:bg-[var(--bg-3)] text-[var(--ink-2)]" title="Descarcă PDF">
                                <Download size={14} />
                              </a>
                              {inv.clientEmail && (
                                <form action={resendInvoice}>
                                  <input type="hidden" name="id" value={inv.id} />
                                  <button type="submit" className="p-1.5 rounded-lg hover:bg-[var(--bg-3)] text-[var(--ink-2)]" title="Retrimite email">
                                    <Mail size={14} />
                                  </button>
                                </form>
                              )}
                            </>
                          )}
                          {inv.status === "error" && (
                            <span className="text-[10px] text-red-500 max-w-[140px] truncate" title={inv.smartbillError ?? ""}>
                              {inv.smartbillError?.slice(0, 30)}
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </AdminShell>
  );
}
