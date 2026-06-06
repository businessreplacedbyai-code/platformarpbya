import Link from "next/link";

export function PromoStrip() {
  return (
    <div
      style={{
        background: "linear-gradient(90deg, #0A0807, #1c1a16)",
        color: "#F4EFE6",
        borderBottom: "1px solid rgba(230,201,163,0.18)",
      }}
    >
      <div className="max-w-6xl mx-auto px-4 py-2.5 flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-center text-[12px] md:text-[13px]">
        <span style={{ color: "#E6C9A3" }}>🔥</span>
        <span className="opacity-90">Site profesional la</span>
        <strong style={{ color: "#E6C9A3" }}>999 RON</strong>
        <span className="opacity-60 hidden sm:inline">(de la 1.499 RON)</span>
        <Link
          href="/website-premium#pachete"
          style={{ color: "#E6C9A3" }}
          className="font-medium hover:underline whitespace-nowrap"
        >
          profită acum →
        </Link>
      </div>
    </div>
  );
}
