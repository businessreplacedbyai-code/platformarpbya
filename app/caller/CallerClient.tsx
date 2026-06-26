"use client";

import { useCallback, useEffect, useState } from "react";
import { Phone, Loader2, Check, CheckCircle2, X, MapPin, Settings, FileText, MessageCircle } from "lucide-react";

type Lead = {
  id: string; businessName: string; category: string; city: string;
  address: string | null; phone: string | null; website: string | null;
  rating: number | null; reviewCount: number | null; status: string;
  ownerName?: string | null;
};
type MapData = { total: number; leads: Lead[]; cities: string[]; categories: string[] };

const CATEGORIES = ["stomatolog", "clinica", "salon", "restaurant", "cafenea", "hotel", "farmacie", "auto", "avocat", "contabil", "imobiliare", "it", "retail"];

export function CallerClient({ initialEmail }: { initialEmail: string }) {
  const [data, setData] = useState<MapData | null>(null);
  const [loading, setLoading] = useState(true);
  const [city, setCity] = useState("");
  const [category, setCategory] = useState("");
  const [noWebsite, setNoWebsite] = useState(true);
  const [called, setCalled] = useState<Set<string>>(new Set());
  const [owners, setOwners] = useState<Record<string, string | null>>({});
  const [findingId, setFindingId] = useState<string | null>(null);
  const [dealsToday, setDealsToday] = useState(0);
  const [dealFor, setDealFor] = useState<Lead | null>(null);
  const [email, setEmail] = useState(initialEmail);
  const [savingEmail, setSavingEmail] = useState(false);
  const [emailMsg, setEmailMsg] = useState("");
  const [panel, setPanel] = useState<"none" | "settings" | "script">("none");

  async function saveEmail() {
    setSavingEmail(true); setEmailMsg("");
    try {
      const res = await fetch("/api/admin/caller/settings", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notifyEmail: email }),
      });
      const j = await res.json();
      setEmailMsg(res.ok ? "✓ Salvat — primești lista aici de mâine." : (j.error || "Eroare"));
    } catch { setEmailMsg("Eroare de rețea"); }
    setSavingEmail(false);
  }

  const fetchData = useCallback(async () => {
    setLoading(true);
    const p = new URLSearchParams();
    if (noWebsite) p.set("noWebsite", "1");
    if (city) p.set("city", city);
    if (category) p.set("category", category);
    try {
      const res = await fetch(`/api/admin/outreach/map?${p.toString()}`);
      setData(await res.json());
    } catch { /* ignore */ }
    setLoading(false);
  }, [noWebsite, city, category]);

  useEffect(() => { const t = setTimeout(fetchData, 250); return () => clearTimeout(t); }, [fetchData]);

  async function markCalled(id: string) {
    setCalled((s) => new Set(s).add(id));
    fetch("/api/admin/outreach/set-status", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ leadId: id, status: "called" }),
    }).catch(() => {});
  }
  function isCalled(l: Lead) { return called.has(l.id) || ["called", "sent"].includes(l.status); }

  async function findOwner(id: string) {
    setFindingId(id);
    try {
      const res = await fetch("/api/admin/outreach/find-owner", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ leadId: id }),
      });
      const j = await res.json();
      setOwners((o) => ({ ...o, [id]: j.ownerName ?? "" }));
    } catch { setOwners((o) => ({ ...o, [id]: "" })); }
    setFindingId(null);
  }
  function ownerOf(l: Lead): string | null {
    if (l.id in owners) return owners[l.id] || null;
    return l.ownerName ?? null;
  }

  const leads = (data?.leads || []).filter((l) => l.phone);
  const select = "h-10 px-3 rounded-xl text-[14px] bg-[var(--bg)] border border-[var(--border)]";

  return (
    <div>
      <header className="mb-4">
        <h1 className="h-display text-xl mb-1">Lista ta de apeluri</h1>
        <p className="text-[13px] text-[var(--ink-3)] mb-3">
          {loading ? "se încarcă…" : `${leads.length} de sunat`} · <span className="text-[var(--ink-1)] font-medium">{called.size} sunate</span> · <span className="text-emerald-700 font-medium">{dealsToday} deal-uri azi</span>
        </p>
        <div className="flex gap-2">
          <button onClick={() => setPanel((p) => (p === "script" ? "none" : "script"))}
            className="inline-flex items-center gap-1.5 h-9 px-3 rounded-lg text-[12.5px] font-medium border border-[var(--border)] bg-[var(--bg-2)]">
            <FileText size={14} /> Script
          </button>
          <button onClick={() => setPanel((p) => (p === "settings" ? "none" : "settings"))}
            className="inline-flex items-center gap-1.5 h-9 px-3 rounded-lg text-[12.5px] font-medium border border-[var(--border)] bg-[var(--bg-2)]">
            <Settings size={14} /> Mailul meu
          </button>
        </div>
      </header>

      {panel === "settings" && (
        <div className="mb-4 rounded-2xl border border-[var(--border)] bg-[var(--bg-2)] p-4">
          <div className="text-[13px] font-medium mb-1">Mailul tău pentru cele 50 de firme/zi</div>
          <p className="text-[12px] text-[var(--ink-3)] mb-3">În fiecare dimineață primești aici lista de firme fără site, gata de sunat.</p>
          <div className="flex gap-2">
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="numele.tau@gmail.com"
              className="flex-1 h-10 px-3 text-[14px] rounded-xl bg-[var(--bg)] border border-[var(--border)]" />
            <button onClick={saveEmail} disabled={savingEmail}
              className="h-10 px-4 rounded-xl text-[13px] font-medium bg-[var(--ink)] text-[var(--bg-2)] disabled:opacity-60">
              {savingEmail ? "…" : "Salvează"}
            </button>
          </div>
          {emailMsg && <p className="text-[12px] mt-2 text-[var(--ink-2)]">{emailMsg}</p>}
        </div>
      )}

      {panel === "script" && (
        <div className="mb-4 rounded-2xl border border-[var(--border)] bg-[var(--bg-2)] p-4 text-[13px] leading-relaxed">
          <div className="text-[11px] font-semibold mb-2 uppercase tracking-wide text-[var(--ink-3)]">Scriptul tău — website</div>
          <p className="mb-2">„Bună ziua! Vorbesc cu cineva de la <b>[firma]</b>? … Vă fur 20 de secunde, dacă nu vă interesează închidem. Când un client vă caută pe Google, vă găsește pe hartă, apasă pe «Website»… și ce găsește?"</p>
          <p className="mb-2 text-[var(--ink-2)]">→ „Exact. Sunteți pe hartă, dar n-are unde să vadă mai mult — și pleacă la concurentul care ARE site." <b>[ Pauză. Taci. ]</b></p>
          <p className="mb-0 text-[var(--ink-2)]">→ „Nu vă vând nimic. Vă fac <b>gratis un demo</b> pe afacerea voastră. Vă place, vorbim. Nu, l-ați văzut pe gratis. Cum vă numiți și pe ce WhatsApp vi-l trimit?"</p>
        </div>
      )}

      {/* Filtre */}
      <div className="flex flex-wrap gap-2 mb-4">
        <select value={category} onChange={(e) => setCategory(e.target.value)} className={select}>
          <option value="">Toate categoriile</option>
          {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
        <select value={city} onChange={(e) => setCity(e.target.value)} className={`${select} flex-1 min-w-[140px]`}>
          <option value="">Toate orașele</option>
          {data?.cities.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
        <label className="flex items-center gap-2 h-10 px-3 rounded-xl text-[13px] bg-[var(--bg-2)] border border-[var(--border)]">
          <input type="checkbox" checked={noWebsite} onChange={(e) => setNoWebsite(e.target.checked)} /> fără site
        </label>
      </div>

      {/* Listă */}
      {leads.length === 0 && !loading ? (
        <div className="text-center py-12 text-[13.5px] text-[var(--ink-3)]">
          <MapPin size={26} className="mx-auto mb-2 opacity-40" />
          Nicio firmă cu telefon pe filtrele astea.
        </div>
      ) : (
        <div className="space-y-2.5">
          {leads.map((l) => {
            const done = isCalled(l);
            const o = ownerOf(l);
            const digits = (l.phone || "").replace(/\D/g, "");
            return (
              <div key={l.id} className="rounded-2xl border border-[var(--border)] bg-[var(--bg-2)] p-4">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <div className="min-w-0">
                    <div className="text-[15px] font-medium leading-tight">{l.businessName}</div>
                    <div className="text-[12px] text-[var(--ink-3)] mt-0.5">
                      {l.category} · {l.city}{l.rating != null ? ` · ⭐ ${l.rating}` : ""}
                    </div>
                  </div>
                  {!l.website && <span className="shrink-0 text-[10px] px-1.5 py-0.5 rounded bg-red-50 text-red-700 border border-red-200">fără site</span>}
                </div>

                <div className="text-[12.5px] mb-3">
                  {o ? <span className="text-[var(--ink-2)]">👤 {o}</span> : (l.id in owners)
                    ? <span className="text-[var(--ink-3)]">patron negăsit</span>
                    : <button onClick={() => findOwner(l.id)} disabled={findingId === l.id} className="text-[var(--ink-3)] underline">{findingId === l.id ? "caut patronul…" : "caută patron"}</button>}
                </div>

                <div className="flex items-center gap-2">
                  <a href={`tel:${l.phone}`} onClick={() => markCalled(l.id)}
                    className="flex-1 h-11 rounded-xl flex items-center justify-center gap-2 text-[14px] font-medium bg-emerald-600 text-white">
                    <Phone size={16} /> {l.phone}
                  </a>
                  <a href={`https://wa.me/${digits.replace(/^0/, "40")}`} target="_blank" rel="noopener" aria-label="WhatsApp"
                    className="h-11 px-3 rounded-xl flex items-center justify-center bg-[#25D366] text-white">
                    <MessageCircle size={17} />
                  </a>
                  <button onClick={() => markCalled(l.id)} disabled={done}
                    className={`h-11 px-3 rounded-xl text-[12.5px] font-medium border ${done ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "border-[var(--border)] text-[var(--ink-2)]"}`}>
                    {done ? "✓" : "sunat"}
                  </button>
                  <button onClick={() => setDealFor(l)}
                    className="h-11 px-3 rounded-xl text-[12.5px] font-medium bg-[var(--ink)] text-[var(--bg-2)]">
                    ✓ Deal
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal deal închis */}
      {dealFor && (
        <DealModal
          lead={dealFor}
          onClose={() => setDealFor(null)}
          onSaved={() => { setDealFor(null); setDealsToday((n) => n + 1); }}
        />
      )}
    </div>
  );
}

function DealModal({ lead, onClose, onSaved }: { lead: Lead; onClose: () => void; onSaved: () => void }) {
  const [packageWanted, setPackageWanted] = useState("");
  const [value, setValue] = useState("");
  const [contactName, setContactName] = useState(lead.ownerName || "");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");

  async function save() {
    if (!packageWanted.trim()) { setErr("Scrie ce vrea clientul."); return; }
    setSaving(true); setErr("");
    try {
      const res = await fetch("/api/admin/deals", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          businessName: lead.businessName, contactName, phone: lead.phone, city: lead.city,
          packageWanted, value: value || null, notes, leadId: lead.id,
        }),
      });
      const j = await res.json();
      if (!res.ok) { setErr(j.error || "Eroare"); setSaving(false); return; }
      onSaved();
    } catch { setErr("Eroare de rețea"); setSaving(false); }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center" style={{ background: "rgba(0,0,0,0.45)" }} onClick={onClose}>
      <div className="w-full sm:max-w-md bg-[var(--bg-2)] rounded-t-3xl sm:rounded-3xl p-5 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-[16px] font-semibold">✓ Deal închis</h2>
          <button onClick={onClose} className="text-[var(--ink-3)]"><X size={20} /></button>
        </div>
        <p className="text-[13px] text-[var(--ink-2)] mb-4">{lead.businessName} · {lead.phone}</p>

        <label className="block text-[12.5px] mb-1">Ce vrea clientul? *</label>
        <textarea value={packageWanted} onChange={(e) => setPackageWanted(e.target.value)} rows={3}
          placeholder="ex: site + agent vocal pentru programări; pachet Complet 890/lună"
          className="w-full px-3 py-2.5 text-[14px] rounded-xl bg-[var(--bg)] border border-[var(--border)] resize-none mb-3" />

        <div className="grid grid-cols-2 gap-2 mb-3">
          <div>
            <label className="block text-[12.5px] mb-1">Persoană contact</label>
            <input value={contactName} onChange={(e) => setContactName(e.target.value)} placeholder="nume patron"
              className="w-full h-10 px-3 text-[14px] rounded-xl bg-[var(--bg)] border border-[var(--border)]" />
          </div>
          <div>
            <label className="block text-[12.5px] mb-1">Valoare (lei/lună)</label>
            <input value={value} onChange={(e) => setValue(e.target.value)} inputMode="numeric" placeholder="ex: 890"
              className="w-full h-10 px-3 text-[14px] rounded-xl bg-[var(--bg)] border border-[var(--border)]" />
          </div>
        </div>

        <label className="block text-[12.5px] mb-1">Note (opțional)</label>
        <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2}
          placeholder="detalii, când să-l sunăm, ce a promis..."
          className="w-full px-3 py-2.5 text-[14px] rounded-xl bg-[var(--bg)] border border-[var(--border)] resize-none mb-3" />

        {err && <p className="text-[12.5px] text-[#DC2626] mb-2">{err}</p>}

        <button onClick={save} disabled={saving}
          className="w-full h-12 rounded-xl text-[14px] font-medium flex items-center justify-center gap-2 bg-emerald-600 text-white disabled:opacity-60">
          {saving ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle2 size={16} />}
          {saving ? "Salvez…" : "Salvează deal-ul"}
        </button>
      </div>
    </div>
  );
}
