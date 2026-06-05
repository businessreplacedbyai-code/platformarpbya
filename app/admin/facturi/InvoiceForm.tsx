"use client";

import { useMemo, useState } from "react";
import { Plus, Trash2, FileText, Loader2 } from "lucide-react";
import { createCustomInvoice } from "./actions";

type Line = {
  description: string;
  quantity: number;
  unitPrice: number;
  vat: number;
  unit: string;
  taxIncluded: boolean;
};

const UNITS = ["buc", "serviciu", "luna", "ora", "abonament"];
const VATS = [19, 9, 5, 0];

export function InvoiceForm({ vatPayer = false }: { vatPayer?: boolean }) {
  const emptyLine = (): Line => ({
    description: "",
    quantity: 1,
    unitPrice: 0,
    vat: vatPayer ? 19 : 0,
    unit: "buc",
    taxIncluded: !vatPayer ? false : true,
  });

  const [lines, setLines] = useState<Line[]>([emptyLine()]);
  const [currency, setCurrency] = useState("RON");
  const [submitting, setSubmitting] = useState(false);

  const total = useMemo(
    () => lines.reduce((s, l) => s + l.unitPrice * (l.quantity || 0), 0),
    [lines]
  );

  function update(i: number, patch: Partial<Line>) {
    setLines((prev) => prev.map((l, idx) => (idx === i ? { ...l, ...patch } : l)));
  }
  function addLine() {
    setLines((prev) => [...prev, { ...emptyLine(), vat: prev[0]?.vat ?? 19 }]);
  }
  function removeLine(i: number) {
    setLines((prev) => (prev.length > 1 ? prev.filter((_, idx) => idx !== i) : prev));
  }

  const fmt = (n: number) =>
    n.toLocaleString("ro-RO", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  return (
    <form
      action={createCustomInvoice}
      onSubmit={() => setSubmitting(true)}
      className="rounded-2xl border border-[var(--border)] bg-[var(--bg-2)] p-6 space-y-6"
    >
      <input type="hidden" name="itemsJson" value={JSON.stringify(lines)} />

      {/* CLIENT */}
      <div>
        <div className="text-[11px] eyebrow text-[var(--ink-3)] mb-3">Date client</div>
        <div className="grid sm:grid-cols-2 gap-3">
          <Field name="clientName" label="Nume client / firmă *" required placeholder="SC Exemplu SRL" />
          <Field name="clientCui" label="CUI / CIF (firme)" placeholder="RO12345678" />
          <Field name="clientEmail" label="Email (pentru trimitere)" type="email" placeholder="contact@firma.ro" />
          <Field name="clientCity" label="Localitate" placeholder="Iași" />
          <Field name="clientAddress" label="Adresă" placeholder="Str. ..." />
          <Field name="clientCounty" label="Județ" placeholder="Iași" />
        </div>
        <label className="flex items-center gap-2 mt-3 text-[12.5px] text-[var(--ink-2)]">
          <input type="checkbox" name="isTaxPayer" className="rounded" />
          Clientul e plătitor de TVA (firmă cu cod valid de TVA)
        </label>
      </div>

      {/* LINII */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="text-[11px] eyebrow text-[var(--ink-3)]">Produse / servicii</div>
          <select
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
            name="currency"
            className="text-[12px] px-2 py-1 rounded-lg border border-[var(--border)] bg-[var(--bg)]"
          >
            <option value="RON">RON</option>
            <option value="EUR">EUR</option>
          </select>
        </div>

        <div className="space-y-2">
          {lines.map((l, i) => (
            <div key={i} className="grid grid-cols-[1fr_70px_100px_80px_90px_32px] gap-2 items-center">
              <input
                value={l.description}
                onChange={(e) => update(i, { description: e.target.value })}
                placeholder="Descriere (ex: Agent AI — setup custom)"
                className="px-3 py-2 text-[13px] rounded-lg border border-[var(--border)] bg-[var(--bg)]"
              />
              <input
                type="number" min={1} value={l.quantity}
                onChange={(e) => update(i, { quantity: Number(e.target.value) })}
                className="px-2 py-2 text-[13px] rounded-lg border border-[var(--border)] bg-[var(--bg)] text-center"
                title="Cantitate"
              />
              <input
                type="number" min={0} step="0.01" value={l.unitPrice}
                onChange={(e) => update(i, { unitPrice: Number(e.target.value) })}
                placeholder="Preț"
                className="px-2 py-2 text-[13px] rounded-lg border border-[var(--border)] bg-[var(--bg)] text-right"
                title="Preț unitar"
              />
              {vatPayer ? (
                <select
                  value={l.vat}
                  onChange={(e) => update(i, { vat: Number(e.target.value) })}
                  className="px-1 py-2 text-[12px] rounded-lg border border-[var(--border)] bg-[var(--bg)]"
                  title="TVA %"
                >
                  {VATS.map((v) => <option key={v} value={v}>TVA {v}%</option>)}
                </select>
              ) : (
                <div className="px-1 py-2 text-[11px] text-[var(--ink-3)] text-center" title="Firmă neplătitoare de TVA">fără TVA</div>
              )}
              <select
                value={l.unit}
                onChange={(e) => update(i, { unit: e.target.value })}
                className="px-1 py-2 text-[12px] rounded-lg border border-[var(--border)] bg-[var(--bg)]"
                title="UM"
              >
                {UNITS.map((u) => <option key={u} value={u}>{u}</option>)}
              </select>
              <button
                type="button" onClick={() => removeLine(i)}
                className="flex items-center justify-center h-9 rounded-lg text-[var(--ink-3)] hover:text-red-500 hover:bg-red-50"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>

        <button
          type="button" onClick={addLine}
          className="mt-3 flex items-center gap-1.5 text-[12.5px] text-[var(--ink-2)] hover:text-[var(--ink)]"
        >
          <Plus size={14} /> Adaugă linie
        </button>

        <div className="mt-3 text-[11px] text-[var(--ink-3)]">
          {vatPayer ? (
            <>Prețurile sunt <strong>cu TVA inclus</strong>. Oblio calculează automat defalcarea.</>
          ) : (
            <>Firmă <strong>neplătitoare de TVA</strong> — facturile se emit fără TVA. Prețul introdus = total de plată.</>
          )}
        </div>
      </div>

      {/* OPȚIUNI + TOTAL */}
      <div className="flex flex-wrap items-end justify-between gap-4 pt-2 border-t border-[var(--border)]">
        <div className="flex items-end gap-4">
          <div>
            <label className="text-[11px] text-[var(--ink-3)] block mb-1">Scadență (zile)</label>
            <input name="dueDays" type="number" defaultValue={5} min={0} className="w-20 px-2 py-1.5 text-[13px] rounded-lg border border-[var(--border)] bg-[var(--bg)]" />
          </div>
          <label className="flex items-center gap-2 text-[12.5px] text-[var(--ink-2)] pb-1.5">
            <input type="checkbox" name="sendEmail" defaultChecked className="rounded" />
            Trimite pe email automat
          </label>
        </div>
        <div className="text-right">
          <div className="text-[11px] text-[var(--ink-3)]">Total factură</div>
          <div className="text-[26px] font-semibold tabular-nums">
            {fmt(total)} <span className="text-[15px] text-[var(--ink-3)]">{currency}</span>
          </div>
        </div>
      </div>

      <div>
        <input name="mentions" placeholder="Mențiuni pe factură (opțional)" className="w-full px-3 py-2 text-[13px] rounded-lg border border-[var(--border)] bg-[var(--bg)] mb-3" />
        <button
          type="submit" disabled={submitting || total <= 0}
          className="w-full h-12 rounded-xl text-[14px] font-medium flex items-center justify-center gap-2 disabled:opacity-50"
          style={{ background: "var(--ink)", color: "var(--bg)" }}
        >
          {submitting ? <Loader2 size={16} className="animate-spin" /> : <FileText size={16} />}
          Emite factura legală (Oblio → ANAF)
        </button>
      </div>
    </form>
  );
}

function Field({ name, label, type = "text", required, placeholder }: { name: string; label: string; type?: string; required?: boolean; placeholder?: string }) {
  return (
    <div>
      <label className="text-[11px] text-[var(--ink-3)] block mb-1">{label}</label>
      <input
        name={name} type={type} required={required} placeholder={placeholder}
        className="w-full px-3 py-2 text-[13px] rounded-lg border border-[var(--border)] bg-[var(--bg)] focus:outline-none focus:ring-1 focus:ring-[var(--ink)]"
      />
    </div>
  );
}
