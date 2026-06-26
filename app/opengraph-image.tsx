import { ImageResponse } from "next/og";

export const alt = "ReplacedByAI — Agenți AI pentru afaceri din România";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Logo real încărcat prin fetch din URL public (fiabil pe Vercel — fs eșuează acolo).
async function getLogo(): Promise<string | null> {
  try {
    const res = await fetch("https://www.replacedbyai.ro/logo-mark.png");
    if (!res.ok) return null;
    const buf = await res.arrayBuffer();
    return `data:image/png;base64,${Buffer.from(buf).toString("base64")}`;
  } catch {
    return null;
  }
}

const BG = "#0A0807";
const CREAM = "#F4EFE6";
const AMBER = "#E6C9A3";
const MUTED = "#8A8780";

export default async function OGImage() {
  const logo = await getLogo();

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: BG,
          backgroundImage:
            "radial-gradient(circle at 82% 10%, rgba(230,201,163,0.22), transparent 46%), radial-gradient(circle at 10% 92%, rgba(58,74,90,0.34), transparent 52%)",
          fontFamily: "sans-serif",
          color: CREAM,
          padding: "68px 80px",
          position: "relative",
        }}
      >
        {/* cadru subtil */}
        <div
          style={{
            position: "absolute",
            top: 36,
            left: 36,
            right: 36,
            bottom: 36,
            border: "1px solid rgba(244,239,230,0.10)",
            borderRadius: 18,
            display: "flex",
          }}
        />

        {/* TOP — logo + brand */}
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          {logo && (
            <img src={logo} width={56} height={56} style={{ borderRadius: 14 }} />
          )}
          <div style={{ display: "flex", flexDirection: "column" }}>
            <span style={{ fontSize: 28, fontWeight: 600, letterSpacing: "-0.01em" }}>
              ReplacedByAI
            </span>
            <span
              style={{
                fontSize: 15,
                color: MUTED,
                letterSpacing: "0.18em",
                textTransform: "uppercase",
              }}
            >
              Agenți AI · România
            </span>
          </div>
        </div>

        {/* MIJLOC — eyebrow + headline */}
        <div style={{ display: "flex", flexDirection: "column" }}>
          <span
            style={{
              fontSize: 19,
              color: AMBER,
              letterSpacing: "0.26em",
              textTransform: "uppercase",
              marginBottom: 26,
            }}
          >
            2026 · era agenților AI
          </span>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              fontSize: 86,
              fontWeight: 600,
              lineHeight: 1.04,
              letterSpacing: "-0.035em",
            }}
          >
            <span style={{ display: "flex" }}>Afacerea ta nu mai</span>
            <span style={{ display: "flex" }}>
              <span>are nevoie de&nbsp;</span>
              <span style={{ color: AMBER }}>angajați.</span>
            </span>
          </div>
        </div>

        {/* JOS — features + url */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 18,
              fontSize: 24,
              color: MUTED,
            }}
          >
            <span>15 agenți AI</span>
            <span style={{ color: "#3A3933" }}>·</span>
            <span>24/7, fără greșeli</span>
            <span style={{ color: "#3A3933" }}>·</span>
            <span>de la 490 lei/lună</span>
          </div>
          <span style={{ fontSize: 25, color: AMBER, fontWeight: 500 }}>
            replacedbyai.ro →
          </span>
        </div>
      </div>
    ),
    { ...size }
  );
}
