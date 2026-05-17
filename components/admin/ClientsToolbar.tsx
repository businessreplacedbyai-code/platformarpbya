"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Search, X } from "lucide-react";
import { useEffect, useState, useTransition } from "react";

const STATUSES = [
  { value: "", label: "Toți" },
  { value: "onboarding", label: "Onboarding" },
  { value: "live", label: "Live" },
  { value: "paused", label: "Paused" },
  { value: "churned", label: "Churned" },
];

export function ClientsToolbar({
  counts,
}: {
  counts: Record<string, number>;
}) {
  const router = useRouter();
  const sp = useSearchParams();
  const status = sp.get("status") ?? "";
  const q = sp.get("q") ?? "";
  const [value, setValue] = useState(q);
  const [, startTransition] = useTransition();

  useEffect(() => {
    setValue(q);
  }, [q]);

  useEffect(() => {
    const t = setTimeout(() => {
      const params = new URLSearchParams(sp.toString());
      if (value) params.set("q", value);
      else params.delete("q");
      startTransition(() => {
        router.replace(`/admin/clients?${params.toString()}`);
      });
    }, 250);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  function setStatus(next: string) {
    const params = new URLSearchParams(sp.toString());
    if (next) params.set("status", next);
    else params.delete("status");
    startTransition(() => {
      router.replace(`/admin/clients?${params.toString()}`);
    });
  }

  return (
    <div className="mb-5 flex flex-wrap items-center gap-2">
      <div className="relative flex-1 min-w-[220px] max-w-md">
        <Search
          size={14}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--ink-3)]"
        />
        <input
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Caută după nume, contact sau email…"
          className="w-full pl-9 pr-9 py-2 rounded-xl border border-[var(--border)] bg-[var(--bg-2)] text-[13.5px] focus:outline-none focus:ring-2 focus:ring-[var(--ink)]/20"
        />
        {value && (
          <button
            type="button"
            onClick={() => setValue("")}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-[var(--ink-3)] hover:text-[var(--ink)]"
            aria-label="Șterge căutare"
          >
            <X size={13} />
          </button>
        )}
      </div>
      <div className="flex flex-wrap gap-1.5">
        {STATUSES.map((s) => {
          const active = status === s.value;
          const count = s.value ? counts[s.value] ?? 0 : counts.all;
          return (
            <button
              key={s.value}
              onClick={() => setStatus(s.value)}
              className={`px-3 py-1.5 rounded-full text-[12.5px] border transition-colors ${
                active
                  ? "bg-[var(--ink)] text-[var(--bg-2)] border-[var(--ink)]"
                  : "border-[var(--border)] text-[var(--ink-1)] hover:bg-[var(--bg-3)]"
              }`}
            >
              {s.label}
              <span className={`ml-1.5 text-[11px] ${active ? "opacity-70" : "text-[var(--ink-3)]"}`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
