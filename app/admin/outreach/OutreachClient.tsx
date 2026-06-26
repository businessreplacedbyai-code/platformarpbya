"use client";

import { useMemo, useState, useTransition, lazy, Suspense } from "react";
import {
  Search, Zap, Send, Eye, EyeOff, Check, X,
  MapPin, Phone, Globe, Star, Mail, AlertTriangle, Loader2,
  MessageCircle, Pencil, Download, Map as MapIcon, List,
} from "lucide-react";

const OutreachMap = lazy(() =>
  import("@/components/admin/OutreachMap").then((m) => ({ default: m.OutreachMap }))
);

// ═══════════════════════════════════════════════════════════════════════════
// WhatsApp templates — editorial, curiosity-driven. NO "Da sau nu" robotic.
// ═══════════════════════════════════════════════════════════════════════════

function formatPhoneWA(phone: string | null): string {
  if (!phone) return "";
  const digits = phone.replace(/\D/g, "");
  if (digits.startsWith("40")) return digits;
  if (digits.startsWith("0")) return "40" + digits.slice(1);
  return "40" + digits;
}

const WA_WITH_SITE: Record<string, string> = {
  restaurant:
    "Bună ziua! Câte rezervări se pierd la {name} când telefonul sună în gol seara târziu sau weekend? Există un agent vocal AI care preia non-stop și face rezervări automat. Vă trimit un exemplu audio dacă vă interesează.",
  cafenea:
    "Bună ziua! Când cineva caută cafenea în {city} pe Google, vede {name} în primele rezultate? Un chatbot WhatsApp + câteva optimizări simple aduc clienți noi constant. Vă trimit detalii dacă vă interesează.",
  hotel:
    "Bună ziua! Ce procent din rezervările {name} vin direct față de Booking? Fiecare rezervare prin Booking = 15-20% comision. Un agent vocal AI preia apeluri directe 24/7 și recuperează diferența rapid. Vă trimit calculul dacă vă interesează.",
  clinica:
    "Bună ziua! Câte ore pierde recepția {name} zilnic cu programări și aceleași întrebări care se repetă? Un agent vocal AI preia tot automat — programări, confirmări, reminder-uri. Vă trimit un demo dacă vă interesează.",
  stomatolog:
    "Bună ziua! Câți pacienți nu revin la {name} pentru control pentru că uitați să-i contactați? Un sistem automat trimite reminder pe WhatsApp la momentul potrivit și reprogramează. Vă trimit cum arată dacă vă interesează.",
  salon:
    "Bună ziua! Câte no-show-uri are {name} săptămânal? Un reminder automat pe WhatsApp cu 24h înainte reduce no-show-urile cu peste 60%. Lucrăm cu peste 50 de saloane în țară. Vă trimit detalii dacă vă interesează.",
  farmacie:
    "Bună ziua! Câte apeluri primește {name} zilnic cu aceleași 3 întrebări — program, stoc, preț? Un chatbot WhatsApp răspunde automat la toate, non-stop. Vă trimit cum funcționează dacă vă interesează.",
  contabil:
    "Bună ziua! Clienții {name} sună des pentru termene pe care le-au uitat? Un sistem automat trimite reminder cu 7 zile înainte, cu documentele de pregătit. Vă trimit cum arată dacă vă interesează.",
  avocat:
    "Bună ziua! Cât din timpul {name} se duce pe întrebări de la potențiali clienți care nu se convertesc? Un chatbot care califică automat (urgență, domeniu, buget) schimbă conversia drastic. Vă trimit exemple dacă vă interesează.",
  auto:
    "Bună ziua! Cât de ușor află clienții când aveți locuri libere la {name}? Un sistem de programări online cu confirmare automată elimină 80% din apelurile inutile. Vă trimit cum arată dacă vă interesează.",
  imobiliare:
    "Bună ziua! Ce procent dintre cei care contactează {name} sunt cu adevărat pregătiți să cumpere? Un chatbot califică automat și trimite la agent doar pe cei serioși. Vă trimit detalii dacă vă interesează.",
  default:
    "Bună ziua! Câte ore pierde echipa {name} zilnic cu sarcini repetitive — programări, confirmări, aceleași întrebări? Există agenți AI care preiau exact astea, non-stop. Vă trimit un exemplu dacă vă interesează.",
};

const WA_WITHOUT_SITE: Record<string, string> = {
  restaurant:
    "Bună ziua! Test: căutați 'restaurant {city}' pe Google. Apare {name}? Fără site, probabil nu — pierdeți rezervări fără să știți. Construim site cu meniu și rezervări online + agent WhatsApp, livrat în 5-7 zile.",
  cafenea:
    "Bună ziua! Cei care caută cafenea în {city} acum — nu ajung la {name}, ci la concurența care are site. Construim site simplu + chatbot WhatsApp în 5-7 zile. Vă trimit detalii dacă vă interesează.",
  hotel:
    "Bună ziua! Fără site propriu, fiecare rezervare la {name} trece prin Booking — cu 15-20% comision. Construim site cu rezervări directe în 5-7 zile, recuperați investiția în prima lună. Vă trimit calculul dacă vă interesează.",
  clinica:
    "Bună ziua! 90% din oameni caută clinica pe Google înainte să sune. Fără site, {name} nu apare. Construim site cu programări online + agent vocal pentru telefon, livrat în 5-7 zile. Vă trimit detalii dacă vă interesează.",
  stomatolog:
    "Bună ziua! Când cineva are durere de dinți seara și caută stomatolog în {city} — găsește {name}? Fără site, nu. Construim site profesional cu prețuri și programări online, livrat în 5-7 zile.",
  salon:
    "Bună ziua! Câți clienți noi vin la {name} din Google față de recomandări? Un site cu portofoliu + programări online aduce 5-10 clienți noi pe lună, fără reclame plătite. Livrat în 5-7 zile.",
  default:
    "Bună ziua! Când potențiali clienți din {city} caută servicii ca ale dvs. online — ajung la {name}? Fără prezență online, nu. Construim site + sistem automat de comunicare în 5-7 zile.",
};

const WA_SIG = "\n\nReplacedByAI · replacedbyai.ro";

// Salut în funcție de oră — evită „Bună ziua" trimis seara.
function greeting(): string {
  const h = new Date().getHours();
  if (h < 11) return "Bună dimineața";
  if (h >= 18) return "Bună seara";
  return "Bună ziua";
}

// Mesaj universal „construim orice" — site + agenți AI + automatizări.
function buildWAMessage(lead: Lead): string {
  void WA_WITH_SITE; void WA_WITHOUT_SITE;
  return `${greeting()}! Sunt de la ReplacedByAI — construim aproape orice are nevoie o afacere ca să prindă mai mulți clienți: site-uri premium, agenți AI care răspund 24/7, automatizări, magazine online. Cred că am putea ajuta și ${lead.businessName}. Dacă vă interesează, vă trimit o propunere concretă pentru voi.${WA_SIG}`;
}

function openWhatsApp(lead: Lead) {
  const phone = formatPhoneWA(lead.phone);
  if (!phone) return;
  const msg = encodeURIComponent(buildWAMessage(lead));
  window.open(`https://wa.me/${phone}?text=${msg}`, "_blank");
}

// ═══════════════════════════════════════════════════════════════════════════
// Types & constants
// ═══════════════════════════════════════════════════════════════════════════

type Lead = {
  id: string;
  businessName: string;
  category: string;
  city: string;
  address: string | null;
  phone: string | null;
  website: string | null;
  socialUrl: string | null;
  rating: number | null;
  reviewCount: number | null;
  email: string | null;
  messageSubject: string | null;
  messageBody: string | null;
  status: string;
  sentAt: Date | null;
  lat: number | null;
  lng: number | null;
};

const CATEGORIES = [
  { value: "restaurant", label: "Restaurante / HoReCa" },
  { value: "cafenea", label: "Cafenele / Coffee shop" },
  { value: "hotel", label: "Hoteluri / Pensiuni" },
  { value: "clinica", label: "Clinici medicale" },
  { value: "stomatolog", label: "Cabinete stomatologice" },
  { value: "salon", label: "Saloane / Coafuri / Beauty" },
  { value: "farmacie", label: "Farmacii" },
  { value: "contabil", label: "Contabilitate" },
  { value: "avocat", label: "Cabinete avocatură" },
  { value: "auto", label: "Service auto / Vulcanizare" },
  { value: "imobiliare", label: "Agenții imobiliare" },
  { value: "constructii", label: "Construcții / Renovări" },
  { value: "it", label: "Firme IT" },
  { value: "retail", label: "Magazine / Retail" },
];

const CITIES = [
  "Iași", "Suceava", "Bacău", "Botoșani", "Piatra Neamț",
  "Roman", "Vaslui", "Bârlad", "Focșani", "Galați",
];

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  new: { label: "Nou", color: "#6B7280" },
  ready: { label: "Gata de trimis", color: "#2563EB" },
  sent: { label: "Trimis", color: "#059669" },
  replied: { label: "Răspuns", color: "#7C3AED" },
  ignored: { label: "Ignorat", color: "#D1D5DB" },
};

// ═══════════════════════════════════════════════════════════════════════════
// Component
// ═══════════════════════════════════════════════════════════════════════════

export function OutreachClient({
  initialLeads,
  hasApiKey,
}: {
  initialLeads: Lead[];
  hasApiKey: boolean;
}) {
  const [leads, setLeads] = useState<Lead[]>(initialLeads);
  const [view, setView] = useState<"list" | "map">("list");

  // Search controls — multi-select supported
  const [selectedCategories, setSelectedCategories] = useState<string[]>(["restaurant"]);
  const [selectedCities, setSelectedCities] = useState<string[]>(["Iași"]);
  const [searchMsg, setSearchMsg] = useState("");
  const [isSearching, startSearchTransition] = useTransition();

  // Filters
  const [siteFilter, setSiteFilter] = useState<"all" | "with" | "without">("all");
  const [minRating, setMinRating] = useState<number>(0);
  const [statusFilter, setStatusFilter] = useState<"active" | "all" | "ready" | "sent" | "tomorrow">("active");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");

  // Bulk selection
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Per-lead working state
  const [previewId, setPreviewId] = useState<string | null>(null);
  const [enrichingIds, setEnrichingIds] = useState<Set<string>>(new Set());
  const [sendingIds, setSendingIds] = useState<Set<string>>(new Set());
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [editEmailId, setEditEmailId] = useState<string | null>(null);
  const [editEmailValue, setEditEmailValue] = useState("");

  // Bulk operation progress
  const [bulkProgress, setBulkProgress] = useState<{ kind: string; done: number; total: number; failed: number } | null>(null);

  // ─── FORCE FIND EMAILS — scrape agresiv + AI fallback, în chunks ───
  async function forceFindEmails(scope: "all" | "selected") {
    const candidatesAll = leads.filter((l) => !l.email && !!l.website && l.status !== "ignored");
    const candidates = scope === "selected"
      ? candidatesAll.filter((l) => selectedIds.has(l.id))
      : candidatesAll;
    if (candidates.length === 0) {
      setSearchMsg("Nicio firmă fără email + cu site pentru a căuta.");
      return;
    }
    const total = candidates.length;
    setBulkProgress({ kind: "find-emails", done: 0, total, failed: 0 });

    const CHUNK = 10;
    let totalFound = 0;
    let totalFail = 0;
    for (let i = 0; i < total; i += CHUNK) {
      const batch = candidates.slice(i, i + CHUNK);
      try {
        const res = await fetch("/api/admin/outreach/find-emails", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ leadIds: batch.map((b) => b.id), limit: CHUNK }),
        });
        const data = await res.json();
        if (!res.ok) { totalFail += batch.length; continue; }
        totalFound += data.found ?? 0;
        // Update local state cu emailurile găsite
        if (Array.isArray(data.results)) {
          const map = new Map<string, { email: string | null; source: string }>();
          for (const r of data.results) map.set(r.leadId, { email: r.email, source: r.source });
          setLeads((prev) => prev.map((l) => {
            const r = map.get(l.id);
            return r?.email ? { ...l, email: r.email } : l;
          }));
        }
      } catch { totalFail += batch.length; }
      setBulkProgress({ kind: "find-emails", done: Math.min(i + CHUNK, total), total, failed: totalFail });
    }
    setSearchMsg(`✓ Căutare AI terminată: ${totalFound} emailuri găsite din ${total} firme.`);
    setTimeout(() => setBulkProgress(null), 4000);
  }

  // ─── Derived: filtered leads ────────────────────────────────────────────

  const visibleLeads = useMemo(() => {
    return leads
      .filter((l) => {
        if (statusFilter === "active") return l.status !== "ignored" && l.status !== "sent";
        if (statusFilter === "ready") return l.status === "ready";
        if (statusFilter === "sent") return l.status === "sent";
        if (statusFilter === "tomorrow") return l.status === "new" && !l.website;
        return l.status !== "ignored";
      })
      .filter((l) => {
        if (siteFilter === "with") return !!l.website;
        if (siteFilter === "without") return !l.website;
        return true;
      })
      .filter((l) => (minRating > 0 ? (l.rating ?? 0) >= minRating : true))
      .filter((l) => (categoryFilter === "all" ? true : l.category === categoryFilter));
  }, [leads, statusFilter, siteFilter, minRating, categoryFilter]);

  const stats = useMemo(() => ({
    total: leads.length,
    withPhone: leads.filter((l) => !!l.phone && l.status !== "ignored").length,
    withEmail: leads.filter((l) => !!l.email && l.status !== "ignored").length,
    ready: leads.filter((l) => l.status === "ready").length,
    sent: leads.filter((l) => l.status === "sent").length,
    replied: leads.filter((l) => l.status === "replied").length,
  }), [leads]);

  // „Mâine": maxim 50 firme noi, fără site (de contactat a doua zi)
  const displayLeads = useMemo(
    () => (statusFilter === "tomorrow" ? visibleLeads.slice(0, 50) : visibleLeads),
    [visibleLeads, statusFilter]
  );

  // Visible selectable IDs (only ones in current filter)
  const visibleIds = useMemo(() => displayLeads.map((l) => l.id), [displayLeads]);
  const allVisibleSelected = visibleIds.length > 0 && visibleIds.every((id) => selectedIds.has(id));

  function toggleSelect(leadId: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(leadId)) next.delete(leadId);
      else next.add(leadId);
      return next;
    });
  }

  function toggleSelectAll() {
    if (allVisibleSelected) {
      setSelectedIds((prev) => {
        const next = new Set(prev);
        visibleIds.forEach((id) => next.delete(id));
        return next;
      });
    } else {
      setSelectedIds((prev) => {
        const next = new Set(prev);
        visibleIds.forEach((id) => next.add(id));
        return next;
      });
    }
  }

  // ─── Search ─────────────────────────────────────────────────────────────

  async function handleSearch() {
    if (!hasApiKey) return;
    if (selectedCategories.length === 0 || selectedCities.length === 0) {
      setSearchMsg("Selectați cel puțin o categorie și un oraș.");
      return;
    }
    const combos = selectedCategories.length * selectedCities.length;
    if (combos > 30) {
      setSearchMsg(`Maxim 30 combinații (acum: ${combos}). Restrânge selecția.`);
      return;
    }

    setSearchMsg("");
    startSearchTransition(async () => {
      try {
        const res = await fetch("/api/admin/outreach/search", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            categories: selectedCategories,
            cities: selectedCities,
          }),
        });
        const data = await res.json();
        if (!res.ok) {
          setSearchMsg(`Eroare: ${data.error}`);
          return;
        }
        setSearchMsg(`+${data.added} firme noi · ${data.skipped} deja existau · ${combos} combinații căutate`);
        const r2 = await fetch("/api/admin/outreach/list");
        if (r2.ok) {
          const d2 = await r2.json();
          setLeads(d2.leads);
        }
      } catch (e) {
        setSearchMsg(`Eroare rețea: ${e}`);
      }
    });
  }

  // ─── Per-lead enrich ────────────────────────────────────────────────────

  async function enrichLead(leadId: string, useClaude = false, mode = "auto") {
    setEnrichingIds((s) => new Set(s).add(leadId));
    setErrors((e) => { const n = { ...e }; delete n[leadId]; return n; });

    try {
      const res = await fetch("/api/admin/outreach/enrich", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ leadId, useClaude, mode }),
      });
      const data = await res.json();
      if (!res.ok) {
        setErrors((e) => ({ ...e, [leadId]: data.error }));
        return;
      }
      setLeads((prev) =>
        prev.map((l) =>
          l.id === leadId
            ? {
                ...l,
                email: data.email ?? l.email,
                messageSubject: data.chosen?.subject ?? l.messageSubject,
                messageBody: data.chosen?.body ?? l.messageBody,
                status: "ready",
              }
            : l
        )
      );
    } catch (e) {
      setErrors((err) => ({ ...err, [leadId]: String(e) }));
    } finally {
      setEnrichingIds((s) => { const n = new Set(s); n.delete(leadId); return n; });
    }
  }

  async function sendEmail(leadId: string) {
    setSendingIds((s) => new Set(s).add(leadId));
    setErrors((e) => { const n = { ...e }; delete n[leadId]; return n; });
    try {
      const res = await fetch("/api/admin/outreach/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ leadId }),
      });
      const data = await res.json();
      if (!res.ok) {
        setErrors((e) => ({ ...e, [leadId]: data.error }));
        return;
      }
      setLeads((prev) =>
        prev.map((l) => (l.id === leadId ? { ...l, status: "sent", sentAt: new Date() } : l))
      );
    } catch (e) {
      setErrors((err) => ({ ...err, [leadId]: String(e) }));
    } finally {
      setSendingIds((s) => { const n = new Set(s); n.delete(leadId); return n; });
    }
  }

  // ─── BULK ACTIONS ────────────────────────────────────────────────────────

  async function bulkGenerate(useClaude: boolean) {
    const ids = Array.from(selectedIds).filter((id) => {
      const lead = leads.find((l) => l.id === id);
      return lead && lead.status === "new";
    });
    if (ids.length === 0) {
      setSearchMsg("Niciun lead nou selectat pentru generare. (deja generate sunt sărite)");
      return;
    }

    setBulkProgress({ kind: useClaude ? "AI" : "rapid", done: 0, total: ids.length, failed: 0 });

    for (let i = 0; i < ids.length; i++) {
      const id = ids[i];
      try {
        await enrichLead(id, useClaude, "combo");
        setBulkProgress((p) => p && { ...p, done: p.done + 1 });
      } catch {
        setBulkProgress((p) => p && { ...p, done: p.done + 1, failed: p.failed + 1 });
      }
      // Small delay if using Claude to avoid rate limits
      if (useClaude && i < ids.length - 1) {
        await new Promise((r) => setTimeout(r, 500));
      }
    }
    setTimeout(() => setBulkProgress(null), 3000);
  }

  async function bulkSendEmails() {
    const ids = Array.from(selectedIds).filter((id) => {
      const lead = leads.find((l) => l.id === id);
      return lead && lead.status === "ready" && !!lead.email;
    });
    if (ids.length === 0) {
      setSearchMsg('Nicio firmă selectată cu status "Gata de trimis" + email.');
      return;
    }
    if (ids.length > 50) {
      setSearchMsg("Maxim 50 emailuri per batch. Restrânge selecția.");
      return;
    }

    if (!confirm(`Trimiți ${ids.length} emailuri (cu pauză de 2.5s între ele)? Durează ~${Math.ceil(ids.length * 2.5 / 60)} min.`)) {
      return;
    }

    setBulkProgress({ kind: "email", done: 0, total: ids.length, failed: 0 });

    try {
      const res = await fetch("/api/admin/outreach/bulk-send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ leadIds: ids }),
      });
      const data = await res.json();

      if (!res.ok) {
        setSearchMsg(`Eroare bulk-send: ${data.error}`);
        setBulkProgress(null);
        return;
      }

      // Update local state for sent leads
      const sentIds = new Set<string>(
        data.results.filter((r: { ok: boolean; leadId: string }) => r.ok).map((r: { leadId: string }) => r.leadId)
      );
      setLeads((prev) =>
        prev.map((l) =>
          sentIds.has(l.id) ? { ...l, status: "sent", sentAt: new Date() } : l
        )
      );

      // Per-lead errors
      const newErrors: Record<string, string> = {};
      for (const r of data.results as { leadId: string; ok: boolean; error?: string }[]) {
        if (!r.ok && r.error) newErrors[r.leadId] = r.error;
      }
      setErrors((e) => ({ ...e, ...newErrors }));

      setBulkProgress({ kind: "email", done: data.sent + data.failed, total: ids.length, failed: data.failed });
      setSearchMsg(`Trimis ${data.sent} emailuri · ${data.failed} eșuate`);
      setSelectedIds(new Set());
    } catch (e) {
      setSearchMsg(`Eroare rețea: ${e}`);
    } finally {
      setTimeout(() => setBulkProgress(null), 4000);
    }
  }

  async function bulkIgnore() {
    const ids = Array.from(selectedIds);
    if (ids.length === 0) return;
    if (!confirm(`Ignoră ${ids.length} firme?`)) return;
    for (const id of ids) {
      await fetch("/api/admin/outreach/ignore", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ leadId: id }),
      });
    }
    setLeads((prev) =>
      prev.map((l) => (ids.includes(l.id) ? { ...l, status: "ignored" } : l))
    );
    setSelectedIds(new Set());
  }

  // ─── CSV export ─────────────────────────────────────────────────────────

  function exportCSV() {
    const rows = [
      ["Firmă", "Categorie", "Oraș", "Telefon", "Website", "Email", "Rating", "Recenzii", "Status", "Trimis"],
      ...visibleLeads.map((l) => [
        l.businessName, l.category, l.city,
        l.phone ?? "", l.website ?? "", l.email ?? "",
        l.rating?.toString() ?? "", l.reviewCount?.toString() ?? "",
        l.status, l.sentAt ? new Date(l.sentAt).toISOString().slice(0, 10) : "",
      ]),
    ];
    const csv = rows.map((r) =>
      r.map((cell) => `"${(cell ?? "").toString().replace(/"/g, '""')}"`).join(",")
    ).join("\n");
    const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `outreach-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  // ─── Helpers for editable email ─────────────────────────────────────────

  async function saveManualEmail(leadId: string) {
    if (!editEmailValue.includes("@")) return;
    await fetch("/api/admin/outreach/set-email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ leadId, email: editEmailValue }),
    });
    setLeads((prev) =>
      prev.map((l) => (l.id === leadId ? { ...l, email: editEmailValue } : l))
    );
    setEditEmailId(null);
    setEditEmailValue("");
  }

  async function markIgnored(leadId: string) {
    await fetch("/api/admin/outreach/ignore", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ leadId }),
    });
    setLeads((prev) => prev.map((l) => (l.id === leadId ? { ...l, status: "ignored" } : l)));
  }

  // Marchează manual (Am trimis pe WhatsApp/IG) sau resetează în listă.
  async function setStatus(leadId: string, status: string) {
    await fetch("/api/admin/outreach/set-status", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ leadId, status }),
    });
    setLeads((prev) =>
      prev.map((l) =>
        l.id === leadId
          ? { ...l, status, sentAt: status === "sent" ? new Date() : status === "new" ? null : l.sentAt }
          : l
      )
    );
    if (status === "sent") {
      setSelectedIds((prev) => { const n = new Set(prev); n.delete(leadId); return n; });
    }
  }

  // ─── Toggle helpers for multi-select ────────────────────────────────────

  function toggleCategory(c: string) {
    setSelectedCategories((prev) =>
      prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c]
    );
  }
  function toggleCity(c: string) {
    setSelectedCities((prev) =>
      prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c]
    );
  }

  // ═══ RENDER ═══════════════════════════════════════════════════════════
  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <p className="text-[11px] uppercase tracking-wider text-[var(--ink-3)] mb-1">Outreach automat</p>
          <h1 className="h-display text-3xl mb-1">Generează & trimite — bulk</h1>
          <p className="text-[14px] text-[var(--ink-2)]">
            Selectează firme · generează mesaje în masă · trimite emailuri cu rate-limit
          </p>
        </div>
        <div className="flex items-center gap-1 p-1 rounded-xl" style={{ background: "var(--bg-2)", border: "1px solid var(--border)" }}>
          <button
            onClick={() => setView("list")}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[13px] font-medium transition-all"
            style={{
              background: view === "list" ? "var(--ink)" : "transparent",
              color: view === "list" ? "var(--bg)" : "var(--ink-3)",
            }}
          >
            <List size={14} /> Listă
          </button>
          <button
            onClick={() => setView("map")}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[13px] font-medium transition-all"
            style={{
              background: view === "map" ? "var(--ink)" : "transparent",
              color: view === "map" ? "var(--bg)" : "var(--ink-3)",
            }}
          >
            <MapIcon size={14} /> Hartă
          </button>
        </div>
      </div>

      {/* API key warning */}
      {!hasApiKey && (
        <div className="rounded-xl px-4 py-3 flex items-start gap-3" style={{ background: "#FFF7ED", border: "1px solid #F59E0B" }}>
          <AlertTriangle size={15} className="text-amber-600 mt-0.5 shrink-0" />
          <div>
            <p className="text-[13px] font-medium text-amber-800">GOOGLE_PLACES_API_KEY lipsește</p>
            <p className="text-[12px] text-amber-700 mt-0.5">
              Adaugă cheia în <code className="font-mono bg-amber-100 px-1 rounded">.env.local</code> și în Vercel.
            </p>
          </div>
        </div>
      )}

      {/* SEARCH PANEL — multi-select */}
      <div className="rounded-2xl p-5" style={{ background: "var(--bg-2)", border: "1px solid var(--border)" }}>
        <div className="flex items-baseline justify-between mb-3">
          <div className="text-[12px] uppercase tracking-wider text-[var(--ink-3)]">
            Căutare în masă · {selectedCategories.length} × {selectedCities.length} = {selectedCategories.length * selectedCities.length} combinații
          </div>
          <div className="text-[11px] text-[var(--ink-3)]">max 30 combinații / 600 leads per search</div>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          {/* Categories */}
          <div>
            <div className="text-[11px] uppercase tracking-wider text-[var(--ink-3)] mb-2">
              Industrii ({selectedCategories.length} selectate)
            </div>
            <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto">
              {CATEGORIES.map((c) => {
                const on = selectedCategories.includes(c.value);
                return (
                  <button
                    key={c.value}
                    onClick={() => toggleCategory(c.value)}
                    className="px-2.5 py-1 rounded-md text-[11.5px] font-medium transition-all"
                    style={{
                      background: on ? "var(--ink)" : "var(--bg)",
                      color: on ? "var(--bg)" : "var(--ink-2)",
                      border: `1px solid ${on ? "var(--ink)" : "var(--border)"}`,
                    }}
                  >
                    {c.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Cities */}
          <div>
            <div className="text-[11px] uppercase tracking-wider text-[var(--ink-3)] mb-2">
              Orașe ({selectedCities.length} selectate)
            </div>
            <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto">
              {CITIES.map((c) => {
                const on = selectedCities.includes(c);
                return (
                  <button
                    key={c}
                    onClick={() => toggleCity(c)}
                    className="px-2.5 py-1 rounded-md text-[11.5px] font-medium transition-all"
                    style={{
                      background: on ? "var(--ink)" : "var(--bg)",
                      color: on ? "var(--bg)" : "var(--ink-2)",
                      border: `1px solid ${on ? "var(--ink)" : "var(--border)"}`,
                    }}
                  >
                    {c}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <button
          onClick={handleSearch}
          disabled={isSearching || !hasApiKey}
          className="mt-4 px-4 py-2.5 rounded-xl bg-[var(--ink)] text-[var(--bg)] text-[13px] font-medium flex items-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-40"
        >
          {isSearching ? <Loader2 size={14} className="animate-spin" /> : <Search size={14} />}
          {isSearching ? "Caută..." : `Caută în ${selectedCategories.length * selectedCities.length} combinații`}
        </button>

        {/* FORCE FIND EMAILS — AI agresiv pentru toate firmele fără email */}
        <button
          onClick={() => forceFindEmails("all")}
          disabled={!!bulkProgress}
          title="Caută emailurile tuturor firmelor fără email — scrape + AI fallback (Claude). Durează ~2-3s/firmă."
          className="ml-3 px-4 py-2.5 rounded-xl text-[13px] font-medium flex items-center gap-2 transition-colors disabled:opacity-40"
          style={{ background: "#7C3AED", color: "#fff" }}
        >
          ✦ Găsește emailuri cu AI ({leads.filter(l => !l.email && !!l.website && l.status !== "ignored").length})
        </button>
      </div>

      {searchMsg && (
        <p className="text-[13px] px-1" style={{ color: searchMsg.startsWith("Eroare") ? "#DC2626" : "#059669" }}>
          {searchMsg}
        </p>
      )}

      {/* Stats */}
      <div className="grid grid-cols-6 gap-2.5">
        {[
          { label: "Total", value: stats.total, color: "var(--ink-1)" },
          { label: "Au telefon", value: stats.withPhone, color: "#15803D" },
          { label: "Au email", value: stats.withEmail, color: "#1D4ED8" },
          { label: "Gata de trimis", value: stats.ready, color: "#2563EB" },
          { label: "Trimise", value: stats.sent, color: "#059669" },
          { label: "Răspunsuri", value: stats.replied, color: "#7C3AED" },
        ].map((s) => (
          <div key={s.label} className="rounded-xl p-3 text-center" style={{ background: "var(--bg-2)", border: "1px solid var(--border)" }}>
            <div className="text-xl font-bold tabular-nums" style={{ color: s.color }}>{s.value}</div>
            <div className="text-[10.5px] text-[var(--ink-3)] mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      {/* FILTERS */}
      <div className="rounded-xl p-3 flex flex-wrap items-center gap-3" style={{ background: "var(--bg-2)", border: "1px solid var(--border)" }}>
        <span className="text-[11px] uppercase tracking-wider text-[var(--ink-3)]">Filtre:</span>

        {/* Status pills */}
        <div className="flex gap-1">
          {[
            { k: "active" as const, label: "Active", count: leads.filter(l => l.status !== "ignored" && l.status !== "sent").length },
            { k: "tomorrow" as const, label: "📋 Mâine · fără site", count: leads.filter(l => l.status === "new" && !l.website).length },
            { k: "ready" as const, label: "Gata", count: stats.ready },
            { k: "sent" as const, label: "Trimise", count: stats.sent },
            { k: "all" as const, label: "Toate", count: leads.filter(l => l.status !== "ignored").length },
          ].map((f) => (
            <button
              key={f.k}
              onClick={() => setStatusFilter(f.k)}
              className="px-2.5 py-1 rounded-md text-[11.5px] font-medium transition-all"
              style={{
                background: statusFilter === f.k ? "var(--ink)" : "var(--bg)",
                color: statusFilter === f.k ? "var(--bg)" : "var(--ink-2)",
                border: `1px solid ${statusFilter === f.k ? "var(--ink)" : "var(--border)"}`,
              }}
            >
              {f.label} <span className="opacity-60 ml-0.5">({f.count})</span>
            </button>
          ))}
        </div>

        {/* Site filter */}
        <div className="flex gap-1">
          {[
            { k: "all" as const, label: "Toate" },
            { k: "without" as const, label: "Fără site" },
            { k: "with" as const, label: "Cu site" },
          ].map((f) => (
            <button
              key={f.k}
              onClick={() => setSiteFilter(f.k)}
              className="px-2.5 py-1 rounded-md text-[11.5px] font-medium transition-all"
              style={{
                background: siteFilter === f.k ? "#7C3AED" : "var(--bg)",
                color: siteFilter === f.k ? "#fff" : "var(--ink-2)",
                border: `1px solid ${siteFilter === f.k ? "transparent" : "var(--border)"}`,
              }}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Min rating */}
        <label className="text-[11.5px] text-[var(--ink-2)] flex items-center gap-1.5">
          Rating min:
          <select
            value={minRating}
            onChange={(e) => setMinRating(Number(e.target.value))}
            className="px-2 py-0.5 rounded text-[11.5px] bg-[var(--bg)] border border-[var(--border)]"
          >
            <option value={0}>oricare</option>
            <option value={3.5}>≥ 3.5</option>
            <option value={4.0}>≥ 4.0</option>
            <option value={4.5}>≥ 4.5</option>
          </select>
        </label>

        {/* Category filter */}
        <label className="text-[11.5px] text-[var(--ink-2)] flex items-center gap-1.5">
          Categorie:
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-2 py-0.5 rounded text-[11.5px] bg-[var(--bg)] border border-[var(--border)] max-w-[160px]"
          >
            <option value="all">toate</option>
            {CATEGORIES.map((c) => (
              <option key={c.value} value={c.value}>{c.label}</option>
            ))}
          </select>
        </label>

        <div className="ml-auto flex gap-1.5">
          <button
            onClick={exportCSV}
            className="px-2.5 py-1 rounded-md text-[11.5px] font-medium bg-[var(--bg)] border border-[var(--border)] hover:bg-[var(--bg-3)] flex items-center gap-1"
          >
            <Download size={11} /> Export CSV
          </button>
        </div>
      </div>

      {/* BULK ACTION BAR */}
      {selectedIds.size > 0 && (
        <div className="rounded-xl p-3 flex items-center gap-3 sticky top-2 z-10 shadow-md"
          style={{ background: "#15140F", color: "#F0EEE9", border: "1px solid var(--ink-1)" }}>
          <span className="text-[13px] font-medium">
            {selectedIds.size} selectate
          </span>
          <span className="text-[11px] opacity-60">·</span>

          <button
            onClick={() => bulkGenerate(false)}
            disabled={!!bulkProgress}
            className="px-3 py-1.5 rounded-lg text-[12px] font-medium flex items-center gap-1.5 transition-colors disabled:opacity-40"
            style={{ background: "#3B82F6", color: "#fff" }}
          >
            <Zap size={12} />
            Generează rapide (toate)
          </button>

          <button
            onClick={() => bulkGenerate(true)}
            disabled={!!bulkProgress}
            className="px-3 py-1.5 rounded-lg text-[12px] font-medium flex items-center gap-1.5 transition-colors disabled:opacity-40"
            style={{ background: "#7C3AED", color: "#fff" }}
          >
            ✦ Generează cu AI
          </button>

          <button
            onClick={() => forceFindEmails("selected")}
            disabled={!!bulkProgress}
            title="Caută emailul pentru firmele selectate cu AI"
            className="px-3 py-1.5 rounded-lg text-[12px] font-medium flex items-center gap-1.5 transition-colors disabled:opacity-40"
            style={{ background: "#0EA5E9", color: "#fff" }}
          >
            ✦ Caută emailuri (selectate)
          </button>

          <button
            onClick={bulkSendEmails}
            disabled={!!bulkProgress}
            className="px-3 py-1.5 rounded-lg text-[12px] font-medium flex items-center gap-1.5 transition-colors disabled:opacity-40"
            style={{ background: "#059669", color: "#fff" }}
          >
            <Send size={12} />
            Trimite emailuri ({Array.from(selectedIds).filter(id => {
              const l = leads.find(x => x.id === id);
              return l?.status === "ready" && !!l.email;
            }).length})
          </button>

          <button
            onClick={bulkIgnore}
            disabled={!!bulkProgress}
            className="px-3 py-1.5 rounded-lg text-[12px] font-medium flex items-center gap-1.5 transition-colors disabled:opacity-40"
            style={{ background: "rgba(255,255,255,0.1)", color: "#fff" }}
          >
            <X size={12} />
            Ignoră
          </button>

          <button
            onClick={() => setSelectedIds(new Set())}
            className="ml-auto text-[11.5px] opacity-70 hover:opacity-100"
          >
            Deselectează tot
          </button>
        </div>
      )}

      {/* Bulk progress */}
      {bulkProgress && (
        <div className="rounded-xl px-4 py-2.5 flex items-center gap-3" style={{ background: "#EFF6FF", border: "1px solid #BFDBFE" }}>
          <Loader2 size={14} className="animate-spin text-blue-700" />
          <span className="text-[13px] text-blue-900 font-medium">
            {bulkProgress.kind === "email" ? "Trimit emailuri" : `Generez mesaje (${bulkProgress.kind})`}: {bulkProgress.done} / {bulkProgress.total}
            {bulkProgress.failed > 0 && <span className="text-red-600 ml-2">· {bulkProgress.failed} eșuate</span>}
          </span>
          <div className="flex-1 h-1.5 rounded-full bg-blue-100 overflow-hidden">
            <div
              className="h-full bg-blue-600 transition-all"
              style={{ width: `${(bulkProgress.done / bulkProgress.total) * 100}%` }}
            />
          </div>
        </div>
      )}

      {/* MAP VIEW */}
      {view === "map" && (
        <div className="rounded-2xl overflow-hidden" style={{ height: 560, border: "1px solid var(--border)" }}>
          {displayLeads.filter((l) => l.lat && l.lng).length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center gap-3 text-center p-8" style={{ background: "var(--bg-2)" }}>
              <MapIcon size={36} className="text-[var(--ink-3)]" />
              <p className="text-[14px] text-[var(--ink-2)] font-medium">Niciun lead cu coordonate</p>
              <p className="text-[13px] text-[var(--ink-3)]">Coordonatele se salvează automat la căutările noi. Leadurile existente nu au lat/lng.</p>
            </div>
          ) : (
            <Suspense fallback={<div className="h-full flex items-center justify-center text-[var(--ink-3)]"><Loader2 className="animate-spin" /></div>}>
              <OutreachMap
                leads={displayLeads
                  .filter((l): l is Lead & { lat: number; lng: number } => !!l.lat && !!l.lng)
                  .map((l) => ({
                    id: l.id,
                    businessName: l.businessName,
                    city: l.city,
                    category: l.category,
                    phone: l.phone,
                    website: l.website,
                    rating: l.rating,
                    status: l.status,
                    lat: l.lat,
                    lng: l.lng,
                  }))}
                onSelectLead={(id) => {
                  setView("list");
                  setTimeout(() => {
                    document.getElementById(`lead-${id}`)?.scrollIntoView({ behavior: "smooth", block: "center" });
                  }, 100);
                }}
              />
            </Suspense>
          )}
        </div>
      )}

      {/* TABLE */}
      {view === "list" && displayLeads.length === 0 ? (
        <div className="rounded-2xl p-12 text-center" style={{ background: "var(--bg-2)", border: "1px solid var(--border)" }}>
          <Search size={32} className="mx-auto mb-3 text-[var(--ink-3)]" />
          <p className="text-[14px] text-[var(--ink-2)]">Niciun lead. Selectează industrii și orașe, apoi caută.</p>
        </div>
      ) : view === "list" ? (
        <div className="rounded-2xl overflow-hidden" style={{ border: "1px solid var(--border)" }}>
          <table className="w-full text-[13px]">
            <thead>
              <tr style={{ background: "var(--bg-2)", borderBottom: "1px solid var(--border)" }}>
                <th className="px-3 py-3 w-[36px]">
                  <input
                    type="checkbox"
                    checked={allVisibleSelected}
                    onChange={toggleSelectAll}
                    className="rounded cursor-pointer"
                  />
                </th>
                <th className="px-3 py-3 text-left font-medium text-[var(--ink-2)] text-[11px] uppercase tracking-wider">Firmă</th>
                <th className="px-3 py-3 text-left font-medium text-[var(--ink-2)] text-[11px] uppercase tracking-wider hidden md:table-cell">Contact</th>
                <th className="px-3 py-3 text-left font-medium text-[var(--ink-2)] text-[11px] uppercase tracking-wider hidden lg:table-cell">Email</th>
                <th className="px-3 py-3 text-left font-medium text-[var(--ink-2)] text-[11px] uppercase tracking-wider">Status</th>
                <th className="px-3 py-3 text-right font-medium text-[var(--ink-2)] text-[11px] uppercase tracking-wider">Acțiuni</th>
              </tr>
            </thead>
            <tbody>
              {displayLeads.map((lead, idx) => {
                const cfg = STATUS_CONFIG[lead.status] ?? STATUS_CONFIG.new;
                const isEnriching = enrichingIds.has(lead.id);
                const isSending = sendingIds.has(lead.id);
                const err = errors[lead.id];
                const isPreviewing = previewId === lead.id;
                const isSelected = selectedIds.has(lead.id);

                return (
                  <>
                    <tr
                      key={lead.id}
                      id={`lead-${lead.id}`}
                      style={{
                        background: isSelected
                          ? "#FEF3C7"
                          : idx % 2 === 0 ? "var(--bg)" : "var(--bg-2)",
                        borderBottom: "1px solid var(--border)",
                      }}
                    >
                      <td className="px-3 py-3 align-top">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleSelect(lead.id)}
                          className="rounded cursor-pointer mt-0.5"
                        />
                      </td>

                      {/* Firmă */}
                      <td className="px-3 py-3">
                        <div className="font-medium text-[var(--ink-1)]">{lead.businessName}</div>
                        <div className="text-[11.5px] text-[var(--ink-3)] flex items-center gap-1 mt-0.5">
                          <MapPin size={10} />
                          {lead.city}
                          {lead.rating && (
                            <span className="ml-2 flex items-center gap-0.5">
                              <Star size={10} className="text-amber-500" />
                              {lead.rating.toFixed(1)}
                              {lead.reviewCount && <span className="text-[10px]">({lead.reviewCount})</span>}
                            </span>
                          )}
                        </div>
                        {lead.website ? (
                          <span className="inline-block mt-1 text-[10px] px-1.5 py-0.5 rounded font-medium"
                            style={{ background: "#EFF6FF", color: "#1D4ED8" }}>
                            Agent AI
                          </span>
                        ) : lead.socialUrl ? (
                          <span className="inline-block mt-1 text-[10px] px-1.5 py-0.5 rounded font-medium"
                            style={{ background: "#FFF7ED", color: "#C2410C" }}
                            title={`Are Facebook/social: ${lead.socialUrl}`}>
                            FB only → Site + AI
                          </span>
                        ) : (
                          <span className="inline-block mt-1 text-[10px] px-1.5 py-0.5 rounded font-medium"
                            style={{ background: "#F5F3FF", color: "#6D28D9" }}>
                            Site + AI
                          </span>
                        )}
                      </td>

                      {/* Contact */}
                      <td className="px-3 py-3 hidden md:table-cell">
                        <div className="space-y-0.5">
                          {lead.phone && (
                            <div className="flex items-center gap-1 text-[11.5px] text-[var(--ink-2)]">
                              <Phone size={10} /> {lead.phone}
                            </div>
                          )}
                          {lead.website && (
                            <a
                              href={lead.website.startsWith("http") ? lead.website : `https://${lead.website}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-1 text-[11.5px] text-blue-600 hover:underline max-w-[180px] truncate"
                            >
                              <Globe size={10} />
                              {lead.website.replace(/^https?:\/\/(www\.)?/, "").slice(0, 30)}
                            </a>
                          )}
                        </div>
                      </td>

                      {/* Email */}
                      <td className="px-3 py-3 hidden lg:table-cell">
                        {editEmailId === lead.id ? (
                          <div className="flex items-center gap-1">
                            <input
                              autoFocus
                              value={editEmailValue}
                              onChange={(e) => setEditEmailValue(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === "Enter") saveManualEmail(lead.id);
                                if (e.key === "Escape") { setEditEmailId(null); setEditEmailValue(""); }
                              }}
                              placeholder="email@firma.ro"
                              className="w-36 px-2 py-1 text-[11.5px] rounded-lg border border-[var(--border)] bg-[var(--bg)] focus:outline-none focus:ring-1 focus:ring-blue-400"
                            />
                            <button onClick={() => saveManualEmail(lead.id)} className="p-1 rounded text-green-600 hover:bg-green-50"><Check size={12} /></button>
                            <button onClick={() => { setEditEmailId(null); setEditEmailValue(""); }} className="p-1 rounded text-red-400 hover:bg-red-50"><X size={12} /></button>
                          </div>
                        ) : lead.email ? (
                          <div className="flex items-center gap-1 text-[11.5px] text-[var(--ink-2)]">
                            <Mail size={10} className="text-green-600" />
                            <span className="max-w-[140px] truncate">{lead.email}</span>
                            <button onClick={() => { setEditEmailId(lead.id); setEditEmailValue(lead.email!); }} className="ml-1 text-[var(--ink-3)] hover:text-[var(--ink)]"><Pencil size={10} /></button>
                          </div>
                        ) : (
                          <button
                            onClick={() => { setEditEmailId(lead.id); setEditEmailValue(""); }}
                            className="flex items-center gap-1 text-[11px] text-amber-600 hover:text-amber-800"
                          >
                            <Pencil size={10} /> adaugă manual
                          </button>
                        )}
                      </td>

                      {/* Status */}
                      <td className="px-3 py-3">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10.5px] font-medium"
                          style={{ background: `${cfg.color}15`, color: cfg.color }}>
                          {cfg.label}
                        </span>
                        {lead.sentAt && (
                          <div className="text-[10px] text-[var(--ink-3)] mt-0.5">
                            {new Date(lead.sentAt).toLocaleDateString("ro-RO")}
                          </div>
                        )}
                      </td>

                      {/* Acțiuni */}
                      <td className="px-3 py-3">
                        <div className="flex items-center gap-1.5 flex-wrap justify-end">
                          {err && (
                            <span className="text-[10px] text-red-600 max-w-[100px] truncate w-full text-right" title={err}>
                              {err.slice(0, 35)}
                            </span>
                          )}

                          {lead.phone && lead.status !== "replied" && (
                            <button
                              onClick={() => openWhatsApp(lead)}
                              title={`Trimite WhatsApp la ${lead.phone}`}
                              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-semibold transition-all hover:scale-105"
                              style={{ background: "#25D366", color: "#fff" }}
                            >
                              <MessageCircle size={13} />
                              WhatsApp
                            </button>
                          )}

                          {lead.status !== "replied" && (
                            <button
                              onClick={async () => {
                                const ig = lead.socialUrl && lead.socialUrl.includes("instagram")
                                  ? lead.socialUrl
                                  : `https://www.google.com/search?q=${encodeURIComponent(`${lead.businessName} ${lead.city} instagram`)}`;
                                try {
                                  await navigator.clipboard.writeText(buildWAMessage(lead));
                                  setSearchMsg("✓ Mesaj copiat în clipboard — dă paste (Ctrl+V) în DM-ul de Instagram.");
                                } catch {
                                  setSearchMsg("Deschid Instagram — copiază mesajul din previzualizare și dă paste în DM.");
                                }
                                window.open(ig, "_blank");
                              }}
                              title="Copiază mesajul + deschide Instagram pentru DM"
                              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[12px] font-semibold transition-all hover:scale-105"
                              style={{ background: "#E1306C", color: "#fff" }}
                            >
                              <Send size={13} />
                              IG
                            </button>
                          )}

                          {!["sent", "ignored", "replied"].includes(lead.status) && (
                            <button
                              onClick={() => setStatus(lead.id, "sent")}
                              title="Am contactat manual — marchează ca trimis ca să dispară din listă"
                              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[12px] font-semibold transition-colors"
                              style={{ background: "#ECFDF5", color: "#059669", border: "1px solid #A7F3D0" }}
                            >
                              <Check size={13} /> Am trimis
                            </button>
                          )}

                          {lead.status === "ready" && lead.email && (
                            <button
                              onClick={() => sendEmail(lead.id)}
                              disabled={isSending}
                              title={`Trimite email la ${lead.email}`}
                              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[12px] font-medium transition-colors disabled:opacity-40"
                              style={{ background: "#EFF6FF", color: "#1D4ED8", border: "1px solid #BFDBFE" }}
                            >
                              {isSending ? <Loader2 size={12} className="animate-spin" /> : <Mail size={12} />}
                              Email
                            </button>
                          )}

                          {(lead.status === "new" || lead.status === "ready") && (
                            isEnriching ? (
                              <Loader2 size={13} className="animate-spin text-[var(--ink-3)]" />
                            ) : (
                              <>
                                <button
                                  onClick={() => enrichLead(lead.id, false, "auto")}
                                  title="Mesaj automat: site pitch sau AI pitch în funcție de situație"
                                  className="px-2 py-1.5 rounded-lg text-[11px] font-medium transition-colors hover:bg-[var(--bg-3)]"
                                  style={{ color: "var(--ink-2)", border: "1px solid var(--border)" }}
                                >
                                  <Zap size={11} className="inline mr-0.5" />
                                  Rapid
                                </button>
                                <button
                                  onClick={() => enrichLead(lead.id, false, "combo")}
                                  title="Pitchează ambele servicii: Site WEB + Agent AI"
                                  className="px-2 py-1.5 rounded-lg text-[11px] font-medium transition-colors"
                                  style={{ background: "#FFF7ED", color: "#C2410C", border: "1px solid #FED7AA" }}
                                >
                                  Site+AI
                                </button>
                                <button
                                  onClick={() => enrichLead(lead.id, true, "auto")}
                                  title="Mesaj generat de Claude AI (mai personalizat)"
                                  className="px-2 py-1.5 rounded-lg text-[11px] font-medium transition-colors"
                                  style={{ background: "#F5F3FF", color: "#6D28D9", border: "1px solid #DDD6FE" }}
                                >
                                  ✦ AI
                                </button>
                              </>
                            )
                          )}

                          {lead.messageBody && (
                            <button
                              onClick={() => setPreviewId(isPreviewing ? null : lead.id)}
                              title="Previzualizează mesajul"
                              className="p-1.5 rounded-lg hover:bg-[var(--bg-3)] text-[var(--ink-3)] transition-colors"
                            >
                              {isPreviewing ? <EyeOff size={13} /> : <Eye size={13} />}
                            </button>
                          )}

                          {!["sent", "replied", "ignored"].includes(lead.status) && (
                            <button
                              onClick={() => markIgnored(lead.id)}
                              title="Ignoră lead-ul"
                              className="p-1.5 rounded-lg hover:bg-red-50 text-[var(--ink-3)] hover:text-red-400 transition-colors"
                            >
                              <X size={13} />
                            </button>
                          )}

                          {lead.status === "sent" && (
                            <span className="text-[11px] text-green-600 flex items-center gap-1">
                              <Check size={12} /> Trimis
                              <button
                                onClick={() => setStatus(lead.id, "new")}
                                title="Reset — readu lead-ul în listă"
                                className="ml-1 px-1.5 py-0.5 rounded text-[10px] text-[var(--ink-3)] hover:text-[var(--ink)] hover:bg-[var(--bg-3)]"
                              >
                                ↺ reset
                              </button>
                            </span>
                          )}

                          {!lead.phone && !lead.email && lead.status !== "sent" && (
                            <span className="text-[11px] text-[var(--ink-3)]">Fără contact</span>
                          )}
                        </div>
                      </td>
                    </tr>

                    {/* Preview row */}
                    {isPreviewing && lead.messageBody && (
                      <tr key={`${lead.id}-preview`} style={{ background: "#F0F9FF", borderBottom: "1px solid var(--border)" }}>
                        <td colSpan={6} className="px-6 py-4">
                          <div className="text-[12px] font-medium text-blue-800 mb-2">
                            Subject: {lead.messageSubject}
                          </div>
                          <pre className="text-[12px] text-[var(--ink-2)] whitespace-pre-wrap font-sans leading-relaxed">
                            {lead.messageBody}
                          </pre>
                        </td>
                      </tr>
                    )}
                  </>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : null}
    </div>
  );
}
