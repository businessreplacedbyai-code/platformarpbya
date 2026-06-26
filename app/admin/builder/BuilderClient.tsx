"use client";
import { useState } from "react";
import { Sparkles, Loader2, ExternalLink, ArrowRight, ArrowLeft, Check } from "lucide-react";
import { SiteConfig, TYPE_PRESETS, PALETTES, FONTS } from "@/components/builder/types";

const TYPES = [
  { k: "cafenea", label: "Cafenea" },
  { k: "restaurant", label: "Restaurant" },
  { k: "salon", label: "Salon / Beauty" },
  { k: "clinica", label: "Clinică" },
  { k: "altul", label: "Altă afacere" },
];

function baseConfig(type: string): SiteConfig {
  const p = TYPE_PRESETS[type] ?? TYPE_PRESETS.altul;
  return {
    name: "", type, city: "", tagline: p.tagline ?? "", about: p.about ?? "",
    services: (p.services ?? []).map((s) => ({ ...s })),
    phone: "", email: "", address: "",
    paletteKey: p.paletteKey ?? "espresso", fontKey: p.fontKey ?? "serif",
  };
}

export function BuilderClient() {
  const [step, setStep] = useState(1);
  const [cfg, setCfg] = useState<SiteConfig>(baseConfig("cafenea"));
  const [gen, setGen] = useState<{ loading: boolean; msg: string }>({ loading: false, msg: "" });

  const set = (patch: Partial<SiteConfig>) => setCfg((c) => ({ ...c, ...patch }));
  const setService = (i: number, patch: Partial<SiteConfig["services"][0]>) =>
    setCfg((c) => ({ ...c, services: c.services.map((s, j) => (j === i ? { ...s, ...patch } : s)) }));

  function pickType(type: string) {
    const preset = baseConfig(type);
    setCfg((c) => ({ ...preset, name: c.name, city: c.city, phone: c.phone, email: c.email, address: c.address }));
  }

  async function generateAI() {
    setGen({ loading: true, msg: "Aplic imaginile…" });
    try {
      const res = await fetch("/api/builder/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: cfg.type, real: false }),
      });
      const data = await res.json();
      if (!res.ok) { setGen({ loading: false, msg: `Eroare: ${data.error}` }); return; }
      setCfg((c) => ({
        ...c,
        heroImage: data.heroImage ?? c.heroImage,
        heroVideo: data.heroVideo ?? c.heroVideo,
        services: c.services.map((s, i) => ({ ...s, img: data.galleryImgs?.[i] ?? s.img })),
      }));
      setGen({
        loading: false,
        msg: data.demo
          ? "✓ Imagini demo aplicate (fără chei API). Apasă „Vezi site-ul live”."
          : "✓ Asset-uri AI generate! Apasă „Vezi site-ul live”.",
      });
    } catch (e) {
      setGen({ loading: false, msg: `Eroare rețea: ${String(e)}` });
    }
  }

  function openPreview() {
    localStorage.setItem("rbai_builder_site", JSON.stringify(cfg));
    window.open("/builder/preview", "_blank");
  }

  return (
    <div className="max-w-3xl">
      <p className="text-[11px] uppercase tracking-wider text-[var(--ink-3)] mb-1">Platformă · self-serve</p>
      <h1 className="h-display text-3xl mb-1">Website Builder</h1>
      <p className="text-[14px] text-[var(--ink-2)] mb-6">Completează 3 pași → generezi poze + video AI → site live.</p>

      {/* Stepper */}
      <div className="flex items-center gap-2 mb-7">
        {["Afacere", "Servicii", "Stil & AI"].map((s, i) => (
          <div key={s} className="flex items-center gap-2">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full text-[12.5px] font-medium"
              style={{ background: step === i + 1 ? "var(--ink)" : "var(--bg-2)", color: step === i + 1 ? "var(--bg-2)" : "var(--ink-2)", border: "1px solid var(--border)" }}>
              {step > i + 1 ? <Check size={13} /> : <span>{i + 1}</span>} {s}
            </div>
            {i < 2 && <div className="w-5 h-px bg-[var(--border)]" />}
          </div>
        ))}
      </div>

      {/* STEP 1 */}
      {step === 1 && (
        <div className="space-y-5">
          <div>
            <Label>Tip afacere</Label>
            <div className="flex flex-wrap gap-2">
              {TYPES.map((t) => (
                <button key={t.k} onClick={() => pickType(t.k)}
                  className="px-3.5 py-2 rounded-lg text-[13px] font-medium transition-all"
                  style={{ background: cfg.type === t.k ? "var(--ink)" : "var(--bg)", color: cfg.type === t.k ? "var(--bg-2)" : "var(--ink-2)", border: `1px solid ${cfg.type === t.k ? "var(--ink)" : "var(--border)"}` }}>
                  {t.label}
                </button>
              ))}
            </div>
          </div>
          <Field label="Numele afacerii"><Inp value={cfg.name} onChange={(v) => set({ name: v })} placeholder="ex. Magic Time Coffee" /></Field>
          <Field label="Oraș"><Inp value={cfg.city} onChange={(v) => set({ city: v })} placeholder="ex. Iași" /></Field>
          <Field label="Slogan (titlul mare)"><Inp value={cfg.tagline} onChange={(v) => set({ tagline: v })} /></Field>
          <Field label="Despre afacere (paragraf)"><Area value={cfg.about} onChange={(v) => set({ about: v })} /></Field>
          <Nav onNext={() => setStep(2)} />
        </div>
      )}

      {/* STEP 2 */}
      {step === 2 && (
        <div className="space-y-5">
          {cfg.services.map((s, i) => (
            <div key={i} className="rounded-xl p-4 grid sm:grid-cols-3 gap-3" style={{ background: "var(--bg-2)", border: "1px solid var(--border)" }}>
              <Inp value={s.name} onChange={(v) => setService(i, { name: v })} placeholder={`Serviciu ${i + 1}`} />
              <Inp value={s.desc} onChange={(v) => setService(i, { desc: v })} placeholder="Descriere scurtă" />
              <Inp value={s.price ?? ""} onChange={(v) => setService(i, { price: v })} placeholder="Preț (sau —)" />
            </div>
          ))}
          <div className="grid sm:grid-cols-3 gap-3">
            <Field label="Telefon"><Inp value={cfg.phone} onChange={(v) => set({ phone: v })} placeholder="07XX XXX XXX" /></Field>
            <Field label="Email"><Inp value={cfg.email} onChange={(v) => set({ email: v })} placeholder="contact@…" /></Field>
            <Field label="Adresă"><Inp value={cfg.address} onChange={(v) => set({ address: v })} placeholder="Strada, nr." /></Field>
          </div>
          <Nav onBack={() => setStep(1)} onNext={() => setStep(3)} />
        </div>
      )}

      {/* STEP 3 */}
      {step === 3 && (
        <div className="space-y-6">
          <div>
            <Label>Paletă</Label>
            <div className="flex flex-wrap gap-2.5">
              {Object.entries(PALETTES).map(([k, p]) => (
                <button key={k} onClick={() => set({ paletteKey: k })} title={p.label}
                  className="rounded-xl p-1 transition-all" style={{ border: `2px solid ${cfg.paletteKey === k ? "var(--ink)" : "transparent"}` }}>
                  <div className="flex rounded-lg overflow-hidden w-16 h-9">
                    <div style={{ flex: 1, background: p.bg }} /><div style={{ flex: 1, background: p.accent }} /><div style={{ flex: 1, background: p.accent2 }} />
                  </div>
                </button>
              ))}
            </div>
          </div>
          <div>
            <Label>Font</Label>
            <div className="flex flex-wrap gap-2">
              {Object.entries(FONTS).map(([k, f]) => (
                <button key={k} onClick={() => set({ fontKey: k })}
                  className="px-3.5 py-2 rounded-lg text-[13px]" style={{ fontFamily: f.display, background: cfg.fontKey === k ? "var(--ink)" : "var(--bg)", color: cfg.fontKey === k ? "var(--bg-2)" : "var(--ink-2)", border: `1px solid ${cfg.fontKey === k ? "var(--ink)" : "var(--border)"}` }}>
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-xl p-5" style={{ background: "var(--bg-2)", border: "1px solid var(--border)" }}>
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <div>
                <div className="text-[14px] font-medium flex items-center gap-2"><Sparkles size={15} /> Imagini</div>
                <div className="text-[12.5px] text-[var(--ink-3)] mt-0.5">Mod demo (fără chei): imagini pe paleta ta. Poze + video AI reale = când conectezi MUAPI.</div>
              </div>
              <button onClick={generateAI} disabled={gen.loading}
                className="px-4 py-2.5 rounded-xl text-[13px] font-medium flex items-center gap-2 disabled:opacity-50"
                style={{ background: "#7C3AED", color: "#fff" }}>
                {gen.loading ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
                {gen.loading ? "Aplic…" : "Generează imagini (demo)"}
              </button>
            </div>
            {gen.msg && <p className="text-[12.5px] mt-3" style={{ color: gen.msg.startsWith("Eroare") ? "#DC2626" : "#059669" }}>{gen.msg}</p>}
            {(cfg.heroImage || cfg.heroVideo) && (
              <div className="flex gap-2 mt-3">
                {cfg.heroImage && <img src={cfg.heroImage} alt="" className="w-24 h-16 object-cover rounded-lg border border-[var(--border)]" />}
                {cfg.heroVideo && <span className="text-[12px] text-green-600 flex items-center gap-1"><Check size={13} /> video generat</span>}
              </div>
            )}
          </div>

          <div className="flex items-center justify-between gap-3">
            <button onClick={() => setStep(2)} className="px-4 py-2.5 rounded-xl text-[13px] flex items-center gap-1.5" style={{ border: "1px solid var(--border)", color: "var(--ink-2)" }}>
              <ArrowLeft size={14} /> Înapoi
            </button>
            <button onClick={openPreview}
              className="px-5 py-2.5 rounded-xl text-[13px] font-medium flex items-center gap-2"
              style={{ background: "var(--ink)", color: "var(--bg-2)" }}>
              <ExternalLink size={14} /> Vezi site-ul live
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return <div className="text-[11px] uppercase tracking-wider text-[var(--ink-3)] mb-2">{children}</div>;
}
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div><Label>{label}</Label>{children}</div>;
}
function Inp({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder?: string }) {
  return <input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
    className="w-full px-3 py-2 text-[13.5px] rounded-lg bg-[var(--bg)] border border-[var(--border)] focus:outline-none focus:ring-1 focus:ring-[var(--ink)]" />;
}
function Area({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return <textarea value={value} onChange={(e) => onChange(e.target.value)} rows={3}
    className="w-full px-3 py-2 text-[13.5px] rounded-lg bg-[var(--bg)] border border-[var(--border)] focus:outline-none focus:ring-1 focus:ring-[var(--ink)] resize-none" />;
}
function Nav({ onBack, onNext }: { onBack?: () => void; onNext: () => void }) {
  return (
    <div className="flex items-center justify-between gap-3 pt-2">
      {onBack ? <button onClick={onBack} className="px-4 py-2.5 rounded-xl text-[13px] flex items-center gap-1.5" style={{ border: "1px solid var(--border)", color: "var(--ink-2)" }}><ArrowLeft size={14} /> Înapoi</button> : <span />}
      <button onClick={onNext} className="px-5 py-2.5 rounded-xl text-[13px] font-medium flex items-center gap-2" style={{ background: "var(--ink)", color: "var(--bg-2)" }}>Continuă <ArrowRight size={14} /></button>
    </div>
  );
}
