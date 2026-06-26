"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Download, Search, Loader2, MapPin, Globe, Phone } from "lucide-react";

type Lead = {
  id: string; businessName: string; category: string; city: string;
  address: string | null; phone: string | null; website: string | null;
  rating: number | null; reviewCount: number | null;
  lat: number | null; lng: number | null; status: string;
  ownerName?: string | null;
};
type MapData = {
  total: number; capped: boolean; shown: number; leads: Lead[];
  cities: string[]; categories: string[];
};

const CATEGORIES = [
  "restaurant", "cafenea", "hotel", "clinica", "stomatolog", "salon",
  "farmacie", "contabil", "avocat", "auto", "imobiliare", "constructii",
  "transport", "it", "retail",
];

const MAJOR_CITIES = [
  "București", "Cluj-Napoca", "Timișoara", "Iași", "Constanța", "Craiova",
  "Brașov", "Galați", "Ploiești", "Oradea", "Brăila", "Arad", "Pitești",
  "Sibiu", "Bacău", "Târgu Mureș", "Baia Mare", "Buzău",
];

// ─── Leaflet din CDN (fără cheie, OpenStreetMap) ───────────────────────────
let leafletPromise: Promise<unknown> | null = null;
function loadLeaflet(): Promise<unknown> {
  if (typeof window === "undefined") return Promise.reject();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const w = window as any;
  if (w.L && w.L.markerClusterGroup) return Promise.resolve(w.L);
  if (leafletPromise) return leafletPromise;
  leafletPromise = new Promise((resolve, reject) => {
    const addCss = (href: string) => {
      const l = document.createElement("link");
      l.rel = "stylesheet";
      l.href = href;
      document.head.appendChild(l);
    };
    addCss("https://unpkg.com/leaflet@1.9.4/dist/leaflet.css");
    addCss("https://unpkg.com/leaflet.markercluster@1.5.3/dist/MarkerCluster.css");
    addCss("https://unpkg.com/leaflet.markercluster@1.5.3/dist/MarkerCluster.Default.css");
    const s = document.createElement("script");
    s.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
    s.onload = () => {
      const s2 = document.createElement("script");
      s2.src = "https://unpkg.com/leaflet.markercluster@1.5.3/dist/leaflet.markercluster.js";
      s2.onload = () => resolve(w.L);
      s2.onerror = () => resolve(w.L);
      document.body.appendChild(s2);
    };
    s.onerror = reject;
    document.body.appendChild(s);
  });
  return leafletPromise;
}

function esc(s: unknown): string {
  return String(s ?? "").replace(/[<>&"]/g, (c) =>
    ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", '"': "&quot;" }[c] as string)
  );
}
function waLink(phone: string | null): string {
  const d = (phone || "").replace(/\D/g, "");
  return d ? "https://wa.me/" + d.replace(/^0/, "40") : "";
}

export function HartaClient({ hasApiKey }: { hasApiKey: boolean }) {
  const mapRef = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mapObj = useRef<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const layerRef = useRef<any>(null);

  const [data, setData] = useState<MapData | null>(null);
  const [loading, setLoading] = useState(true);

  const [noWebsite, setNoWebsite] = useState(true);
  const [city, setCity] = useState("");
  const [category, setCategory] = useState("");
  const [minRating, setMinRating] = useState(0);
  const [q, setQ] = useState("");

  const [searchCat, setSearchCat] = useState("stomatolog");
  const [searchCity, setSearchCity] = useState("");
  const [searching, setSearching] = useState(false);
  const [batching, setBatching] = useState(false);
  const [searchMsg, setSearchMsg] = useState("");

  const [view, setView] = useState<"map" | "list">("map");
  const [called, setCalled] = useState<Set<string>>(new Set());
  const [owners, setOwners] = useState<Record<string, string | null>>({});
  const [findingId, setFindingId] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    const p = new URLSearchParams();
    if (noWebsite) p.set("noWebsite", "1");
    if (city) p.set("city", city);
    if (category) p.set("category", category);
    if (minRating) p.set("minRating", String(minRating));
    if (q) p.set("q", q);
    try {
      const res = await fetch(`/api/admin/outreach/map?${p.toString()}`);
      setData(await res.json());
    } catch {
      /* ignore */
    }
    setLoading(false);
  }, [noWebsite, city, category, minRating, q]);

  // Debounced fetch on filter change
  useEffect(() => {
    const t = setTimeout(fetchData, 350);
    return () => clearTimeout(t);
  }, [fetchData]);

  // Init map once
  useEffect(() => {
    let cancelled = false;
    loadLeaflet().then((L) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const LL = L as any;
      if (cancelled || !mapRef.current || mapObj.current) return;
      const map = LL.map(mapRef.current, { scrollWheelZoom: true }).setView([45.94, 24.97], 7);
      LL.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap",
        maxZoom: 19,
      }).addTo(map);
      layerRef.current = LL.markerClusterGroup
        ? LL.markerClusterGroup({ chunkedLoading: true, maxClusterRadius: 55 })
        : LL.layerGroup();
      layerRef.current.addTo(map);
      mapObj.current = map;
      setTimeout(() => map.invalidateSize(), 200);
      renderMarkers();
    }).catch(() => {});
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const renderMarkers = useCallback(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const LL = (window as any).L;
    if (!LL || !mapObj.current || !layerRef.current || !data) return;
    layerRef.current.clearLayers();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const markers: any[] = [];
    for (const lead of data.leads) {
      if (lead.lat == null || lead.lng == null) continue;
      const noSite = !lead.website;
      const fill = noSite ? "#EF4444" : "#94A3B8";
      const border = noSite ? "#B91C1C" : "#475569";
      const icon = LL.divIcon({
        className: "",
        html: `<span style="display:block;width:13px;height:13px;border-radius:50%;background:${fill};border:1.5px solid ${border};box-shadow:0 0 0 1px rgba(0,0,0,0.12)"></span>`,
        iconSize: [13, 13],
        iconAnchor: [7, 7],
      });
      const m = LL.marker([lead.lat, lead.lng], { icon });
      const wa = waLink(lead.phone);
      m.bindPopup(
        `<div style="min-width:190px;font-family:system-ui">
          <strong>${esc(lead.businessName)}</strong><br/>
          <span style="color:#666;font-size:12px">${esc(lead.category)}${lead.rating ? ` · ⭐ ${lead.rating} (${lead.reviewCount ?? 0})` : ""}</span><br/>
          ${lead.ownerName ? `<span style="font-size:12px;color:#333">👤 ${esc(lead.ownerName)}</span><br/>` : ""}
          ${lead.address ? `<span style="font-size:12px;color:#888">${esc(lead.address)}</span><br/>` : ""}
          ${lead.phone ? `<span style="font-size:13px">📞 ${esc(lead.phone)}</span><br/>` : ""}
          <span style="font-size:12px;font-weight:600;color:${noSite ? "#B91C1C" : "#475569"}">${noSite ? "⚠️ FĂRĂ SITE" : "are site"}</span>
          ${wa ? `<br/><a href="${wa}" target="_blank" rel="noopener" style="font-size:13px">Scrie pe WhatsApp →</a>` : ""}
        </div>`
      );
      markers.push(m);
    }
    if (layerRef.current.addLayers) layerRef.current.addLayers(markers);
    else markers.forEach((m: unknown) => layerRef.current.addLayer(m));
  }, [data]);

  useEffect(() => { renderMarkers(); }, [renderMarkers]);

  function exportCsv() {
    if (!data) return;
    const head = ["Nume", "Patron", "Categorie", "Oras", "Telefon", "Website", "Rating", "Recenzii", "Adresa"];
    const rows = [head, ...data.leads.map((l) => [
      l.businessName, ownerOf(l) || "", l.category, l.city, l.phone || "",
      l.website || "FARA SITE", l.rating != null ? String(l.rating) : "",
      l.reviewCount != null ? String(l.reviewCount) : "", l.address || "",
    ])];
    const csv = rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `leads-${city || "romania"}.csv`;
    a.click();
  }

  async function runSearch() {
    if (!searchCity.trim()) { setSearchMsg("Scrie un oraș."); return; }
    setSearching(true); setSearchMsg("");
    try {
      const res = await fetch("/api/admin/outreach/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ category: searchCat, city: searchCity.trim() }),
      });
      const j = await res.json();
      if (!res.ok) setSearchMsg(j.error || "Eroare la căutare");
      else { setSearchMsg(`✓ +${j.added} firme noi (${j.skipped} existau deja)`); fetchData(); }
    } catch {
      setSearchMsg("Eroare la căutare");
    }
    setSearching(false);
  }

  async function runBatchSearch() {
    setBatching(true); setSearchMsg("");
    try {
      const res = await fetch("/api/admin/outreach/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ categories: [searchCat], cities: MAJOR_CITIES }),
      });
      const j = await res.json();
      if (!res.ok) setSearchMsg(j.error || "Eroare la căutare");
      else { setSearchMsg(`✓ +${j.added} firme noi din ${MAJOR_CITIES.length} orașe (${j.skipped} existau deja)`); fetchData(); }
    } catch {
      setSearchMsg("Eroare la căutare");
    }
    setBatching(false);
  }

  async function markCalled(id: string) {
    setCalled((s) => new Set(s).add(id));
    try {
      await fetch("/api/admin/outreach/set-status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ leadId: id, status: "called" }),
      });
    } catch { /* ignore */ }
  }
  function isCalled(l: Lead) {
    return called.has(l.id) || ["called", "sent", "ready", "replied"].includes(l.status);
  }
  function ownerOf(l: Lead): string | null {
    if (l.id in owners) return owners[l.id] || null;
    return l.ownerName ?? null;
  }
  async function findOwner(id: string) {
    setFindingId(id);
    try {
      const res = await fetch("/api/admin/outreach/find-owner", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ leadId: id }),
      });
      const j = await res.json();
      setOwners((o) => ({ ...o, [id]: j.ownerName ?? "" }));
    } catch {
      setOwners((o) => ({ ...o, [id]: "" }));
    }
    setFindingId(null);
  }

  // Reîmprospătează harta când revii din lista de apeluri
  useEffect(() => {
    if (view === "map" && mapObj.current) {
      setTimeout(() => mapObj.current.invalidateSize(), 120);
    }
  }, [view]);

  const selectCls = "h-9 px-2.5 rounded-lg text-[13px] bg-[var(--bg)] border border-[var(--border)]";

  return (
    <div className="p-6 max-w-[1400px] mx-auto">
      <header className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="h-display text-2xl mb-1 flex items-center gap-2"><MapPin size={20} /> Hartă lead-uri</h1>
          <p className="text-[13.5px] text-[var(--ink-3)]">
            Fiecare pin = o firmă. <span className="text-[#EF4444] font-medium">Roșu = fără site</span> · gri = are site.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex rounded-lg border border-[var(--border)] overflow-hidden">
            <button onClick={() => setView("map")}
              className={`px-3 h-9 flex items-center gap-1.5 text-[12.5px] ${view === "map" ? "bg-[var(--ink)] text-[var(--bg-2)]" : "bg-[var(--bg-2)] text-[var(--ink-2)]"}`}>
              <MapPin size={13} /> Hartă
            </button>
            <button onClick={() => setView("list")}
              className={`px-3 h-9 flex items-center gap-1.5 text-[12.5px] ${view === "list" ? "bg-[var(--ink)] text-[var(--bg-2)]" : "bg-[var(--bg-2)] text-[var(--ink-2)]"}`}>
              <Phone size={13} /> Listă apeluri
            </button>
          </div>
          <div className="text-right">
            <div className="text-[22px] font-semibold tabular-nums leading-none">
              {loading ? "…" : (data?.total ?? 0).toLocaleString("ro-RO")}
            </div>
            <div className="text-[11px] text-[var(--ink-3)]">firme găsite{data?.capped ? ` · ${data.shown} pe hartă` : ""}</div>
          </div>
          <button onClick={exportCsv} disabled={!data || data.leads.length === 0}
            className="h-10 px-4 rounded-xl text-[13px] font-medium flex items-center gap-2 bg-[var(--ink)] text-[var(--bg-2)] disabled:opacity-50">
            <Download size={15} /> Export CSV
          </button>
        </div>
      </header>

      {/* Filtre */}
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <label className="flex items-center gap-2 h-9 px-3 rounded-lg text-[13px] bg-[var(--bg-2)] border border-[var(--border)] cursor-pointer">
          <input type="checkbox" checked={noWebsite} onChange={(e) => setNoWebsite(e.target.checked)} />
          Doar fără site
        </label>
        <select value={city} onChange={(e) => setCity(e.target.value)} className={selectCls}>
          <option value="">Toate orașele</option>
          {data?.cities.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
        <select value={category} onChange={(e) => setCategory(e.target.value)} className={selectCls}>
          <option value="">Toate categoriile</option>
          {(data?.categories.length ? data.categories : CATEGORIES).map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
        <select value={minRating} onChange={(e) => setMinRating(Number(e.target.value))} className={selectCls}>
          <option value={0}>Orice rating</option>
          <option value={4}>4.0+ ⭐</option>
          <option value={4.5}>4.5+ ⭐</option>
        </select>
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Caută după nume…"
          className="h-9 px-3 rounded-lg text-[13px] bg-[var(--bg)] border border-[var(--border)] flex-1 min-w-[140px]" />
      </div>

      {/* Harta (ascunsă în modul listă, dar rămâne montată) */}
      <div className="rounded-2xl overflow-hidden border border-[var(--border)]" style={{ display: view === "map" ? "block" : "none" }}>
        <div className="relative">
          <div ref={mapRef} className="w-full" style={{ height: "62vh", minHeight: 380, background: "var(--bg-3)" }} />
          {data && data.total === 0 && !loading && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="bg-[var(--bg-2)]/95 border border-[var(--border)] rounded-2xl px-6 py-5 text-center max-w-sm">
                <MapPin size={26} className="mx-auto text-[var(--ink-3)] mb-2" />
                <p className="text-[14px] font-medium mb-1">Harta e goală încă</p>
                <p className="text-[12.5px] text-[var(--ink-3)]">Caută un oraș + o categorie mai jos ca s-o populezi cu firme reale.</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Listă apeluri (cold-call) */}
      {view === "list" && (
        <div className="rounded-2xl border border-[var(--border)] overflow-hidden">
          <div className="px-4 py-2.5 border-b border-[var(--border)] text-[12px] text-[var(--ink-3)] bg-[var(--bg-2)]">
            {data ? data.leads.filter((l) => l.phone).length : 0} firme cu telefon · apasă pe număr ca să suni direct (telefon/PC)
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-[13px]">
              <thead>
                <tr className="text-left text-[11px] uppercase tracking-wider text-[var(--ink-3)] border-b border-[var(--border)]">
                  <th className="px-4 py-2.5">Firmă</th>
                  <th className="px-3 py-2.5">Categorie</th>
                  <th className="px-3 py-2.5">Oraș</th>
                  <th className="px-3 py-2.5">Telefon</th>
                  <th className="px-3 py-2.5 text-right">Acțiune</th>
                </tr>
              </thead>
              <tbody>
                {data?.leads.filter((l) => l.phone).map((l) => {
                  const done = isCalled(l);
                  return (
                    <tr key={l.id} className="border-b border-[var(--border)] hover:bg-[var(--bg-3)]/40">
                      <td className="px-4 py-2.5">
                        <div className="font-medium flex items-center gap-2">
                          {l.businessName}
                          {!l.website && <span className="text-[10px] px-1.5 py-0.5 rounded bg-red-50 text-red-700 border border-red-200">fără site</span>}
                        </div>
                        {l.rating != null && <div className="text-[11px] text-[var(--ink-3)]">⭐ {l.rating} ({l.reviewCount ?? 0})</div>}
                        {(() => {
                          const o = ownerOf(l);
                          if (o) return <div className="text-[11.5px] text-[var(--ink-2)]">👤 {o}</div>;
                          if (l.id in owners) return <div className="text-[11px] text-[var(--ink-3)]">patron negăsit pe site</div>;
                          return (
                            <button onClick={() => findOwner(l.id)} disabled={findingId === l.id}
                              className="text-[11px] text-[var(--ink-3)] underline hover:text-[var(--ink)] disabled:opacity-60">
                              {findingId === l.id ? "caut patronul…" : "caută patron"}
                            </button>
                          );
                        })()}
                      </td>
                      <td className="px-3 py-2.5 text-[var(--ink-2)]">{l.category}</td>
                      <td className="px-3 py-2.5 text-[var(--ink-2)]">{l.city}</td>
                      <td className="px-3 py-2.5">
                        <a href={`tel:${l.phone}`} className="font-medium text-[var(--ink)] hover:underline whitespace-nowrap">{l.phone}</a>
                      </td>
                      <td className="px-3 py-2.5 text-right whitespace-nowrap">
                        <button onClick={() => markCalled(l.id)} disabled={done}
                          className={`px-3 h-8 rounded-lg text-[12px] font-medium ${done ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-[var(--ink)] text-[var(--bg-2)]"}`}>
                          {done ? "✓ Sunat" : "Sunat"}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {data && data.leads.filter((l) => l.phone).length === 0 && (
            <div className="px-4 py-10 text-center text-[13px] text-[var(--ink-3)]">
              Niciun lead cu telefon pe filtrele astea. Caută orașe mai jos ca să populezi.
            </div>
          )}
        </div>
      )}

      {/* Populează harta (Google Places) */}
      <div className="mt-4 rounded-2xl border border-[var(--border)] bg-[var(--bg-2)] p-4">
        <div className="flex items-center gap-2 mb-3">
          <Search size={15} className="text-[var(--ink-3)]" />
          <span className="text-[13.5px] font-medium">Populează harta — caută firme reale</span>
        </div>
        {!hasApiKey ? (
          <p className="text-[12.5px] text-[#B45309]">⚠️ Lipsește <code>GOOGLE_PLACES_API_KEY</code> pe Vercel — seteaz-o ca să poți căuta firme.</p>
        ) : (
          <div className="flex flex-wrap items-center gap-2">
            <select value={searchCat} onChange={(e) => setSearchCat(e.target.value)} className={selectCls}>
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
            <input value={searchCity} onChange={(e) => setSearchCity(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && runSearch()}
              placeholder="Oraș (ex: Cluj-Napoca)"
              className="h-9 px-3 rounded-lg text-[13px] bg-[var(--bg)] border border-[var(--border)] min-w-[180px]" />
            <button onClick={runSearch} disabled={searching || batching}
              className="h-9 px-4 rounded-lg text-[13px] font-medium flex items-center gap-2 bg-[var(--ink)] text-[var(--bg-2)] disabled:opacity-50">
              {searching ? <Loader2 size={14} className="animate-spin" /> : <Search size={14} />}
              {searching ? "Caut…" : "Caută & adaugă"}
            </button>
            <button onClick={runBatchSearch} disabled={searching || batching}
              className="h-9 px-4 rounded-lg text-[13px] font-medium flex items-center gap-2 bg-[var(--bg-3)] border border-[var(--border-strong)] disabled:opacity-50">
              {batching ? <Loader2 size={14} className="animate-spin" /> : <Globe size={14} />}
              {batching ? `Caut în ${MAJOR_CITIES.length} orașe…` : `Caută "${searchCat}" în ${MAJOR_CITIES.length} orașe mari`}
            </button>
            {searchMsg && <span className="text-[12.5px] text-[var(--ink-2)]">{searchMsg}</span>}
          </div>
        )}
        <p className="text-[11.5px] text-[var(--ink-3)] mt-2">
          Fiecare căutare aduce până la 20 de firme și le salvează permanent. Caută oraș cu oraș ca să acoperi toată România.
        </p>
      </div>
    </div>
  );
}
