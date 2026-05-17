import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background:
            "radial-gradient(circle at 30% 25%, #1a1a1a 0%, #0A0A0A 70%)",
          color: "#D4AF37",
          fontSize: 120,
          fontWeight: 800,
          fontFamily: "sans-serif",
          letterSpacing: "-0.06em",
        }}
      >
        R
      </div>
    ),
    { ...size }
  );
}
