import Link from "next/link";

export function PromoStrip() {
  return (
    <div
      style={{
        background: "linear-gradient(90deg, #4338ca, #4f46e5)",
        color: "#fff",
        borderBottom: "1px solid rgba(255,255,255,0.12)",
      }}
    >
      <div className="max-w-6xl mx-auto px-4 py-2.5 flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-center text-[12px] md:text-[13px]">
        <span>🔥</span>
        <span className="opacity-90">Site profesional la</span>
        <strong style={{ color: "#c7d2fe" }}>999 RON</strong>
        <span className="opacity-70 hidden sm:inline">(de la 1.499 RON)</span>
        <Link
          href="/website-premium#pachete"
          style={{ color: "#c7d2fe" }}
          className="font-medium hover:underline whitespace-nowrap"
        >
          profită acum →
        </Link>
      </div>
    </div>
  );
}
