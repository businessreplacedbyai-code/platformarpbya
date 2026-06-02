"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Search, Users, Inbox, X } from "lucide-react";

type Client = { slug: string; businessName: string; contactName: string; status: string };
type Lead = { id: string; business: string; name: string; status: string; score: number };
type Results = { clients: Client[]; leads: Lead[] };

export function GlobalSearch() {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [results, setResults] = useState<Results>({ clients: [], leads: [] });
  const [cursor, setCursor] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  // Cmd+K / Ctrl+K
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen((o) => !o);
      }
      if (e.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setQ("");
      setResults({ clients: [], leads: [] });
      setCursor(0);
    }
  }, [open]);

  const search = useCallback(async (val: string) => {
    if (val.length < 2) { setResults({ clients: [], leads: [] }); return; }
    const res = await fetch(`/api/admin/search?q=${encodeURIComponent(val)}`);
    if (res.ok) setResults(await res.json());
  }, []);

  useEffect(() => {
    const t = setTimeout(() => search(q), 200);
    return () => clearTimeout(t);
  }, [q, search]);

  const allItems: Array<{ href: string; label: string; sub: string; type: "client" | "lead"; badge?: string }> = [
    ...results.clients.map((c) => ({
      href: `/admin/clients/${c.slug}`,
      label: c.businessName,
      sub: c.contactName,
      type: "client" as const,
      badge: c.status,
    })),
    ...results.leads.map((l) => ({
      href: `/admin/leads/${l.id}`,
      label: l.business,
      sub: l.name,
      type: "lead" as const,
      badge: `scor ${l.score}`,
    })),
  ];

  function navigate(href: string) {
    router.push(href);
    setOpen(false);
  }

  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key === "ArrowDown") { e.preventDefault(); setCursor((c) => Math.min(c + 1, allItems.length - 1)); }
    if (e.key === "ArrowUp") { e.preventDefault(); setCursor((c) => Math.max(c - 1, 0)); }
    if (e.key === "Enter" && allItems[cursor]) navigate(allItems[cursor].href);
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-[var(--border)] bg-[var(--bg)] text-[12px] text-[var(--ink-3)] hover:bg-[var(--bg-3)] transition-colors w-full"
      >
        <Search size={12} />
        <span className="flex-1 text-left">Caută…</span>
        <kbd className="text-[10px] bg-[var(--bg-3)] border border-[var(--border)] rounded px-1">⌘K</kbd>
      </button>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh] bg-black/40" onClick={() => setOpen(false)}>
      <div
        className="w-full max-w-lg bg-[var(--bg-2)] rounded-2xl border border-[var(--border)] shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Input */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-[var(--border)]">
          <Search size={15} className="text-[var(--ink-3)] shrink-0" />
          <input
            ref={inputRef}
            value={q}
            onChange={(e) => { setQ(e.target.value); setCursor(0); }}
            onKeyDown={onKeyDown}
            placeholder="Caută client sau lead…"
            className="flex-1 bg-transparent text-[14px] outline-none placeholder:text-[var(--ink-3)]"
          />
          <button onClick={() => setOpen(false)}>
            <X size={14} className="text-[var(--ink-3)] hover:text-[var(--ink)]" />
          </button>
        </div>

        {/* Results */}
        {allItems.length > 0 && (
          <div className="p-2 max-h-80 overflow-y-auto">
            {results.clients.length > 0 && (
              <p className="px-3 py-1 text-[10px] eyebrow text-[var(--ink-3)]">Clienți</p>
            )}
            {results.clients.map((c, i) => (
              <ResultRow
                key={c.slug}
                icon={Users}
                label={c.businessName}
                sub={c.contactName}
                badge={c.status}
                active={cursor === i}
                onClick={() => navigate(`/admin/clients/${c.slug}`)}
                onMouseEnter={() => setCursor(i)}
              />
            ))}

            {results.leads.length > 0 && (
              <p className="px-3 py-1 text-[10px] eyebrow text-[var(--ink-3)] mt-1">Leads</p>
            )}
            {results.leads.map((l, i) => (
              <ResultRow
                key={l.id}
                icon={Inbox}
                label={l.business}
                sub={l.name}
                badge={`scor ${l.score}`}
                active={cursor === results.clients.length + i}
                onClick={() => navigate(`/admin/leads/${l.id}`)}
                onMouseEnter={() => setCursor(results.clients.length + i)}
              />
            ))}
          </div>
        )}

        {q.length >= 2 && allItems.length === 0 && (
          <div className="px-4 py-8 text-center text-[13px] text-[var(--ink-3)]">
            Niciun rezultat pentru „{q}"
          </div>
        )}

        {q.length < 2 && (
          <div className="px-4 py-6 text-center text-[12px] text-[var(--ink-3)]">
            Scrie cel puțin 2 caractere
          </div>
        )}
      </div>
    </div>
  );
}

function ResultRow({
  icon: Icon,
  label,
  sub,
  badge,
  active,
  onClick,
  onMouseEnter,
}: {
  icon: typeof Users;
  label: string;
  sub: string;
  badge?: string;
  active: boolean;
  onClick: () => void;
  onMouseEnter: () => void;
}) {
  return (
    <button
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors ${
        active ? "bg-[var(--ink)] text-[var(--bg-2)]" : "hover:bg-[var(--bg-3)]"
      }`}
    >
      <Icon size={14} className={active ? "opacity-80" : "text-[var(--ink-3)]"} />
      <div className="flex-1 min-w-0">
        <div className="text-[13.5px] font-medium truncate">{label}</div>
        <div className={`text-[11.5px] truncate ${active ? "opacity-70" : "text-[var(--ink-3)]"}`}>{sub}</div>
      </div>
      {badge && (
        <span className={`text-[10px] px-2 py-0.5 rounded-full border shrink-0 ${
          active
            ? "border-white/30 text-white/80 bg-white/10"
            : "border-[var(--border)] text-[var(--ink-3)] bg-[var(--bg-3)]"
        }`}>
          {badge}
        </span>
      )}
    </button>
  );
}
