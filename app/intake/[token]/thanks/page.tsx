import Link from "next/link";

export default function IntakeThanksPage() {
  return (
    <main className="min-h-screen flex items-center justify-center px-6 py-20">
      <div className="max-w-md text-center">
        <div className="w-14 h-14 mx-auto mb-6 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700 text-2xl">
          ✓
        </div>
        <h1 className="h-display text-3xl mb-3">Mulțumim!</h1>
        <p className="text-[15px] text-[var(--ink-2)] leading-relaxed mb-8">
          Am primit datele. Echipa noastră începe configurarea agentului și revine
          în maximum 24h cu următorii pași.
        </p>
        <Link href="/portal/implementation" className="text-[14px] text-[var(--ink)] hover:underline">
          ← Înapoi la portalul tău
        </Link>
      </div>
    </main>
  );
}
