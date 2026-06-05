"use client";

import { useState } from "react";
import { CreditCard, Loader2 } from "lucide-react";
import { createCustomPaymentLink } from "./actions";

type ClientOpt = { id: string; businessName: string };
const AGENTS = [
  "voicebot", "schedulerbot", "supportbot", "salesbot", "socialbot",
  "accountbot", "contentbot", "reviewbot", "designbot", "hrbot",
];

export function LinkForm({ clients }: { clients: ClientOpt[] }) {
  const [submitting, setSubmitting] = useState(false);
  const [mode, setMode] = useState<"payment" | "subscription">("payment");
  const [currency, setCurrency] = useState("eur");
  const [amount, setAmount] = useState("");

  return (
    <form
      action={createCustomPaymentLink}
      onSubmit={() => setSubmitting(true)}
      className="rounded-2xl border border-[var(--border)] bg-[var(--bg-2)] p-6 space-y-5"
    >
      <div>
        <label className="text-[11px] text-[var(--ink-3)] block mb-1">Descriere (apare la client) *</label>
        <input
          name="description"
          required
          placeholder="Ex: Growth + setup custom — deal pe teren"
          className="w-full px-3 py-2.5 text-[14px] rounded-lg border border-[var(--border)] bg-[var(--bg)]"
        />
      </div>

      <div className="grid sm:grid-cols-3 gap-3">
        <div>
          <label className="text-[11px] text-[var(--ink-3)] block mb-1">Sumă *</label>
          <input
            name="amount"
            type="number" step="0.01" min="1" required
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="800"
            className="w-full px-3 py-2.5 text-[14px] rounded-lg border border-[var(--border)] bg-[var(--bg)]"
          />
        </div>
        <div>
          <label className="text-[11px] text-[var(--ink-3)] block mb-1">Monedă</label>
          <select
            name="currency" value={currency}
            onChange={(e) => setCurrency(e.target.value)}
            className="w-full px-3 py-2.5 text-[14px] rounded-lg border border-[var(--border)] bg-[var(--bg)]"
          >
            <option value="eur">EUR</option>
            <option value="ron">RON</option>
          </select>
        </div>
        <div>
          <label className="text-[11px] text-[var(--ink-3)] block mb-1">Tip plată</label>
          <select
            name="mode" value={mode}
            onChange={(e) => setMode(e.target.value as "payment" | "subscription")}
            className="w-full px-3 py-2.5 text-[14px] rounded-lg border border-[var(--border)] bg-[var(--bg)]"
          >
            <option value="payment">Plată unică</option>
            <option value="subscription">Abonament lunar</option>
          </select>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-3">
        <div>
          <label className="text-[11px] text-[var(--ink-3)] block mb-1">Client (opțional — pentru provisioning auto)</label>
          <select name="clientId" defaultValue="" className="w-full px-3 py-2.5 text-[14px] rounded-lg border border-[var(--border)] bg-[var(--bg)]">
            <option value="">— Fără client legat —</option>
            {clients.map((c) => (
              <option key={c.id} value={c.id}>{c.businessName}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-[11px] text-[var(--ink-3)] block mb-1">Agent legat (opțional — auto-activare după plată)</label>
          <select name="agentSlug" defaultValue="" className="w-full px-3 py-2.5 text-[14px] rounded-lg border border-[var(--border)] bg-[var(--bg)]">
            <option value="">— Fără agent legat —</option>
            {AGENTS.map((a) => (
              <option key={a} value={a}>{a}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-3">
        <div>
          <label className="text-[11px] text-[var(--ink-3)] block mb-1">Email client (opțional)</label>
          <input name="customerEmail" type="email" placeholder="client@firma.ro" className="w-full px-3 py-2.5 text-[14px] rounded-lg border border-[var(--border)] bg-[var(--bg)]" />
        </div>
        <div>
          <label className="text-[11px] text-[var(--ink-3)] block mb-1">Nume client</label>
          <input name="customerName" placeholder="SC Exemplu SRL" className="w-full px-3 py-2.5 text-[14px] rounded-lg border border-[var(--border)] bg-[var(--bg)]" />
        </div>
      </div>

      <div>
        <label className="text-[11px] text-[var(--ink-3)] block mb-1">Notă internă (nu apare la client)</label>
        <input name="internalNote" placeholder="Ex: deal Ionescu — 15% discount + 2 luni gratis" className="w-full px-3 py-2.5 text-[14px] rounded-lg border border-[var(--border)] bg-[var(--bg)]" />
      </div>

      <div className="flex items-center justify-between pt-2 border-t border-[var(--border)]">
        <div className="text-[13px]">
          <span className="text-[var(--ink-3)]">Total: </span>
          <strong className="text-[18px] tabular-nums">
            {amount ? Number(amount).toLocaleString("ro-RO", { minimumFractionDigits: 2 }) : "0.00"}
          </strong>{" "}
          <span className="text-[var(--ink-3)]">{currency.toUpperCase()}</span>
          {mode === "subscription" && <span className="text-[12px] text-[var(--ink-3)]"> /lună</span>}
        </div>
        <button
          type="submit" disabled={submitting}
          className="px-6 h-11 rounded-xl text-[13.5px] font-medium flex items-center gap-2"
          style={{ background: "var(--ink)", color: "var(--bg)" }}
        >
          {submitting ? <Loader2 size={15} className="animate-spin" /> : <CreditCard size={15} />}
          Generează link Stripe
        </button>
      </div>
    </form>
  );
}
