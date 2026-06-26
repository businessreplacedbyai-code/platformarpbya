"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Sparkles, Megaphone, MessageSquare, Video, FileText, Target,
  MapPin, Crosshair, Loader2, Copy, Check, ArrowRight,
} from "lucide-react";

const TYPES = [
  { key: "strategie", label: "Strategie clienți", icon: Target, ph: "ex: strategie pentru clinici stomatologice din Cluj (lasă gol = strategia de azi)" },
  { key: "reclama", label: "Reclamă", icon: Megaphone, ph: "ex: reclamă Meta pentru agent vocal la cabinete stomatologice" },
  { key: "mesaj", label: "Mesaj outreach", icon: MessageSquare, ph: "ex: mesaj WhatsApp pentru saloane de înfrumusețare din Iași" },
  { key: "social", label: "Postare / Reel", icon: Video, ph: "ex: reel despre câte programări pierde o clinică la apel ratat" },
  { key: "oferta", label: "Ofertă / Material", icon: FileText, ph: "ex: ofertă cu ROI pentru un cabinet stomatologic" },
];

export function MotorClient() {
  const [type, setType] = useState("strategie");
  const [input, setInput] = useState("");
  const [out, setOut] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [copied, setCopied] = useState(false);

  const active = TYPES.find((t) => t.key === type)!;

  async function generate() {
    setLoading(true); setErr(""); setOut(""); setCopied(false);
    try {
      const res = await fetch("/api/admin/motor/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, input }),
      });
      const j = await res.json();
      if (!res.ok) setErr(j.error || "Eroare la generare");
      else setOut(j.text || "");
    } catch {
      setErr("Eroare de rețea");
    }
    setLoading(false);
  }

  function copy() {
    navigator.clipboard.writeText(out).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  }

  const card = "group rounded-2xl p-5 border border-[var(--border)] bg-[var(--bg-2)] hover:-translate-y-0.5 transition-all";

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <header className="mb-6">
        <h1 className="h-display text-2xl mb-1 flex items-center gap-2"><Sparkles size={20} /> Motor de creștere</h1>
        <p className="text-[13.5px] text-[var(--ink-3)]">
          Găsește clienți, generează reclame, mesaje, conținut și oferte — cu AI. <strong>Strategia zilei</strong> îți vine automat și pe email, în fiecare dimineață.
        </p>
      </header>

      {/* Găsește clienți */}
      <div className="grid sm:grid-cols-2 gap-3 mb-8">
        <Link href="/admin/harta" className={card}>
          <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3" style={{ background: "#EF44441a", color: "#EF4444" }}><MapPin size={18} /></div>
          <div className="text-[15px] font-semibold mb-1">Hartă lead-uri</div>
          <p className="text-[12.5px] text-[var(--ink-2)] mb-2">Firme fără site pe hartă, cu telefon + listă de cold-call + găsire patron.</p>
          <span className="inline-flex items-center gap-1 text-[12.5px] font-medium text-[var(--ink)]">Deschide harta <ArrowRight size={13} className="group-hover:translate-x-0.5 transition-transform" /></span>
        </Link>
        <Link href="/admin/outreach" className={card}>
          <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3" style={{ background: "#7C3AED1a", color: "#7C3AED" }}><Crosshair size={18} /></div>
          <div className="text-[15px] font-semibold mb-1">Outreach</div>
          <p className="text-[12.5px] text-[var(--ink-2)] mb-2">Caută firme (Google Places), generează mesaje și trimite — pe oraș și categorie.</p>
          <span className="inline-flex items-center gap-1 text-[12.5px] font-medium text-[var(--ink)]">Deschide outreach <ArrowRight size={13} className="group-hover:translate-x-0.5 transition-transform" /></span>
        </Link>
      </div>

      {/* Generator */}
      <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-2)] p-5">
        <div className="text-[13px] font-medium mb-3">Generează cu AI</div>
        <div className="flex flex-wrap gap-2 mb-4">
          {TYPES.map((t) => {
            const on = t.key === type;
            return (
              <button key={t.key} onClick={() => { setType(t.key); setOut(""); setErr(""); }}
                className={`inline-flex items-center gap-1.5 px-3 h-9 rounded-lg text-[12.5px] font-medium border transition-colors ${on ? "bg-[var(--ink)] text-[var(--bg-2)] border-[var(--ink)]" : "bg-[var(--bg)] text-[var(--ink-2)] border-[var(--border)] hover:bg-[var(--bg-3)]"}`}>
                <t.icon size={14} /> {t.label}
              </button>
            );
          })}
        </div>

        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={active.ph}
          rows={2}
          className="w-full px-3.5 py-2.5 text-[13.5px] rounded-xl bg-[var(--bg)] border border-[var(--border)] focus:outline-none focus:ring-1 focus:ring-[var(--ink)] resize-none mb-3"
        />
        <button onClick={generate} disabled={loading}
          className="h-10 px-5 rounded-xl text-[13px] font-medium flex items-center gap-2 bg-[var(--ink)] text-[var(--bg-2)] disabled:opacity-50">
          {loading ? <Loader2 size={15} className="animate-spin" /> : <Sparkles size={15} />}
          {loading ? "Generez…" : `Generează ${active.label.toLowerCase()}`}
        </button>

        {err && <p className="mt-3 text-[12.5px] text-[#DC2626]">{err}</p>}

        {out && (
          <div className="mt-4 rounded-xl border border-[var(--border)] bg-[var(--bg)] p-4">
            <div className="flex justify-end mb-2">
              <button onClick={copy} className="inline-flex items-center gap-1.5 text-[12px] px-2.5 h-8 rounded-lg border border-[var(--border)] hover:bg-[var(--bg-3)]">
                {copied ? <><Check size={13} className="text-emerald-600" /> Copiat</> : <><Copy size={13} /> Copiază</>}
              </button>
            </div>
            <div className="text-[13.5px] leading-relaxed whitespace-pre-wrap text-[var(--ink-1)]">{out}</div>
          </div>
        )}
      </div>
    </div>
  );
}
