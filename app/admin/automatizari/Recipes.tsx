"use client";

import { useState } from "react";
import { Loader2, Plus, CheckCircle2 } from "lucide-react";

type Recipe = {
  key: string;
  name: string;
  description: string;
  icon: string;
  schedule?: string;
};

export function Recipes({ recipes, existingNames }: { recipes: Recipe[]; existingNames: string[] }) {
  const [busy, setBusy] = useState<Record<string, boolean>>({});
  const [created, setCreated] = useState<Record<string, boolean>>({});

  const isCreated = (name: string) => existingNames.some((n) => n.includes(name));

  async function create(key: string) {
    setBusy((b) => ({ ...b, [key]: true }));
    try {
      const res = await fetch("/api/admin/automatizari/create-recipe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key }),
      });
      if (res.ok) {
        setCreated((c) => ({ ...c, [key]: true }));
        setTimeout(() => window.location.reload(), 1500);
      }
    } finally {
      setBusy((b) => ({ ...b, [key]: false }));
    }
  }

  return (
    <section>
      <div className="mb-3">
        <h2 className="h-display text-xl">Rețete gata făcute</h2>
        <p className="text-[12.5px] text-[var(--ink-3)]">
          Click → automatizarea e creată și activată în n8n. Editare detaliată în n8n după.
        </p>
      </div>
      <div className="grid sm:grid-cols-2 gap-3">
        {recipes.map((r) => {
          const already = isCreated(r.name.split("—")[0].trim()) || created[r.key];
          return (
            <div key={r.key} className="rounded-2xl border border-[var(--border)] bg-[var(--bg-2)] p-4 flex flex-col">
              <div className="flex items-start gap-3 mb-2">
                <span className="text-[28px] leading-none">{r.icon}</span>
                <div className="flex-1 min-w-0">
                  <div className="text-[14px] font-medium">{r.name}</div>
                  {r.schedule && <div className="text-[11px] text-[var(--ink-3)] mt-0.5">⏱ {r.schedule}</div>}
                </div>
              </div>
              <p className="text-[12.5px] text-[var(--ink-2)] leading-relaxed mb-3 flex-1">{r.description}</p>
              <button
                onClick={() => create(r.key)}
                disabled={busy[r.key] || already}
                className="h-9 rounded-lg text-[12.5px] font-medium flex items-center justify-center gap-1.5 disabled:opacity-50"
                style={{
                  background: already ? "#ECFDF5" : "var(--ink)",
                  color: already ? "#065F46" : "var(--bg)",
                  border: already ? "1px solid #A7F3D0" : "none",
                }}
              >
                {busy[r.key] ? <Loader2 size={13} className="animate-spin" /> :
                  already ? <><CheckCircle2 size={13} /> Activată</> :
                  <><Plus size={13} /> Activează</>}
              </button>
            </div>
          );
        })}
      </div>
    </section>
  );
}
