import Link from "next/link";

export function PromoStrip() {
  return (
    <div
      style={{
        background: "var(--ink)",
        color: "#f5f3ee",
        borderBottom: "1px solid rgba(212,175,55,0.18)",
      }}
    >
      <div className="max-w-6xl mx-auto px-4 py-2.5 flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-center text-[12px] md:text-[13px]">
        <span className="w-1.5 h-1.5 rounded-full pulse-dot" style={{ background: "var(--accent)", boxShadow: "0 0 8px var(--accent)" }} />
        <span className="opacity-80">Site profesional la</span>
        <strong style={{ color: "var(--accent)" }}>999 RON</strong>
        <span className="opacity-60 hidden sm:inline line-through">1.499 RON</span>
        <Link
          href="/website-premium#pachete"
          style={{ color: "var(--accent)" }}
          className="font-medium hover:underline whitespace-nowrap"
        >
          profită acum →
        </Link>
      </div>
    </div>
  );
}
