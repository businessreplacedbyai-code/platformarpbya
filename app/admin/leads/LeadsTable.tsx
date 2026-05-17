"use client";
import { useState, useTransition, useMemo } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Download,
  Search,
  ChevronRight,
  Loader2,
  AlertTriangle,
} from "lucide-react";
import { bulkUpdateLeadStatus, bulkDeleteLeads, exportLeadsCSV } from "./lead-actions";

type Lead = {
  id: string;
  name: string;
  business: string;
  phone: string;
  email: string;
  status: string;
  score: number;
  sector: string | null;
  employees: string | null;
  urgency: string | null;
  cui: string | null;
  cuiValid: boolean;
  city: string | null;
  createdAt: Date;
};

const STATUS_OPTIONS = ["new", "contacted", "qualified", "won", "lost"] as const;

export function LeadsTable({
  leads,
  currentStatus,
  currentSector,
  currentMinScore,
}: {
  leads: Lead[];
  currentStatus?: string;
  currentSector?: string;
  currentMinScore?: number;
}) {
  const router = useRouter();
  const sp = useSearchParams();
  const [q, setQ] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [pending, startTransition] = useTransition();
  const [confirmDelete, setConfirmDelete] = useState(false);

  const filtered = useMemo(() => {
    if (!q.trim()) return leads;
    const needle = q.toLowerCase().trim();
    return leads.filter(
      (l) =>
        l.business.toLowerCase().includes(needle) ||
        l.name.toLowerCase().includes(needle) ||
        l.email.toLowerCase().includes(needle) ||
        l.phone.toLowerCase().includes(needle) ||
        (l.cui ?? "").toLowerCase().includes(needle) ||
        (l.city ?? "").toLowerCase().includes(needle)
    );
  }, [leads, q]);

  function toggle(id: string) {
    setSelected((s) => {
      const next = new Set(s);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }
  function toggleAll() {
    if (selected.size === filtered.length) setSelected(new Set());
    else setSelected(new Set(filtered.map((l) => l.id)));
  }

  function setQuery(key: string, value: string | null) {
    const u = new URLSearchParams(sp.toString());
    if (value === null || value === "" || value === "all") u.delete(key);
    else u.set(key, value);
    router.push(`/admin/leads?${u.toString()}`);
  }

  function doBulkStatus(status: string) {
    if (selected.size === 0) return;
    startTransition(async () => {
      await bulkUpdateLeadStatus(Array.from(selected), status);
      setSelected(new Set());
      router.refresh();
    });
  }

  function doDelete() {
    startTransition(async () => {
      await bulkDeleteLeads(Array.from(selected));
      setSelected(new Set());
      setConfirmDelete(false);
      router.refresh();
    });
  }

  function downloadCSV() {
    startTransition(async () => {
      const csv = await exportLeadsCSV({
        status: currentStatus,
        sector: currentSector,
        minScore: currentMinScore,
      });
      const blob = new Blob(["\ufeff" + csv], { type: "text/csv;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `leads-${new Date().toISOString().slice(0, 10)}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    });
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-wrap gap-2 items-center">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--ink-3)]" />
          <input
            type="text"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Caută nume, firmă, telefon, CUI…"
            className="w-full pl-9 pr-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--bg)] text-[13px] focus:border-[var(--ink)] focus:outline-none focus:ring-2 focus:ring-[var(--ink)]/10"
          />
        </div>

        <select
          value={currentStatus ?? "all"}
          onChange={(e) => setQuery("status", e.target.value)}
          className="px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--bg)] text-[13px]"
        >
          <option value="all">Toate statusurile</option>
          {STATUS_OPTIONS.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>

        <select
          value={currentSector ?? ""}
          onChange={(e) => setQuery("sector", e.target.value)}
          className="px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--bg)] text-[13px]"
        >
          <option value="">Toate sectoarele</option>
          <option value="horeca">HoReCa</option>
          <option value="medical">Medical</option>
          <option value="beauty">Beauty</option>
          <option value="imobiliare">Imobiliare</option>
          <option value="retail">Retail</option>
          <option value="servicii">Servicii</option>
          <option value="altul">Altul</option>
        </select>

        <select
          value={String(currentMinScore ?? "")}
          onChange={(e) => setQuery("minScore", e.target.value)}
          className="px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--bg)] text-[13px]"
        >
          <option value="">Orice scor</option>
          <option value="65">Hot (65+)</option>
          <option value="35">Warm (35+)</option>
        </select>

        <button
          onClick={downloadCSV}
          disabled={pending}
          className="ml-auto px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--bg)] text-[13px] hover:bg-[var(--bg-3)] flex items-center gap-1.5 disabled:opacity-50"
        >
          {pending ? <Loader2 size={13} className="animate-spin" /> : <Download size={13} />}
          Export CSV
        </button>
      </div>

      {/* Bulk action bar */}
      {selected.size > 0 && (
        <div className="rounded-xl border border-[var(--ink)] bg-[var(--bg-2)] p-3 flex items-center gap-3 flex-wrap">
          <span className="text-[13px] font-medium">{selected.size} selectate</span>
          <div className="flex gap-1 flex-wrap">
            {STATUS_OPTIONS.map((s) => (
              <button
                key={s}
                onClick={() => doBulkStatus(s)}
                disabled={pending}
                className="px-2.5 py-1 rounded-full text-[11px] border border-[var(--border)] bg-[var(--bg)] hover:bg-[var(--bg-3)] disabled:opacity-50"
              >
                → {s}
              </button>
            ))}
          </div>
          {!confirmDelete ? (
            <button
              onClick={() => setConfirmDelete(true)}
              className="ml-auto text-[12px] text-red-600 hover:underline"
            >
              Șterge
            </button>
          ) : (
            <div className="ml-auto flex items-center gap-2">
              <AlertTriangle size={13} className="text-red-600" />
              <span className="text-[12px] text-red-700">Sigur?</span>
              <button
                onClick={doDelete}
                disabled={pending}
                className="text-[12px] px-2 py-0.5 rounded bg-red-600 text-white"
              >
                Da
              </button>
              <button
                onClick={() => setConfirmDelete(false)}
                className="text-[12px] text-[var(--ink-3)]"
              >
                Nu
              </button>
            </div>
          )}
        </div>
      )}

      {/* Table */}
      <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-2)] overflow-hidden">
        {filtered.length === 0 ? (
          <div className="text-center text-[14px] text-[var(--ink-3)] py-16">
            Niciun lead.
          </div>
        ) : (
          <table className="w-full text-[13px]">
            <thead>
              <tr className="border-b border-[var(--border)] text-[11px] eyebrow text-[var(--ink-3)]">
                <th className="px-4 py-3 w-8">
                  <input
                    type="checkbox"
                    checked={selected.size === filtered.length}
                    onChange={toggleAll}
                  />
                </th>
                <th className="px-4 py-3 text-left">Firmă</th>
                <th className="px-4 py-3 text-left">Contact</th>
                <th className="px-4 py-3 text-left">Sector</th>
                <th className="px-4 py-3 text-center">Scor</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3 text-right">Primit</th>
                <th className="px-4 py-3 w-8"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((l) => (
                <tr
                  key={l.id}
                  className="border-t border-[var(--border)] hover:bg-[var(--bg-3)] transition-colors"
                >
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={selected.has(l.id)}
                      onChange={() => toggle(l.id)}
                    />
                  </td>
                  <td className="px-4 py-3">
                    <Link href={`/admin/leads/${l.id}`} className="hover:underline">
                      <div className="font-medium">{l.business}</div>
                      {l.cui && (
                        <div className="text-[11px] text-[var(--ink-3)]">
                          CUI {l.cui} {l.cuiValid && "✓"}
                        </div>
                      )}
                    </Link>
                  </td>
                  <td className="px-4 py-3">
                    <div>{l.name}</div>
                    <div className="text-[11px] text-[var(--ink-3)]">{l.phone}</div>
                  </td>
                  <td className="px-4 py-3 capitalize text-[12px] text-[var(--ink-2)]">
                    {l.sector ?? "—"}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <ScoreBadge score={l.score} />
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full border ${badge(
                        l.status
                      )}`}
                    >
                      {l.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right text-[11px] text-[var(--ink-3)] whitespace-nowrap">
                    {new Date(l.createdAt).toLocaleDateString("ro-RO", {
                      day: "2-digit",
                      month: "short",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </td>
                  <td className="px-4 py-3">
                    <Link href={`/admin/leads/${l.id}`}>
                      <ChevronRight size={14} className="text-[var(--ink-3)]" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

function ScoreBadge({ score }: { score: number }) {
  const tone =
    score >= 65
      ? "bg-red-50 text-red-700 border-red-200"
      : score >= 35
      ? "bg-amber-50 text-amber-700 border-amber-200"
      : "bg-[var(--bg-3)] text-[var(--ink-3)] border-[var(--border)]";
  return (
    <span className={`text-[11px] px-2 py-0.5 rounded-full border tabular-nums ${tone}`}>
      {score}
    </span>
  );
}

function badge(status: string) {
  switch (status) {
    case "new":
      return "border-amber-200 text-amber-700 bg-amber-50";
    case "contacted":
      return "border-blue-200 text-blue-700 bg-blue-50";
    case "qualified":
    case "won":
      return "border-emerald-200 text-emerald-700 bg-emerald-50";
    case "lost":
      return "border-red-200 text-red-700 bg-red-50";
    default:
      return "border-[var(--border)] text-[var(--ink-3)] bg-[var(--bg-3)]";
  }
}
