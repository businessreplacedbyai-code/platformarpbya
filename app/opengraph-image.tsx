import { ImageResponse } from "next/og";

export const alt = "ReplacedByAI — 15 agenți AI pentru afaceri din România";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          background: "#0A0A0A",
          backgroundImage:
            "radial-gradient(circle at 18% 22%, rgba(167,139,250,0.35), transparent 45%), radial-gradient(circle at 82% 78%, rgba(244,114,182,0.28), transparent 50%), radial-gradient(circle at 50% 50%, rgba(103,232,249,0.18), transparent 60%)",
          fontFamily: "sans-serif",
          color: "#F5F5F0",
          padding: "72px 80px",
          position: "relative",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            fontSize: 22,
            color: "#D4AF37",
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            fontWeight: 600,
          }}
        >
          <div
            style={{
              width: 10,
              height: 10,
              borderRadius: 999,
              background: "#D4AF37",
              boxShadow: "0 0 24px #D4AF37",
            }}
          />
          ReplacedByAI · România
        </div>

        <div
          style={{
            marginTop: "auto",
            fontSize: 96,
            lineHeight: 1.04,
            fontWeight: 700,
            letterSpacing: "-0.03em",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <span>Afacerea ta nu mai are</span>
          <span>
            {"nevoie de "}
            <span
              style={{
                background: "linear-gradient(90deg, #D4AF37, #f472b6, #a78bfa)",
                backgroundClip: "text",
                color: "transparent",
              }}
            >
              angajați.
            </span>
          </span>
        </div>

        <div
          style={{
            marginTop: 28,
            fontSize: 28,
            color: "#A8A29E",
            display: "flex",
            gap: 24,
            alignItems: "center",
          }}
        >
          <span>15 agenți AI</span>
          <span style={{ color: "#44403C" }}>·</span>
          <span>24/7, fără greșeli</span>
        </div>

        <div
          style={{
            position: "absolute",
            bottom: 72,
            right: 80,
            fontSize: 22,
            color: "#78716C",
            letterSpacing: "0.08em",
          }}
        >
          replacedbyai.ro
        </div>
      </div>
    ),
    { ...size }
  );
}
