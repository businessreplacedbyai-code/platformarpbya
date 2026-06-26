import { requestExtra } from "../actions";

export const dynamic = "force-dynamic";
export const metadata = { title: "Extra & Contact · Contul tău" };

const ADDONS = [
  { name: "Minute voce extra", price: "$0.12–0.18 / min", note: "peste minutele incluse în plan" },
  { name: "Generări AI extra", price: "$1 / generare", note: "poze + video reale" },
  { name: "Agent / număr extra", price: "în funcție de plan", note: "adaugi când îți trebuie" },
];

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ sent?: string; err?: string }>;
}) {
  const sp = await searchParams;

  return (
    <div className="max-w-3xl">
      <header className="mb-8">
        <p className="eyebrow mb-2">Extra & Contact</p>
        <h1 className="h-display text-3xl md:text-4xl mb-1">Ai nevoie de mai mult?</h1>
        <p className="text-[14px] text-[var(--ink-3)]">Cumperi extra peste plan sau ne ceri ceva custom. Fără surprize — nimic nu se taxează fără acordul tău.</p>
      </header>

      {/* Add-ons */}
      <div className="grid sm:grid-cols-3 gap-4 mb-10">
        {ADDONS.map((a) => (
          <div key={a.name} className="rounded-2xl p-5" style={{ background: "var(--bg-2)", border: "1px solid var(--border)" }}>
            <div className="text-[14.5px] font-medium">{a.name}</div>
            <div className="text-[20px] font-semibold tracking-tight mt-1">{a.price}</div>
            <div className="text-[12.5px] text-[var(--ink-3)] mt-1">{a.note}</div>
          </div>
        ))}
      </div>

      {/* Contact custom */}
      <div className="rounded-2xl p-6" style={{ background: "var(--bg-2)", border: "1px solid var(--border)" }}>
        <h2 className="text-[16px] font-medium mb-1">Cere ceva în plus sau custom</h2>
        <p className="text-[13px] text-[var(--ink-3)] mb-4">
          Volume mari, integrări speciale, mai multe minute/agenți, sau vrei să-ți facem noi ceva pe comandă — scrie-ne aici și revenim rapid.
        </p>

        {sp.sent && (
          <div className="mb-4 text-[13px] rounded-xl px-4 py-3" style={{ background: "#ECFDF5", color: "#065F46", border: "1px solid #A7F3D0" }}>
            ✓ Cererea ta a fost trimisă. Revenim cât mai repede.
          </div>
        )}
        {sp.err === "empty" && (
          <div className="mb-4 text-[13px] rounded-xl px-4 py-3" style={{ background: "#FEF2F2", color: "#991B1B", border: "1px solid #FECACA" }}>
            Scrie un mesaj înainte de a trimite.
          </div>
        )}

        <form action={requestExtra} className="space-y-3">
          <textarea
            name="message"
            rows={5}
            required
            placeholder="Ex: am nevoie de 2000 de minute/lună + integrare cu sistemul meu de rezervări…"
            className="w-full px-3.5 py-3 text-[14px] rounded-xl bg-[var(--bg)] border border-[var(--border)] focus:outline-none focus:ring-1 focus:ring-[var(--ink)] resize-none"
          />
          <button type="submit" className="px-5 h-11 rounded-xl text-[13.5px] font-medium bg-[var(--ink)] text-[var(--bg-2)] hover:opacity-90 transition-opacity">
            Trimite cererea
          </button>
        </form>
      </div>
    </div>
  );
}
