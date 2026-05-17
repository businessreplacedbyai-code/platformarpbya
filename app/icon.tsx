import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #0A0A0A 0%, #1a1a1a 100%)",
          color: "#D4AF37",
          fontSize: 22,
          fontWeight: 800,
          fontFamily: "sans-serif",
          letterSpacing: "-0.04em",
          borderRadius: 6,
        }}
      >
        R
      </div>
    ),
    { ...size }
  );
}
