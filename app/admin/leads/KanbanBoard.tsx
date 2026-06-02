"use client";

import { useState, useRef, useTransition } from "react";
import Link from "next/link";
import { updateLeadStatus } from "../admin-actions";

const COLUMNS = [
  { key: "new",       label: "New",       dot: "bg-amber-400",   head: "border-amber-200 bg-amber-50",   text: "text-amber-800" },
  { key: "contacted", label: "Contacted", dot: "bg-blue-400",    head: "border-blue-200 bg-blue-50",     text: "text-blue-800" },
  { key: "qualified", label: "Qualified", dot: "bg-violet-400",  head: "border-violet-200 bg-violet-50", text: "text-violet-800" },
  { key: "won",       label: "Won",       dot: "bg-emerald-500", head: "border-emerald-200 bg-emerald-50", text: "text-emerald-800" },
  { key: "lost",      label: "Lost",      dot: "bg-red-400",     head: "border-red-200 bg-red-50",       text: "text-red-800" },
] as const;

type Lead = {
  id: string;
  business: string;
  name: string;
  score: number;
  sector: string | null;
  status: string;
  createdAt: string;
};

export function KanbanBoard({ initialLeads }: { initialLeads: Lead[] }) {
  const [leads, setLeads] = useState(initialLeads);
  const [, startTransition] = useTransition();
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [overCol, setOverCol] = useState<string | null>(null);

  function leadsFor(status: string) {
    return leads.filter((l) => l.status === status);
  }

  function onDragStart(id: string) {
    setDraggingId(id);
  }

  function onDrop(newStatus: string) {
    if (!draggingId) return;
    const lead = leads.find((l) => l.id === draggingId);
    if (!lead || lead.status === newStatus) {
      setDraggingId(null);
      setOverCol(null);
      return;
    }
    setLeads((prev) => prev.map((l) => l.id === draggingId ? { ...l, status: newStatus } : l));
    startTransition(() => { updateLeadStatus(draggingId, newStatus); });
    setDraggingId(null);
    setOverCol(null);
  }

  return (
    <div className="flex gap-3 overflow-x-auto pb-4 min-h-[600px]">
      {COLUMNS.map((col) => {
        const colLeads = leadsFor(col.key);
        const isOver = overCol === col.key;
        return (
          <div
            key={col.key}
            className="flex flex-col min-w-[220px] flex-1"
            onDragOver={(e) => { e.preventDefault(); setOverCol(col.key); }}
            onDragLeave={() => setOverCol(null)}
            onDrop={() => onDrop(col.key)}
          >
            {/* Header coloană */}
            <div className={`flex items-center justify-between px-3 py-2 rounded-xl border mb-2 ${col.head}`}>
              <div className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${col.dot}`} />
                <span className={`text-[12px] font-medium ${col.text}`}>{col.label}</span>
              </div>
              <span className={`text-[11px] ${col.text} opacity-70`}>{colLeads.length}</span>
            </div>

            {/* Drop zone */}
            <div className={`flex-1 rounded-xl transition-colors ${isOver ? "bg-[var(--bg-3)]" : ""} space-y-2`}>
              {colLeads.map((lead) => (
                <LeadCard
                  key={lead.id}
                  lead={lead}
                  isDragging={draggingId === lead.id}
                  onDragStart={() => onDragStart(lead.id)}
                  onDragEnd={() => { setDraggingId(null); setOverCol(null); }}
                />
              ))}
              {colLeads.length === 0 && (
                <div className={`rounded-xl border-2 border-dashed h-20 flex items-center justify-center text-[12px] text-[var(--ink-3)] transition-colors ${isOver ? "border-[var(--ink-3)]" : "border-[var(--border)]"}`}>
                  Drop here
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function LeadCard({
  lead,
  isDragging,
  onDragStart,
  onDragEnd,
}: {
  lead: Lead;
  isDragging: boolean;
  onDragStart: () => void;
  onDragEnd: () => void;
}) {
  const score = lead.score;
  const scoreCls = score >= 65 ? "text-red-700 bg-red-50" : score >= 35 ? "text-amber-700 bg-amber-50" : "text-[var(--ink-3)] bg-[var(--bg-3)]";
  const daysAgo = Math.floor((Date.now() - new Date(lead.createdAt).getTime()) / 86400000);

  return (
    <Link
      href={`/admin/leads/${lead.id}`}
      draggable
      onDragStart={(e) => { e.stopPropagation(); onDragStart(); }}
      onDragEnd={onDragEnd}
      className={`block rounded-xl border border-[var(--border)] bg-[var(--bg-2)] p-3 cursor-grab active:cursor-grabbing hover:shadow-sm transition-all select-none ${isDragging ? "opacity-40 scale-95" : ""}`}
      onClick={(e) => { if (isDragging) e.preventDefault(); }}
    >
      <div className="flex items-start justify-between gap-2 mb-1">
        <span className="text-[13px] font-medium leading-tight truncate">{lead.business}</span>
        <span className={`text-[10px] px-1.5 py-0.5 rounded-full tabular-nums shrink-0 ${scoreCls}`}>{score}</span>
      </div>
      <div className="text-[11.5px] text-[var(--ink-3)] truncate">{lead.name}</div>
      {lead.sector && (
        <div className="text-[10.5px] text-[var(--ink-3)] mt-1 capitalize">{lead.sector}</div>
      )}
      <div className="text-[10px] text-[var(--ink-3)] mt-2 opacity-60">
        {daysAgo === 0 ? "azi" : daysAgo === 1 ? "ieri" : `${daysAgo}z ago`}
      </div>
    </Link>
  );
}
