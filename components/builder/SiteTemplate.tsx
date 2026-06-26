"use client";
import { SiteConfig, PALETTES, FONTS } from "./types";
import { ScrollVideo } from "./ScrollVideo";

// Randează site-ul generat din config (paletă proprie, independent de tema admin).
export function SiteTemplate({ config }: { config: SiteConfig }) {
  const p = PALETTES[config.paletteKey] ?? PALETTES.espresso;
  const f = FONTS[config.fontKey] ?? FONTS.serif;

  return (
    <div style={{ background: p.bg, color: p.ink, fontFamily: f.body, minHeight: "100vh" }}>
      {/* Nav */}
      <header
        style={{ position: "sticky", top: 0, zIndex: 50, backdropFilter: "blur(8px)", background: `${p.bg}cc`, borderBottom: `1px solid ${p.accent}22` }}
      >
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "16px 24px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontFamily: f.display, fontSize: 20, fontWeight: 700, letterSpacing: "0.04em" }}>{config.name || "Afacerea ta"}</span>
          <a href={config.phone ? `tel:${config.phone}` : "#contact"} style={{ background: p.accent, color: p.bg, padding: "9px 18px", borderRadius: 999, fontSize: 13, fontWeight: 600, textDecoration: "none" }}>
            {config.phone || "Contact"}
          </a>
        </div>
      </header>

      {/* Hero — cu video AI scroll-scrub dacă există */}
      {config.heroVideo ? (
        <ScrollVideo src={config.heroVideo} poster={config.heroImage}>
          <div style={{ textAlign: "center", maxWidth: 900 }}>
            <h1 style={{ fontFamily: f.display, fontSize: "clamp(2.4rem,7vw,5.5rem)", fontWeight: 800, lineHeight: 1.05, color: "#fff", textShadow: "0 8px 40px rgba(0,0,0,0.6)" }}>
              {config.tagline || config.name}
            </h1>
            <p style={{ marginTop: 20, fontSize: "clamp(1rem,2.5vw,1.4rem)", color: "rgba(255,255,255,0.85)" }}>{config.name} · {config.city}</p>
          </div>
        </ScrollVideo>
      ) : (
        <section style={{ position: "relative", minHeight: "92vh", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
          {config.heroImage && <div style={{ position: "absolute", inset: 0, background: `url(${config.heroImage}) center/cover` }} />}
          <div style={{ position: "absolute", inset: 0, background: `linear-gradient(to bottom, ${p.bg}99, ${p.bg})` }} />
          <div style={{ position: "relative", textAlign: "center", maxWidth: 900, padding: "0 24px" }}>
            <div style={{ display: "inline-block", color: p.accent, letterSpacing: "0.3em", textTransform: "uppercase", fontSize: 12, marginBottom: 18 }}>{config.type} · {config.city}</div>
            <h1 style={{ fontFamily: f.display, fontSize: "clamp(2.4rem,7vw,5.5rem)", fontWeight: 800, lineHeight: 1.05 }}>{config.tagline || config.name}</h1>
          </div>
        </section>
      )}

      {/* Despre */}
      <section style={{ maxWidth: 900, margin: "0 auto", padding: "110px 24px", textAlign: "center" }}>
        <div style={{ width: 48, height: 2, background: p.accent, margin: "0 auto 28px" }} />
        <h2 style={{ fontFamily: f.display, fontSize: "clamp(1.8rem,4vw,3rem)", fontWeight: 700, marginBottom: 22 }}>{config.name}</h2>
        <p style={{ fontSize: "clamp(1rem,2vw,1.25rem)", lineHeight: 1.7, opacity: 0.8 }}>{config.about}</p>
      </section>

      {/* Servicii */}
      <section style={{ background: p.soft, padding: "100px 24px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <h2 style={{ fontFamily: f.display, fontSize: "clamp(1.6rem,4vw,2.6rem)", fontWeight: 700, textAlign: "center", marginBottom: 50 }}>Ce oferim</h2>
          <div style={{ display: "grid", gap: 24, gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))" }}>
            {config.services.map((s, i) => (
              <div key={i} style={{ background: p.bg, borderRadius: 18, overflow: "hidden", border: `1px solid ${p.accent}22` }}>
                <div style={{ height: 180, background: s.img ? `url(${s.img}) center/cover` : `linear-gradient(135deg, ${p.accent}33, ${p.accent2}33)` }} />
                <div style={{ padding: "22px 22px 26px" }}>
                  <h3 style={{ fontFamily: f.display, fontSize: 22, fontWeight: 700, marginBottom: 8 }}>{s.name}</h3>
                  <p style={{ opacity: 0.7, lineHeight: 1.6, fontSize: 15 }}>{s.desc}</p>
                  {s.price && s.price !== "—" && <div style={{ marginTop: 14, color: p.accent, fontWeight: 700, fontSize: 18 }}>{s.price}</div>}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact */}
      <section id="contact" style={{ padding: "110px 24px", textAlign: "center" }}>
        <h2 style={{ fontFamily: f.display, fontSize: "clamp(2rem,5vw,3.4rem)", fontWeight: 800, marginBottom: 26 }}>Vino la noi</h2>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 28, justifyContent: "center", opacity: 0.85, fontSize: 16 }}>
          {config.phone && <a href={`tel:${config.phone}`} style={{ color: p.ink, textDecoration: "none" }}>☎ {config.phone}</a>}
          {config.address && <span>📍 {config.address}{config.city ? `, ${config.city}` : ""}</span>}
          {config.email && <a href={`mailto:${config.email}`} style={{ color: p.ink, textDecoration: "none" }}>✉ {config.email}</a>}
        </div>
        <a href={config.phone ? `tel:${config.phone}` : "#"} style={{ display: "inline-block", marginTop: 40, background: p.accent, color: p.bg, padding: "16px 40px", borderRadius: 999, fontWeight: 700, textDecoration: "none", fontSize: 16 }}>
          Contactează-ne
        </a>
      </section>

      <footer style={{ borderTop: `1px solid ${p.accent}22`, padding: "30px 24px", textAlign: "center", opacity: 0.5, fontSize: 13 }}>
        © {new Date().getFullYear()} {config.name} · Site creat cu ReplacedByAI
      </footer>
    </div>
  );
}
