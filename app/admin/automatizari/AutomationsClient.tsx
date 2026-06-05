"use client";

import { useState } from "react";
import { Zap, Play, Loader2, ExternalLink, Power } from "lucide-react";

type WF = { id: string; name: string; active: boolean; updatedAt?: string };

export function AutomationsClient({ initial, n8nUrl }: { initial: WF[]; n8nUrl: string }) {
  const [items, setItems] = useState<WF[]>(initial);
  const [busy, setBusy] = useState<Record<string, string>>({});
  const [filter, setFilter] = useState("");

  async function act(id: string, action: "activate" | "deactivate" | "run") {
    setBusy((b) => ({ ...b, [id]: action }));
    try {
      const res = await fetch("/api/admin/automatizari/toggle", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, action }),
      });
      if (res.ok && action !== "run") {
        setItems((prev) => prev.map((w) => (w.id === id ? { ...w, active: action === "activate" } : w)));
      }
    } finally {
      setBusy((b) => { const n = { ...b }; delete n[id]; return n; });
    }
  }

  const filtered = items.filter((w) => w.name.toLowerCase().includes(filter.toLowerCase()));
  const activeCount = items.filter((w) => w.active).length;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <input
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          placeholder="Caută automatizare…"
          className="flex-1 min-w-[200px] px-3 py-2 text-[13px] rounded-lg border border-[var(--border)] bg-[var(--bg)]"
        />
        <span className="text-[12px] text-[var(--ink-3)]">
          {activeCount} active · {items.length} total
        </span>
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-2)] p-10 text-center">
          <Zap size={28} className="mx-auto text-[var(--ink-3)] mb-2" />
          <p className="text-[13px] text-[var(--ink-2)]">
            {items.length === 0 ? "n8n nu e accesibil sau nu există workflow-uri." : "Niciun rezultat."}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((w) => (
            <div key={w.id} className="rounded-xl border border-[var(--border)] bg-[var(--bg-2)] p-4 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ background: w.active ? "#10B981" : "#9CA3AF", boxShadow: w.active ? "0 0 8px #10B981" : "none" }}
                />
                <div className="min-w-0">
                  <div className="text-[14px] font-medium truncate">{w.name}</div>
                  <div className="text-[11px] text-[var(--ink-3)]">
                    {w.active ? "Activă" : "Oprită"}
                    {w.updatedAt && ` · actualizat ${new Date(w.updatedAt).toLocaleDateString("ro-RO")}`}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  onClick={() => act(w.id, "run")}
                  disabled={!!busy[w.id]}
                  title="Rulează acum"
                  className="p-2 rounded-lg hover:bg-[var(--bg-3)] text-[var(--ink-2)] disabled:opacity-40"
                >
                  {busy[w.id] === "run" ? <Loader2 size={14} className="animate-spin" /> : <Play size={14} />}
                </button>
                <a
                  href={`${n8nUrl}/workflow/${w.id}`}
                  target="_blank" rel="noopener noreferrer"
                  title="Editează în n8n"
                  className="p-2 rounded-lg hover:bg-[var(--bg-3)] text-[var(--ink-2)]"
                >
                  <ExternalLink size={14} />
                </a>
                <button
                  onClick={() => act(w.id, w.active ? "deactivate" : "activate")}
                  disabled={!!busy[w.id]}
                  className="px-3 py-1.5 rounded-lg text-[12px] font-medium flex items-center gap-1.5 disabled:opacity-40"
                  style={{
                    background: w.active ? "rgba(220,38,38,0.08)" : "#10B981",
                    color: w.active ? "#DC2626" : "#fff",
                  }}
                >
                  {busy[w.id] && busy[w.id] !== "run" ? <Loader2 size={12} className="animate-spin" /> : <Power size={12} />}
                  {w.active ? "Oprește" : "Pornește"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
