"use client";

import { useState } from "react";
import { Handshake, Phone } from "lucide-react";

type Deal = {
  id: string; businessName: string; contactName: string | null; phone: string | null;
  city: string | null; packageWanted: string | null; value: number | null;
  notes: string | null; status: string; callerEmail: string | null; createdAt: string;
};

const STATUS = [
  { key: "nou", label: "Nou", cls: "bg-amber-50 text-amber-700 border-amber-200" },
  { key: "in_lucru", label: "În lucru", cls: "bg-blue-50 text-blue-700 border-blue-200" },
  { key: "livrat", label: "Livrat", cls: "bg-emerald-50 text-emerald-700 border-emerald-200" },
];

export function DealsClient({ initial }: { initial: Deal[] }) {
  const [deals, setDeals] = useState(initial);
  const [filter, setFilter] = useState("toate");

  async function setStatus(id: string, status: string) {
    setDeals((ds) => ds.map((d) => (d.id === id ? { ...d, status } : d)));
    fetch("/api/admin/deals", {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status }),
    }).catch(() => {});
  }

  const shown = filter === "toate" ? deals : deals.filter((d) => d.status === filter);
  const counts = {
    toate: deals.length,
    nou: deals.filter((d) => d.status === "nou").length,
    in_lucru: deals.filter((d) => d.status === "in_lucru").length,
    livrat: deals.filter((d) => d.status === "livrat").length,
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <header className="mb-5">
        <h1 className="h-display text-2xl mb-1 flex items-center gap-2"><Handshake size={20} /> Dealuri închise</h1>
        <p className="text-[13.5px] text-[var(--ink-3)]">Ce a închis echipa de cold-call. Vezi ce vrea clientul → creează-l → marchează „Livrat".</p>
      </header>

      <div className="flex flex-wrap gap-2 mb-5">
        {[
          { k: "toate", l: "Toate" },
          { k: "nou", l: "Noi" },
          { k: "in_lucru", l: "În lucru" },
          { k: "livrat", l: "Livrate" },
        ].map((t) => (
          <button key={t.k} onClick={() => setFilter(t.k)}
            className={`px-3 h-9 rounded-lg text-[12.5px] font-medium border ${filter === t.k ? "bg-[var(--ink)] text-[var(--bg-2)] border-[var(--ink)]" : "bg-[var(--bg-2)] text-[var(--ink-2)] border-[var(--border)]"}`}>
            {t.l} ({counts[t.k as keyof typeof counts]})
          </button>
        ))}
      </div>

      {shown.length === 0 ? (
        <div className="text-center py-12 text-[13.5px] text-[var(--ink-3)]">Niciun deal aici încă.</div>
      ) : (
        <div className="space-y-3">
          {shown.map((d) => (
            <div key={d.id} className="rounded-2xl border border-[var(--border)] bg-[var(--bg-2)] p-5">
              <div className="flex items-start justify-between gap-3 mb-2">
                <div className="min-w-0">
                  <div className="text-[16px] font-semibold">{d.businessName}</div>
                  <div className="text-[12.5px] text-[var(--ink-3)]">
                    {d.contactName ? `${d.contactName} · ` : ""}{d.city ?? ""}
                    {d.phone ? <> · <a href={`tel:${d.phone}`} className="text-[var(--ink)] hover:underline"><Phone size={11} className="inline -mt-0.5" /> {d.phone}</a></> : ""}
                  </div>
                </div>
                {d.value ? <span className="shrink-0 text-[13px] font-semibold">{d.value} lei/lună</span> : null}
              </div>

              <div className="rounded-xl bg-[var(--bg)] border border-[var(--border)] p-3 mb-3">
                <div className="text-[10px] uppercase tracking-wider text-[var(--ink-3)] mb-1">Ce vrea clientul</div>
                <div className="text-[13.5px] text-[var(--ink-1)] whitespace-pre-wrap">{d.packageWanted || "—"}</div>
                {d.notes && <div className="text-[12px] text-[var(--ink-3)] mt-2 whitespace-pre-wrap">📝 {d.notes}</div>}
              </div>

              <div className="flex items-center justify-between gap-2 flex-wrap">
                <div className="text-[11.5px] text-[var(--ink-3)]">
                  {d.callerEmail ? `de ${d.callerEmail.split("@")[0]} · ` : ""}{new Date(d.createdAt).toLocaleDateString("ro-RO")}
                </div>
                <div className="flex gap-1.5">
                  {STATUS.map((s) => (
                    <button key={s.key} onClick={() => setStatus(d.id, s.key)}
                      className={`px-2.5 h-8 rounded-lg text-[11.5px] font-medium border transition-colors ${d.status === s.key ? s.cls : "bg-[var(--bg)] text-[var(--ink-3)] border-[var(--border)] hover:bg-[var(--bg-3)]"}`}>
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
